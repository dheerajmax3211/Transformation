import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'motion/react';

export default function TaskCard({ title, description, isDone, onToggle, children }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden group ${
        isDone 
          ? 'bg-[#CCFF00]/5 border-[#CCFF00]/30 shadow-[0_0_20px_rgba(204,255,0,0.05)]' 
          : 'bg-zinc-900/40 backdrop-blur-md border-white/5 shadow-xl hover:border-white/10 hover:bg-zinc-900/60'
      }`}
    >
      {isDone && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-0 right-0 w-40 h-40 bg-[#CCFF00]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"
        />
      )}
      
      <div className="flex items-start gap-4 relative z-10">
        <motion.button 
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0 focus:outline-none transition-transform"
        >
          {isDone ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="text-[#CCFF00] w-8 h-8 drop-shadow-[0_0_10px_rgba(204,255,0,0.4)]" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <Circle className="text-zinc-600 w-8 h-8 group-hover:text-zinc-400 transition-colors" strokeWidth={2} />
          )}
        </motion.button>
        <div className="flex-1">
          <h3 className={`font-black text-xl uppercase tracking-tight transition-colors ${isDone ? 'text-zinc-500 line-through' : 'text-white group-hover:text-zinc-100'}`}>
            {title}
          </h3>
          {description && (
            <p className={`mt-2 text-sm font-medium leading-relaxed transition-colors ${isDone ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
              {description}
            </p>
          )}
          {children && (
            <div className={`mt-5 transition-opacity ${isDone ? 'opacity-70' : 'opacity-100'}`}>
              {children}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
