import { NavLink } from 'react-router-dom';
import { Home, Calendar, Image as ImageIcon, LineChart, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Today' },
    { to: '/calendar', icon: Calendar, label: 'History' },
    { to: '/photos', icon: ImageIcon, label: 'Photos' },
    { to: '/graphs', icon: LineChart, label: 'Progress' },
    { to: '/plan', icon: BookOpen, label: 'Plan' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2 relative">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all ${
                isActive ? 'text-[#CCFF00]' : 'text-zinc-600 hover:text-zinc-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1 w-10 h-1 bg-[#CCFF00] rounded-full shadow-[0_0_15px_rgba(204,255,0,0.5)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className={`text-[9px] uppercase tracking-widest font-black transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
