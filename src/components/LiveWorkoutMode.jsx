import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, CheckCircle2, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

export default function LiveWorkoutMode({ plan, dateString, weekNumber, onClose, onComplete }) {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [logs, setLogs] = useState({}); // { [exName]: { [setNum]: { reps, weight } } }
  const supabase = getSupabase();

  const currentExercise = plan.exercises[currentExerciseIdx];
  const totalSets = currentExercise?.sets || 0;

  // Lock body scroll when Live Workout is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
      // Play a sound or vibrate here if possible
      if (navigator.vibrate) navigator.vibrate(200);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const handleLogSet = (reps, weight) => {
    setLogs(prev => ({
      ...prev,
      [currentExercise.name]: {
        ...(prev[currentExercise.name] || {}),
        [currentSet]: { reps, weight }
      }
    }));

    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1);
      setRestTimer(60); // Default 60s rest
      setIsResting(true);
    } else {
      // Move to next exercise or finish
      if (currentExerciseIdx < plan.exercises.length - 1) {
        setCurrentExerciseIdx(prev => prev + 1);
        setCurrentSet(1);
        setRestTimer(90); // Longer rest between exercises
        setIsResting(true);
      } else {
        // Workout complete
        handleFinishWorkout();
      }
    }
  };

  const handleFinishWorkout = async () => {
    // Save all logs to supabase
    if (supabase && Object.keys(logs).length > 0) {
      try {
        const logEntries = [];
        for (const [exName, sets] of Object.entries(logs)) {
          // Find max weight for this exercise
          let maxWeight = 0;
          for (const [setNum, data] of Object.entries(sets)) {
            if (data.weight > maxWeight) {
              maxWeight = data.weight;
            }
          }
          
          if (maxWeight > 0) {
            logEntries.push({
              log_date: dateString,
              exercise_name: exName,
              weight_kg: maxWeight,
              sets_completed: Object.keys(sets).length
            });
          }
        }

        if (logEntries.length > 0) {
          // Upsert logs
          for (const entry of logEntries) {
            await supabase
              .from('exercise_weight_log')
              .upsert({
                log_date: entry.log_date,
                exercise_name: entry.exercise_name,
                weight_kg: entry.weight_kg,
                sets_completed: entry.sets_completed
              }, { onConflict: 'log_date, exercise_name' });
          }
        }
      } catch (err) {
        console.error("Error saving live workout logs:", err);
      }
    }
    
    onComplete();
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentExercise) return null;

  return createPortal(
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-gradient-to-b from-zinc-950 to-black z-[100] flex flex-col font-sans overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/40 backdrop-blur-md">
        <div>
          <h2 className="text-[#CCFF00] font-black uppercase tracking-widest text-xs">LIVE WORKOUT</h2>
          <p className="text-white font-bold">{plan.title}</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-zinc-400 hover:text-white transition-colors shadow-inner">
          <X size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/5 w-full">
        <motion.div 
          className="h-full bg-[#CCFF00]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentExerciseIdx) / plan.exercises.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div 
              key="rest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center relative"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="text-zinc-500 font-black uppercase tracking-widest mb-8 relative z-10">REST & RECOVER</h3>
              <div className="relative w-64 h-64 flex items-center justify-center mb-12 relative z-10">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="4" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke="#CCFF00" strokeWidth="4" strokeLinecap="round"
                    initial={{ strokeDasharray: "283 283", strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: 283 - (283 * (restTimer / 60)) }} // Assuming 60s max for visual
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>
                <span className="text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]">{formatTime(restTimer)}</span>
              </div>
              
              <div className="text-center mb-8 relative z-10">
                <p className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">UP NEXT:</p>
                <p className="text-white font-black text-2xl uppercase tracking-tight">{currentExercise.name}</p>
                <p className="text-[#CCFF00] text-sm font-black uppercase tracking-widest mt-2">SET {currentSet} OF {totalSets}</p>
              </div>

              <button 
                onClick={skipRest}
                className="px-8 py-4 rounded-full bg-black/50 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/5 hover:text-[#CCFF00] transition-colors flex items-center gap-2 shadow-inner relative z-10"
              >
                <Play size={18} /> SKIP REST
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="exercise"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <div className="inline-block px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-[10px] font-black uppercase tracking-widest mb-4 border border-[#CCFF00]/20">
                  EXERCISE {currentExerciseIdx + 1} OF {plan.exercises.length}
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none mb-4">{currentExercise.name}</h1>
                {currentExercise.note && (
                  <p className="text-zinc-400 text-sm font-medium bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner">{currentExercise.note}</p>
                )}
              </div>

              <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl mb-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h3 className="text-white font-black uppercase tracking-widest">SET {currentSet} <span className="text-zinc-500">/ {totalSets}</span></h3>
                  {currentExercise.isWeighted && <span className="text-[#CCFF00] text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-[#CCFF00]/10 rounded-md border border-[#CCFF00]/20">WEIGHTED</span>}
                </div>

                <div className="relative z-10">
                  <LogInputForm 
                    isWeighted={currentExercise.isWeighted} 
                    onLog={(reps, weight) => handleLogSet(reps, weight)} 
                  />
                </div>
              </div>

              {/* Navigation controls if needed */}
              <div className="flex justify-between mt-6">
                <button 
                  onClick={() => {
                    if (currentSet > 1) setCurrentSet(s => s - 1);
                    else if (currentExerciseIdx > 0) {
                      setCurrentExerciseIdx(i => i - 1);
                      setCurrentSet(plan.exercises[currentExerciseIdx - 1].sets);
                    }
                  }}
                  disabled={currentExerciseIdx === 0 && currentSet === 1}
                  className="p-4 rounded-full bg-black/50 border border-white/5 text-zinc-400 disabled:opacity-50 hover:text-white hover:bg-white/5 transition-colors shadow-inner"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => handleLogSet(0, 0)} // Skip set
                  className="p-4 rounded-full bg-black/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors shadow-inner"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>,
    document.body
  );
}

function LogInputForm({ isWeighted, onLog }) {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLog(parseInt(reps) || 0, parseFloat(weight) || 0);
    setReps('');
    setWeight('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">REPS</label>
          <input 
            type="number" 
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-4 text-white text-2xl font-black text-center focus:outline-none focus:border-[#CCFF00] transition-colors shadow-inner"
            placeholder="0"
            required
          />
        </div>
        {isWeighted ? (
          <div>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">WEIGHT (KG)</label>
            <input 
              type="number" 
              step="0.5"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-4 text-white text-2xl font-black text-center focus:outline-none focus:border-[#CCFF00] transition-colors shadow-inner"
              placeholder="0.0"
              required
            />
          </div>
        ) : (
          <div className="opacity-50">
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">WEIGHT</label>
            <div className="w-full bg-black/50 border border-white/5 rounded-2xl px-4 py-4 text-zinc-600 text-2xl font-black text-center shadow-inner">
              BW
            </div>
          </div>
        )}
      </div>
      <button 
        type="submit"
        className="w-full py-4 rounded-2xl bg-[#CCFF00] text-black font-black uppercase tracking-widest hover:bg-[#b3e600] transition-colors mt-4 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
      >
        <CheckCircle2 size={20} /> Log Set
      </button>
    </form>
  );
}
