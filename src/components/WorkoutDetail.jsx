import { useState } from 'react';
import { getWorkoutPlan } from '../data/workoutPlan';
import ExerciseWeightInput from './ExerciseWeightInput';
import LiveWorkoutMode from './LiveWorkoutMode';
import { Play } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function WorkoutDetail({ dayType, weekNumber, dateString, isDone, onComplete }) {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const plan = getWorkoutPlan(weekNumber, dayType);

  if (dayType === 'REST') {
    return (
      <div className="text-zinc-500 text-sm mt-4 font-medium italic bg-zinc-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-inner">
        {plan.message}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {!isDone && (
        <button 
          onClick={() => setIsLiveMode(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#CCFF00] to-[#aacc00] text-black font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(204,255,0,0.2)] mb-6"
        >
          <Play size={20} fill="currentColor" /> START LIVE WORKOUT
        </button>
      )}

      {plan.exercises.map((ex, idx) => (
        <div key={idx} className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-5 border border-white/5 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#CCFF00] to-transparent opacity-50"></div>
          <div className="flex justify-between items-start pl-4">
            <div>
              <h4 className="font-black text-white text-lg uppercase tracking-tight">{ex.name}</h4>
              <p className="text-[10px] font-bold text-[#CCFF00] mt-1 uppercase tracking-widest">{ex.sets} SETS</p>
              {ex.note && <p className="text-[10px] text-zinc-400 mt-3 font-bold uppercase tracking-wider bg-black/50 px-3 py-1.5 rounded-xl inline-block border border-white/5">{ex.note}</p>}
            </div>
          </div>
          {ex.isWeighted && (
            <ExerciseWeightInput 
              exercise={ex} 
              dateString={dateString} 
              weekNumber={weekNumber}
              isDone={isDone}
            />
          )}
        </div>
      ))}

      <AnimatePresence>
        {isLiveMode && (
          <LiveWorkoutMode 
            plan={plan}
            dateString={dateString}
            weekNumber={weekNumber}
            onClose={() => setIsLiveMode(false)}
            onComplete={() => {
              setIsLiveMode(false);
              if (onComplete) onComplete();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
