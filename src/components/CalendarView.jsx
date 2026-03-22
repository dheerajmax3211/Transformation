import { useState, useEffect } from 'react';
import { generateSchedule } from '../data/schedule';
import { getSupabase } from '../lib/supabase';
import { format, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function CalendarView() {
  const [logs, setLogs] = useState({});
  const [exerciseLogs, setExerciseLogs] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const schedule = generateSchedule();
  const supabase = getSupabase();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('daily_log').select('*');
      if (data) {
        const logMap = {};
        data.forEach(log => {
          logMap[log.log_date] = log;
        });
        setLogs(logMap);
      }

      const { data: exData } = await supabase.from('exercise_weight_log').select('*');
      if (exData) {
        const exMap = {};
        exData.forEach(log => {
          if (!exMap[log.log_date]) exMap[log.log_date] = [];
          exMap[log.log_date].push(log);
        });
        setExerciseLogs(exMap);
      }
    };
    fetchLogs();
  }, [supabase]);

  // Group schedule by month
  const months = [];
  let currentMonth = null;
  
  schedule.forEach(day => {
    const monthStr = format(day.date, 'MMMM yyyy');
    if (monthStr !== currentMonth) {
      currentMonth = monthStr;
      months.push({ name: monthStr, days: [] });
    }
    months[months.length - 1].days.push(day);
  });

  const getDayColor = (day) => {
    const log = logs[day.dateString];
    const isPast = isBefore(day.date, new Date()) || isToday(day.date);
    
    if (!isPast) return 'bg-zinc-900/40 text-zinc-600 border border-white/5'; // Future
    
    if (!log) return 'bg-red-950/30 text-red-500 border border-red-900/50'; // Missed
    
    const requiredTasks = day.isRestDay ? 4 : 5;
    const completedTasks = [
      log.morning_walk_done,
      log.breakfast_done,
      log.lunch_done,
      log.dinner_done,
      ...(day.isRestDay ? [] : [log.workout_done])
    ].filter(Boolean).length;

    if (completedTasks === requiredTasks) {
      return 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 shadow-[0_0_15px_rgba(204,255,0,0.15)]'; // Fully completed
    } else if (completedTasks > 0) {
      return 'bg-amber-950/30 text-amber-400 border border-amber-900/50'; // Partially completed
    } else {
      return 'bg-red-950/30 text-red-500 border border-red-900/50'; // Missed
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-transparent font-sans pb-24"
    >
      <div className="p-4 max-w-md mx-auto space-y-6">
        <h1 className="text-4xl font-black text-white mb-8 pt-4 uppercase tracking-tight">HISTORY</h1>
        
        <div className="space-y-8">
          {months.map(month => {
            // Calculate padding for the first day of the month
            const firstDay = month.days[0].date;
            const startPadding = getDay(startOfMonth(firstDay)); // 0 is Sunday
            
            return (
              <div key={month.name} className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6 relative z-10">{month.name}</h2>
                
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 relative z-10">
                  <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 relative z-10">
                  {Array.from({ length: startPadding }).map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square"></div>
                  ))}
                  
                  {month.days.map(day => {
                    const isCurrentDay = isToday(day.date);
                    return (
                      <button
                        key={day.dateString}
                        onClick={() => setSelectedDay(day)}
                        className={`
                          aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 active:scale-95 hover:scale-110 hover:shadow-lg hover:z-10
                          ${getDayColor(day)}
                          ${isCurrentDay ? 'ring-2 ring-[#CCFF00] ring-offset-2 ring-offset-zinc-900/40' : ''}
                        `}
                      >
                        {format(day.date, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Day Summary */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#050505]/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-sm relative shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-10"
                >
                  ✕
                </button>
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{selectedDay.displayDate}</h3>
                  <p className="text-[10px] font-bold text-[#CCFF00] uppercase tracking-widest mb-8">DAY {selectedDay.dayNumber} • {selectedDay.workoutType}</p>
                  
                  {logs[selectedDay.dateString] ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">BODY WEIGHT</div>
                          <div className="text-2xl font-mono font-black text-white">
                            {logs[selectedDay.dateString].body_weight_kg ? `${logs[selectedDay.dateString].body_weight_kg} KG` : '--'}
                          </div>
                        </div>
                        <div className="bg-black/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">WORKOUT</div>
                          <div className={`text-2xl font-black ${logs[selectedDay.dateString].workout_done ? 'text-[#CCFF00]' : 'text-red-500'}`}>
                            {logs[selectedDay.dateString].workout_done ? 'DONE' : 'MISSED'}
                          </div>
                        </div>
                      </div>
                      
                      {logs[selectedDay.dateString].photo_url && (
                        <div className="mt-6">
                          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3">PROGRESS PHOTO</div>
                          <img 
                            src={logs[selectedDay.dateString].photo_url} 
                            alt="Progress" 
                            className="w-full h-64 object-cover rounded-2xl border border-white/10 shadow-lg"
                          />
                        </div>
                      )}

                      {exerciseLogs[selectedDay.dateString] && exerciseLogs[selectedDay.dateString].length > 0 && (
                        <div className="mt-6">
                          <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3">EXERCISE WEIGHTS</div>
                          <div className="space-y-2">
                            {exerciseLogs[selectedDay.dateString].map(ex => (
                              <div key={ex.exercise_name} className="bg-black/50 p-4 rounded-xl border border-white/5 flex justify-between items-center shadow-inner">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">{ex.exercise_name}</span>
                                <span className="text-[#CCFF00] font-mono font-black text-lg">{ex.weight_kg} KG</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-600 font-bold uppercase tracking-widest text-xs">
                      NO DATA LOGGED FOR THIS DAY.
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
