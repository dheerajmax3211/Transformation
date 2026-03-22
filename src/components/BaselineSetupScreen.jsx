import { useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { WEIGHTED_EXERCISES } from '../data/workoutPlan';
import { Dumbbell, ArrowRight } from 'lucide-react';

export default function BaselineSetupScreen({ onComplete }) {
  const [weights, setWeights] = useState({
    [WEIGHTED_EXERCISES[0]]: '',
    [WEIGHTED_EXERCISES[1]]: '',
    [WEIGHTED_EXERCISES[2]]: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = getSupabase();
    
    try {
      const inserts = Object.entries(weights).map(([exercise_name, weight_kg]) => ({
        exercise_name,
        starting_weight_kg: parseFloat(weight_kg)
      }));

      const { error: insertError } = await supabase
        .from('exercise_baseline')
        .upsert(inserts);

      if (insertError) throw insertError;
      
      onComplete();
    } catch (err) {
      setError('Failed to save baseline weights. Check your Supabase connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#CCFF00]/10 to-transparent pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#CCFF00]/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900/80 border border-[#CCFF00]/30 text-[#CCFF00] mb-6 shadow-[0_0_30px_rgba(204,255,0,0.15)]">
            <Dumbbell size={32} />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-3">Set Your Baseline</h1>
          <p className="text-zinc-400 text-sm font-medium">
            What weight can you comfortably lift for 3 sets of 10 without struggling? Be honest.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="space-y-5 relative z-10">
            {WEIGHTED_EXERCISES.map((exercise) => (
              <div key={exercise}>
                <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">{exercise} (KG)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={weights[exercise]}
                  onChange={(e) => setWeights({ ...weights, [exercise]: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-all placeholder:text-zinc-700 shadow-inner"
                  placeholder="e.g. 5.0"
                  required
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#CCFF00] hover:bg-[#b3e600] disabled:opacity-50 text-black font-black uppercase tracking-wider py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] flex items-center justify-center gap-2 mt-8"
          >
            {loading ? 'Saving...' : (
              <>
                Start Journey <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
