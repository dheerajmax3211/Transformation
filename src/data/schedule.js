import { addDays, format, getDay, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

// 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday
const WORKOUT_TYPES = {
  1: 'REST',
  2: 'PUSH',
  3: 'PULL',
  4: 'LEGS',
  5: 'PUSH',
  6: 'PULL',
  0: 'LEGS'
};

export const getChallengeConfig = () => {
  const storedStart = localStorage.getItem('startDate');
  const storedDuration = localStorage.getItem('durationDays');
  
  const startDate = storedStart ? parseISO(storedStart) : startOfDay(new Date());
  const totalDays = storedDuration ? parseInt(storedDuration) : 120;
  
  return { startDate, totalDays };
};

export const generateSchedule = () => {
  const { startDate, totalDays } = getChallengeConfig();
  const schedule = [];
  
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i);
    const dayOfWeek = getDay(date);
    const weekNumber = Math.floor(i / 7) + 1;
    
    schedule.push({
      dayNumber: i + 1,
      date: date,
      dateString: format(date, 'yyyy-MM-dd'),
      displayDate: format(date, 'EEEE, MMMM d'),
      weekNumber: weekNumber,
      workoutType: WORKOUT_TYPES[dayOfWeek],
      isRestDay: dayOfWeek === 1
    });
  }
  return schedule;
};

export const getDayInfo = (dateString) => {
  const schedule = generateSchedule();
  return schedule.find(d => d.dateString === dateString) || null;
};

export const getCurrentDayInfo = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const info = getDayInfo(today);
  // If today is outside the bounds, return the first day or last day
  if (!info) {
    const schedule = generateSchedule();
    const { startDate } = getChallengeConfig();
    const now = new Date();
    if (now < startDate) return schedule[0];
    return schedule[schedule.length - 1];
  }
  return info;
};

export const getWeekNumber = (dateString) => {
  const info = getDayInfo(dateString);
  return info ? info.weekNumber : 1;
};
