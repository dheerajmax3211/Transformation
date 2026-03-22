import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getSupabase } from './lib/supabase';
import SetupScreen from './components/SetupScreen';
import BaselineSetupScreen from './components/BaselineSetupScreen';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import PhotoGallery from './components/PhotoGallery';
import GraphsScreen from './components/GraphsScreen';
import PlanOverview from './components/PlanOverview';
import BottomNav from './components/BottomNav';
import { AnimatePresence } from 'motion/react';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname} className="h-full">
        <Routes location={location}>
          <Route path="/" element={<TodayView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/photos" element={<PhotoGallery />} />
          <Route path="/graphs" element={<GraphsScreen />} />
          <Route path="/plan" element={<PlanOverview />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AnimatePresence>
  );
}

export default function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [hasBaseline, setHasBaseline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      const supabase = getSupabase();
      if (supabase) {
        setIsConfigured(true);
        try {
          const { data, error } = await supabase
            .from('exercise_baseline')
            .select('exercise_name');
          
          if (!error && data && data.length >= 3) {
            setHasBaseline(true);
          }
        } catch (err) {
          console.error("Error checking baseline", err);
        }
      }
      setLoading(false);
    };
    checkSetup();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CCFF00]"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return <SetupScreen onComplete={() => setIsConfigured(true)} />;
  }

  if (!hasBaseline) {
    return <BaselineSetupScreen onComplete={() => setHasBaseline(true)} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-transparent text-white pb-20 font-sans selection:bg-[#CCFF00]/30 selection:text-[#CCFF00]">
        <AnimatedRoutes />
        <BottomNav />
      </div>
    </HashRouter>
  );
}
