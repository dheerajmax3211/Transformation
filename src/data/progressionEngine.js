import { getSupabase } from '../lib/supabase';
import { generateSchedule } from './schedule';

export const calculateRecommendedWeight = (startingWeight, weekNumber, completionRates) => {
  // completionRates is an array of completion rates for previous weeks (0.0 to 1.0)
  // e.g. [1.0, 0.83, 0.5] for weeks 1, 2, 3
  
  let effectiveWeek = weekNumber;
  
  // Apply consistency modifier
  // For each past week, if completion < 50%, we effectively lose a week of progress and drop weight
  // If completion 50-83%, we hold progress (effective week doesn't increase)
  // If completion >= 83%, we gain progress normally
  
  let penalty = 0;
  
  for (let i = 0; i < weekNumber - 1; i++) {
    const rate = completionRates[i] || 0;
    if (rate < 0.5) {
      penalty += 0.5;
      effectiveWeek -= 1;
    } else if (rate < 0.83) {
      effectiveWeek -= 1;
    }
  }
  
  // Ensure effectiveWeek is at least 1
  effectiveWeek = Math.max(1, effectiveWeek);
  
  const rawWeight = startingWeight * (1 + 0.22 * Math.log(effectiveWeek)) - penalty;
  
  // Ensure we don't drop below a minimum reasonable weight (e.g. 1kg)
  const finalWeight = Math.max(1, rawWeight);
  
  return Math.round(finalWeight * 2) / 2;
};

// Simple version without consistency modifier for the charts (ideal curve)
export const calculateIdealWeight = (startingWeight, weekNumber) => {
  const rawWeight = startingWeight * (1 + 0.22 * Math.log(weekNumber));
  return Math.round(rawWeight * 2) / 2;
};

export const getCompletionRates = async (currentWeekNumber) => {
  if (currentWeekNumber <= 1) return [];
  
  const supabase = getSupabase();
  const schedule = generateSchedule();
  
  // Get all logs up to the end of the previous week
  const { data: logs } = await supabase
    .from('daily_log')
    .select('log_date, workout_done');
    
  const logMap = {};
  if (logs) {
    logs.forEach(log => {
      logMap[log.log_date] = log.workout_done;
    });
  }
  
  const rates = [];
  for (let w = 1; w < currentWeekNumber; w++) {
    // A week has 6 workout days (Sunday is rest)
    const daysInWeek = schedule.filter(d => d.weekNumber === w && !d.isRestDay);
    let completed = 0;
    daysInWeek.forEach(d => {
      if (logMap[d.dateString]) completed++;
    });
    rates.push(completed / 6);
  }
  
  return rates;
};

