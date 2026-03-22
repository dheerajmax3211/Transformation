import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { calculateRecommendedWeight, getCompletionRates } from '../data/progressionEngine';

export default function ExerciseWeightInput({ exercise, dateString, weekNumber, isDone }) {
  const [recommendedWeight, setRecommendedWeight] = useState(null);
  const [actualWeight, setActualWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch baseline
        const { data: baselineData } = await supabase
          .from('exercise_baseline')
          .select('starting_weight_kg')
          .eq('exercise_name', exercise.name)
          .single();

        let recWeight = null;
        if (baselineData) {
          const completionRates = await getCompletionRates(weekNumber);
          recWeight = calculateRecommendedWeight(baselineData.starting_weight_kg, weekNumber, completionRates);
          setRecommendedWeight(recWeight);
        }

        // Fetch logged weight for today
        const { data: logData } = await supabase
          .from('exercise_weight_log')
          .select('weight_kg')
          .eq('log_date', dateString)
          .eq('exercise_name', exercise.name)
          .single();

        if (logData) {
          setActualWeight(logData.weight_kg);
        } else if (recWeight !== null) {
          // Pre-fill with recommended
          setActualWeight(recWeight);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [exercise.name, dateString, weekNumber, supabase]);

  const handleSave = async (val) => {
    const weight = parseFloat(val);
    if (isNaN(weight)) return;
    
    try {
      await supabase
        .from('exercise_weight_log')
        .upsert({
          log_date: dateString,
          exercise_name: exercise.name,
          weight_kg: weight,
          sets_completed: exercise.sets
        }, { onConflict: 'log_date, exercise_name' });
    } catch (err) {
      console.error("Failed to save weight", err);
    }
  };

  if (loading) return <div className="h-14 animate-pulse bg-black/50 rounded-2xl mt-4 border border-white/5"></div>;

  return (
    <div className="mt-5 bg-black/50 p-5 rounded-2xl border border-white/5 flex items-center justify-between ml-4 shadow-inner">
      <div>
        <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">TARGET</div>
        <div className="text-[#CCFF00] font-mono font-black text-xl">{recommendedWeight ? `${recommendedWeight} KG` : '---'}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">ACTUAL</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              value={actualWeight}
              onChange={(e) => {
                setActualWeight(e.target.value);
              }}
              onBlur={(e) => handleSave(e.target.value)}
              disabled={isDone}
              className="w-24 bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-white text-center font-mono font-bold focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] disabled:opacity-50 transition-all shadow-inner"
            />
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">KG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
