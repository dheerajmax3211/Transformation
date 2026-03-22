import { useState } from 'react';
import { mealPlan } from '../data/mealPlan';
import { getWorkoutPlan } from '../data/workoutPlan';
import { motion } from 'motion/react';

export default function PlanOverview() {
  const [activeTab, setActiveTab] = useState('meals');

  const roadmap = [
    {
      month: "Month 1",
      title: "Foundation Phase",
      desc: "Your body is adapting to the training stimulus. Expect soreness, faster fatigue, and noticeable strength increases by Week 3. Visual changes are subtle — your face will start to lean out slightly. Do not skip days this month; the neurological adaptation happening now is the prerequisite for all future muscle growth."
    },
    {
      month: "Month 2",
      title: "Emergence Phase",
      desc: "Shoulders will appear rounder, arms will fill out, and your waistline will visibly reduce. People around you will begin to notice. This is the most motivating month — use that momentum."
    },
    {
      month: "Month 3",
      title: "Acceleration Phase",
      desc: "Clear definition in arms, shoulders, and chest. Midsection noticeably flatter. Jawline sharper as overall body fat drops. Your clothes will fit differently."
    },
    {
      month: "Month 4",
      title: "Peak Phase",
      desc: "Visible ab outlines (upper abs especially), defined arms, broader back silhouette, and a physique that reads as \"athletic\" to anyone who sees you. You will look significantly larger and more defined."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-transparent font-sans pb-24"
    >
      <div className="p-4 max-w-md mx-auto space-y-6">
        <h1 className="text-4xl font-black text-white mb-8 pt-4 uppercase tracking-tight">PLAN OVERVIEW</h1>

        {/* Tabs */}
        <div className="flex bg-zinc-900/40 backdrop-blur-md rounded-2xl p-1.5 mb-8 border border-white/5 shadow-xl relative z-10">
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'meals' ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'text-zinc-500 hover:text-white'
            }`}
          >
            NUTRITION
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === 'workouts' ? 'bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'text-zinc-500 hover:text-white'
            }`}
          >
            TRAINING
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 relative z-10">
          {activeTab === 'meals' && (
            <>
              <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#CCFF00] to-transparent opacity-50"></div>
                <h3 className="text-sm font-black text-[#CCFF00] uppercase tracking-widest mb-3">{mealPlan.breakfast.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">{mealPlan.breakfast.description}</p>
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#CCFF00] to-transparent opacity-50"></div>
                <h3 className="text-sm font-black text-[#CCFF00] uppercase tracking-widest mb-3">{mealPlan.lunch.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">{mealPlan.lunch.description}</p>
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#CCFF00] to-transparent opacity-50"></div>
                <h3 className="text-sm font-black text-[#CCFF00] uppercase tracking-widest mb-3">{mealPlan.dinner.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">{mealPlan.dinner.description}</p>
              </div>
              <div className="bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest mb-2">DAILY TARGETS</h3>
                <p className="text-white text-sm font-bold">{mealPlan.summary}</p>
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">SUPPLEMENTS</h3>
                <p className="text-zinc-300 text-sm font-medium">{mealPlan.creatine}</p>
              </div>
            </>
          )}

          {activeTab === 'workouts' && (
            <>
              <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6 relative z-10">WEEKLY SPLIT</h2>
                <ul className="space-y-3 text-sm font-bold relative z-10">
                  <li className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-zinc-500 uppercase tracking-widest text-[10px]">MONDAY</span> <span className="text-zinc-400 uppercase tracking-widest text-xs">REST & WALK</span></li>
                  <li className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-zinc-500 uppercase tracking-widest text-[10px]">TUESDAY</span> <span className="text-[#CCFF00] uppercase tracking-widest text-xs">PUSH</span></li>
                  <li className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-zinc-500 uppercase tracking-widest text-[10px]">WEDNESDAY</span> <span className="text-[#CCFF00] uppercase tracking-widest text-xs">PULL</span></li>
                  <li className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-zinc-500 uppercase tracking-widest text-[10px]">THURSDAY</span> <span className="text-[#CCFF00] uppercase tracking-widest text-xs">LEGS & CORE</span></li>
                  <li className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-zinc-500 uppercase tracking-widest text-[10px]">FRIDAY</span> <span className="text-[#CCFF00] uppercase tracking-widest text-xs">PUSH</span></li>
                  <li className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-zinc-500 uppercase tracking-widest text-[10px]">SATURDAY</span> <span className="text-[#CCFF00] uppercase tracking-widest text-xs">PULL</span></li>
                  <li className="flex justify-between items-center bg-black/50 p-4 rounded-2xl border border-white/5 shadow-inner"><span className="text-zinc-500 uppercase tracking-widest text-[10px]">SUNDAY</span> <span className="text-[#CCFF00] uppercase tracking-widest text-xs">LEGS & CORE</span></li>
                </ul>
              </div>

              <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8 relative z-10 flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#CCFF00] rounded-full shadow-[0_0_10px_rgba(204,255,0,0.5)]"></span>
                  ROADMAP
                </h2>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-[#CCFF00] before:via-zinc-800 before:to-transparent z-10">
                  {roadmap.map((phase, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#050505] bg-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-125"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] bg-black/50 p-6 rounded-2xl border border-white/5 shadow-lg backdrop-blur-sm group-hover:border-white/10 transition-all group-hover:-translate-y-1 group-hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#CCFF00] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center justify-between space-x-2 mb-3">
                          <div className="font-mono font-black text-white uppercase tracking-widest text-xs bg-white/5 px-2 py-1 rounded-md">{phase.month}</div>
                        </div>
                        <div className="text-sm font-black text-[#CCFF00] uppercase tracking-widest mb-3">{phase.title}</div>
                        <div className="text-xs text-zinc-400 leading-relaxed font-medium">{phase.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
