import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { generateSchedule, getChallengeConfig } from '../data/schedule';
import { calculateIdealWeight } from '../data/progressionEngine';
import { WEIGHTED_EXERCISES } from '../data/workoutPlan';
import { AreaChart, Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import { motion } from 'motion/react';

export default function GraphsScreen() {
  const [bodyWeightData, setBodyWeightData] = useState([]);
  const [exerciseData, setExerciseData] = useState({});
  const [stats, setStats] = useState({ current: 0, start: 0, daysLeft: 0, goal: 0 });
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();
  const schedule = generateSchedule();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { startDate, totalDays } = getChallengeConfig();
      const endDate = addDays(startDate, totalDays);
      const storedStartWeight = localStorage.getItem('startWeight');
      const storedGoalWeight = localStorage.getItem('goalWeight');
      
      const initialStartWeight = storedStartWeight ? parseFloat(storedStartWeight) : 0;
      const goalWeight = storedGoalWeight ? parseFloat(storedGoalWeight) : 0;

      // 1. Fetch Body Weight
      const { data: bwLogs } = await supabase
        .from('daily_log')
        .select('log_date, body_weight_kg')
        .not('body_weight_kg', 'is', null)
        .order('log_date', { ascending: true });

      if (bwLogs && bwLogs.length > 0) {
        const formattedBw = bwLogs.map(log => ({
          date: format(parseISO(log.log_date), 'MMM d'),
          weight: parseFloat(log.body_weight_kg)
        }));
        setBodyWeightData(formattedBw);
        
        const currentWeight = formattedBw[formattedBw.length - 1].weight;
        const daysLeft = Math.max(0, differenceInDays(endDate, new Date()));
        
        setStats({ current: currentWeight, start: initialStartWeight, daysLeft, goal: goalWeight });
      } else {
        const daysLeft = Math.max(0, differenceInDays(endDate, new Date()));
        setStats({ current: initialStartWeight, start: initialStartWeight, daysLeft, goal: goalWeight });
      }

      // 2. Fetch Exercise Baseline
      const { data: baselines } = await supabase.from('exercise_baseline').select('*');
      const baselineMap = {};
      if (baselines) {
        baselines.forEach(b => {
          baselineMap[b.exercise_name] = b.starting_weight_kg;
        });
      }

      // 3. Fetch Exercise Logs
      const { data: exLogs } = await supabase
        .from('exercise_weight_log')
        .select('log_date, exercise_name, weight_kg')
        .order('log_date', { ascending: true });

      const exDataMap = {};
      WEIGHTED_EXERCISES.forEach(ex => {
        exDataMap[ex] = [];
      });

      if (exLogs && baselines) {
        // Group logs by exercise
        const logsByEx = {};
        exLogs.forEach(log => {
          if (!logsByEx[log.exercise_name]) logsByEx[log.exercise_name] = [];
          logsByEx[log.exercise_name].push(log);
        });

        // For each exercise, create a timeline combining actual and recommended
        WEIGHTED_EXERCISES.forEach(ex => {
          const startingWeight = baselineMap[ex];
          if (!startingWeight) return;

          const exTimeline = [];
          const logsForEx = logsByEx[ex] || [];
          
          // Only plot points where the user actually logged a workout for this exercise
          logsForEx.forEach(log => {
            const dayInfo = schedule.find(d => d.dateString === log.log_date);
            if (!dayInfo) return;
            
            exTimeline.push({
              date: format(parseISO(log.log_date), 'MMM d'),
              actual: parseFloat(log.weight_kg),
              recommended: calculateIdealWeight(startingWeight, dayInfo.weekNumber)
            });
          });
          
          exDataMap[ex] = exTimeline;
        });
      }

      setExerciseData(exDataMap);
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CCFF00]"></div>
      </div>
    );
  }

  const weightDiff = (stats.current - stats.start).toFixed(1);
  const isGain = stats.current > stats.start;

  // Calculate domain for body weight chart to ensure start and goal are visible
  const minWeight = Math.min(stats.start, stats.goal, ...bodyWeightData.map(d => d.weight)) - 2;
  const maxWeight = Math.max(stats.start, stats.goal, ...bodyWeightData.map(d => d.weight)) + 2;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-transparent font-sans pb-24"
    >
      <div className="p-4 max-w-md mx-auto space-y-6">
        <h1 className="text-4xl font-black text-white mb-8 pt-4 uppercase tracking-tight">PROGRESS</h1>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 text-center shadow-xl">
            <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">CURRENT</div>
            <div className="text-2xl font-mono font-black text-white">{stats.current ? `${stats.current}kg` : '--'}</div>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 text-center shadow-xl">
            <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">CHANGE</div>
            <div className={`text-2xl font-mono font-black ${isGain ? 'text-red-400' : 'text-[#CCFF00]'}`}>
              {stats.current ? `${isGain ? '+' : ''}${weightDiff}kg` : '--'}
            </div>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 text-center shadow-xl">
            <div className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">DAYS LEFT</div>
            <div className="text-2xl font-mono font-black text-[#CCFF00]">{stats.daysLeft}</div>
          </div>
        </div>

        {/* Body Weight Chart */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 relative z-10">BODY WEIGHT</h2>
          {bodyWeightData.length > 0 ? (
            <div className="h-64 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bodyWeightData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    minTickGap={20}
                    fontWeight="bold"
                  />
                  <YAxis 
                    domain={[minWeight, maxWeight]} 
                    stroke="#71717a" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickCount={8}
                    fontWeight="bold"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', borderColor: '#27272a', borderRadius: '16px', color: '#ffffff', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#CCFF00', fontFamily: 'monospace' }}
                  />
                  <ReferenceLine y={stats.goal} label={{ position: 'insideTopLeft', value: 'GOAL', fill: '#CCFF00', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} stroke="#CCFF00" strokeDasharray="3 3" opacity={0.5} />
                  <ReferenceLine y={stats.start} label={{ position: 'insideBottomLeft', value: 'START', fill: '#71717a', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} stroke="#71717a" strokeDasharray="3 3" opacity={0.5} />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#ffffff" 
                    strokeWidth={3} 
                    fillOpacity={1}
                    fill="url(#colorWeight)"
                    dot={{ r: 4, fill: '#050505', strokeWidth: 2, stroke: '#ffffff' }} 
                    activeDot={{ r: 6, fill: '#CCFF00', stroke: '#050505', strokeWidth: 2 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-zinc-600 text-xs font-bold uppercase tracking-widest relative z-10">NO WEIGHT DATA LOGGED YET.</div>
          )}
        </div>

        {/* Exercise Charts */}
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">STRENGTH PROGRESSION</h2>
          
          {WEIGHTED_EXERCISES.map(ex => (
            <div key={ex} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00]/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 relative z-10">{ex}</h3>
              {exerciseData[ex] && exerciseData[ex].length > 0 ? (
                <div className="h-48 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={exerciseData[ex]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`colorStrength-${ex}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        minTickGap={20}
                        fontWeight="bold"
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        domain={['auto', 'auto']}
                        fontWeight="bold"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050505', borderColor: '#27272a', borderRadius: '16px', color: '#ffffff', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                        itemStyle={{ fontFamily: 'monospace' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }} />
                      <Area 
                        name="ACTUAL"
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#CCFF00" 
                        strokeWidth={3} 
                        fillOpacity={1}
                        fill={`url(#colorStrength-${ex})`}
                        dot={{ r: 4, fill: '#050505', strokeWidth: 2, stroke: '#CCFF00' }} 
                        activeDot={{ r: 6, fill: '#CCFF00', stroke: '#050505', strokeWidth: 2 }}
                      />
                      <Line 
                        name="TARGET"
                        type="monotone" 
                        dataKey="recommended" 
                        stroke="#71717a" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={false} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-zinc-600 text-xs font-bold uppercase tracking-widest relative z-10">NO DATA LOGGED YET.</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
