import { useState, useEffect } from 'react';
import { initSupabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function SetupScreen({ onComplete }) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [durationDays, setDurationDays] = useState(120);
  const [startWeight, setStartWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  
  const [error, setError] = useState('');

  useEffect(() => {
    // Pre-fill if exists
    const storedUrl = localStorage.getItem('supabaseUrl');
    const storedKey = localStorage.getItem('supabaseAnonKey');
    const storedGoogle = localStorage.getItem('googleClientId');
    const storedStart = localStorage.getItem('startDate');
    const storedDuration = localStorage.getItem('durationDays');
    const storedStartWeight = localStorage.getItem('startWeight');
    const storedGoalWeight = localStorage.getItem('goalWeight');

    if (storedUrl) setUrl(storedUrl);
    if (storedKey) setKey(storedKey);
    if (storedGoogle) setGoogleClientId(storedGoogle);
    if (storedStart) setStartDate(storedStart);
    if (storedDuration) setDurationDays(parseInt(storedDuration));
    if (storedStartWeight) setStartWeight(storedStartWeight);
    if (storedGoalWeight) setGoalWeight(storedGoalWeight);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || !key) {
      setError('Supabase credentials are required');
      return;
    }
    if (!startDate || !durationDays || !startWeight || !goalWeight) {
      setError('All challenge details are required');
      return;
    }
    
    try {
      localStorage.setItem('supabaseUrl', url);
      localStorage.setItem('supabaseAnonKey', key);
      if (googleClientId) {
        localStorage.setItem('googleClientId', googleClientId);
      } else {
        localStorage.removeItem('googleClientId');
      }
      
      localStorage.setItem('startDate', startDate);
      localStorage.setItem('durationDays', durationDays.toString());
      localStorage.setItem('startWeight', startWeight.toString());
      localStorage.setItem('goalWeight', goalWeight.toString());

      initSupabase(url, key);
      onComplete();
    } catch (err) {
      setError('Invalid URL or Key format');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl bg-zinc-900/40 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="text-center mb-10 relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tight mb-3 uppercase">IGNITE YOUR <span className="text-[#CCFF00]">TRANSFORMATION</span></h1>
          <p className="text-zinc-400 text-sm">Configure your database and set your challenge parameters.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* Database Section */}
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">1. Database Connection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Supabase URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] transition-colors shadow-inner"
                  placeholder="https://xyz.supabase.co"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Anon Key</label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] transition-colors shadow-inner"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Google Client ID (Optional)</label>
              <input
                type="text"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] transition-colors shadow-inner"
                placeholder="For saving photos to Google Drive"
              />
            </div>
          </div>

          {/* Challenge Section */}
          <div className="space-y-5 pt-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">2. Challenge Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] transition-colors [color-scheme:dark] shadow-inner"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Duration (Days)</label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] transition-colors shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Starting Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] transition-colors shadow-inner"
                  placeholder="e.g. 85.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Goal Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#CCFF00] transition-colors shadow-inner"
                  placeholder="e.g. 75.0"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#CCFF00] hover:bg-[#b3e600] text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(204,255,0,0.3)]"
          >
            Begin Journey
          </button>
        </form>
      </div>
    </div>
  );
}
