import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { getDayInfo, generateSchedule, getChallengeConfig } from '../data/schedule';
import { mealPlan } from '../data/mealPlan';
import TaskCard from './TaskCard';
import WorkoutDetail from './WorkoutDetail';
import { Flame, Upload, Camera, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO, isAfter, startOfDay, isBefore } from 'date-fns';
import { motion } from 'motion/react';

export default function TodayView() {
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dayInfo, setDayInfo] = useState(null);
  const [log, setLog] = useState({
    breakfast_done: false,
    lunch_done: false,
    dinner_done: false,
    morning_walk_done: false,
    workout_done: false,
    body_weight_kg: '',
    photo_url: ''
  });
  const [streak, setStreak] = useState(0);
  const [uploading, setUploading] = useState(false);
  const supabase = getSupabase();

  useEffect(() => {
    const info = getDayInfo(selectedDateStr);
    setDayInfo(info);

    const fetchLog = async () => {
      if (!info) return;
      const { data } = await supabase
        .from('daily_log')
        .select('*')
        .eq('log_date', info.dateString)
        .single();
      
      if (data) {
        setLog(data);
      } else {
        // Create empty log
        setLog({
          breakfast_done: false,
          lunch_done: false,
          dinner_done: false,
          morning_walk_done: false,
          workout_done: false,
          body_weight_kg: '',
          photo_url: ''
        });
        await supabase.from('daily_log').insert({ log_date: info.dateString });
      }
    };

    const fetchStreak = async () => {
      if (!info) return;
      const { data } = await supabase
        .from('daily_log')
        .select('log_date, breakfast_done, lunch_done, dinner_done, morning_walk_done, workout_done')
        .order('log_date', { ascending: false });
      
      if (!data) return;

      let currentStreak = 0;
      const schedule = generateSchedule();
      const todayIdx = schedule.findIndex(d => d.dateString === info.dateString);
      
      // Check backwards from selected day
      for (let i = todayIdx; i >= 0; i--) {
        const dateStr = schedule[i].dateString;
        const dayLog = data.find(d => d.log_date === dateStr);
        if (dayLog && 
            dayLog.breakfast_done && 
            dayLog.lunch_done && 
            dayLog.dinner_done && 
            dayLog.morning_walk_done && 
            (schedule[i].isRestDay || dayLog.workout_done)) {
          currentStreak++;
        } else if (i !== todayIdx) {
          break;
        }
      }
      setStreak(currentStreak);
    };

    if (info) {
      fetchLog();
      fetchStreak();
    }
  }, [supabase, selectedDateStr]);

  const handlePrevDay = () => {
    const schedule = generateSchedule();
    const idx = schedule.findIndex(d => d.dateString === selectedDateStr);
    if (idx > 0) {
      setSelectedDateStr(schedule[idx - 1].dateString);
    }
  };

  const handleNextDay = () => {
    const schedule = generateSchedule();
    const idx = schedule.findIndex(d => d.dateString === selectedDateStr);
    
    // Prevent selecting future dates beyond today
    const nextDate = schedule[idx + 1]?.date;
    if (nextDate && !isAfter(startOfDay(nextDate), startOfDay(new Date()))) {
      setSelectedDateStr(schedule[idx + 1].dateString);
    }
  };

  const isNextDisabled = () => {
    const schedule = generateSchedule();
    const idx = schedule.findIndex(d => d.dateString === selectedDateStr);
    const nextDate = schedule[idx + 1]?.date;
    return !nextDate || isAfter(startOfDay(nextDate), startOfDay(new Date()));
  };

  const isPrevDisabled = () => {
    const schedule = generateSchedule();
    const idx = schedule.findIndex(d => d.dateString === selectedDateStr);
    return idx <= 0;
  };

  const toggleTask = async (field) => {
    const newValue = !log[field];
    setLog(prev => ({ ...prev, [field]: newValue }));
    
    await supabase
      .from('daily_log')
      .update({ [field]: newValue })
      .eq('log_date', dayInfo.dateString);
  };

  const saveWeight = async (val) => {
    const weight = parseFloat(val);
    if (isNaN(weight)) return;
    
    await supabase
      .from('daily_log')
      .update({ body_weight_kg: weight })
      .eq('log_date', dayInfo.dateString);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${dayInfo.dateString}.${fileExt}`;

    const googleClientId = localStorage.getItem('googleClientId');

    if (googleClientId) {
      // Use Google Drive
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.error(tokenResponse);
              alert('Google Drive authentication failed');
              setUploading(false);
              return;
            }
            await uploadToGoogleDrive(file, tokenResponse.access_token, fileName);
          },
        });
        tokenClient.requestAccessToken({ prompt: '' });
      } catch (err) {
        console.error(err);
        alert('Failed to initialize Google Drive upload');
        setUploading(false);
      }
    } else {
      // Fallback to Supabase Storage
      try {
        // Try to create the bucket if it doesn't exist. Ignore errors if it already exists or we lack permissions.
        try {
          await supabase.storage.createBucket('progress-photos', { public: true });
        } catch (e) {
          console.log('Bucket might already exist or permission denied to create it programmatically.', e);
        }

        const { error: uploadError } = await supabase.storage
          .from('progress-photos')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('progress-photos')
          .getPublicUrl(fileName);

        const publicUrl = data.publicUrl;

        await supabase
          .from('daily_log')
          .update({ photo_url: publicUrl })
          .eq('log_date', dayInfo.dateString);

        setLog(prev => ({ ...prev, photo_url: publicUrl }));
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Error uploading photo to Supabase. Please ensure you have created a public bucket named "progress-photos" in your Supabase dashboard.');
      } finally {
        setUploading(false);
      }
    }
  };

  const uploadToGoogleDrive = async (file, accessToken, fileName) => {
    try {
      const folderName = '4-Month Transformation Photos';
      let folderId = null;

      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const searchData = await searchRes.json();

      if (searchData.files && searchData.files.length > 0) {
        folderId = searchData.files[0].id;
      } else {
        const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
          }),
        });
        const createData = await createRes.json();
        folderId = createData.id;
      }

      const metadata = {
        name: fileName,
        mimeType: file.type,
        parents: [folderId],
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error.message);

      await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      });

      const publicUrl = `https://drive.google.com/thumbnail?id=${data.id}&sz=w1000`;

      await supabase
        .from('daily_log')
        .update({ photo_url: publicUrl })
        .eq('log_date', dayInfo.dateString);

      setLog(prev => ({ ...prev, photo_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading to Drive:', error);
      alert('Error uploading to Google Drive');
    } finally {
      setUploading(false);
    }
  };

  if (!dayInfo) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <CalendarIcon className="w-12 h-12 text-zinc-600 mx-auto" />
        <p className="text-zinc-400 font-medium">Date is outside your challenge period.</p>
        <button 
          onClick={() => setSelectedDateStr(format(new Date(), 'yyyy-MM-dd'))}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold tracking-wide uppercase transition-colors"
        >
          Go to Today
        </button>
      </div>
    </div>
  );

  const totalTasks = dayInfo.isRestDay ? 4 : 5;
  const completedTasks = [
    log.morning_walk_done,
    log.breakfast_done,
    log.lunch_done,
    log.dinner_done,
    ...(dayInfo.isRestDay ? [] : [log.workout_done])
  ].filter(Boolean).length;
  
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);
  const { totalDays } = getChallengeConfig();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-transparent font-sans pb-24"
    >
      {/* Top Navigation / Date Selector */}
      <div className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={handlePrevDay} 
            disabled={isPrevDisabled()}
            className="p-2 rounded-full bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              {dayInfo.dateString === format(new Date(), 'yyyy-MM-dd') ? 'TODAY' : format(dayInfo.date, 'MMM d, yyyy')}
            </h1>
            <p className="text-[#CCFF00] font-mono text-xs font-bold tracking-widest uppercase mt-0.5">
              DAY {dayInfo.dayNumber} / {totalDays}
            </p>
          </div>

          <button 
            onClick={handleNextDay} 
            disabled={isNextDisabled()}
            className="p-2 rounded-full bg-white/5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6 mt-4">
        
        {/* Progress Ring */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between bg-zinc-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500 drop-shadow-sm">DAILY<br/>PROGRESS</h2>
            <p className="text-[#CCFF00] font-mono text-xs font-bold uppercase tracking-widest mt-2 drop-shadow-[0_0_8px_rgba(204,255,0,0.3)]">WEEK {dayInfo.weekNumber}</p>
          </div>
          <div className="relative w-28 h-28 flex items-center justify-center z-10">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(204,255,0,0.2)]" viewBox="0 0 36 36">
              <path
                className="text-zinc-800/50"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-[#CCFF00]"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${progressPercent}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-black text-white tracking-tighter">{completedTasks}</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest -mt-1">OF {totalTasks}</span>
            </div>
          </div>
        </motion.div>

        {/* Streak */}
        {streak > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-zinc-900/40 backdrop-blur-md border border-orange-500/20 rounded-3xl p-5 flex items-center gap-5 shadow-[0_0_30px_rgba(249,115,22,0.05)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent pointer-events-none"></div>
            <div className="bg-orange-500/10 p-4 rounded-2xl relative z-10 border border-orange-500/20">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Flame className="text-orange-500 w-7 h-7 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
              </motion.div>
            </div>
            <div className="relative z-10">
              <div className="text-orange-500 font-black text-xl uppercase tracking-tight leading-none">{streak} DAY STREAK</div>
              <div className="text-orange-500/60 font-mono text-[10px] font-bold uppercase tracking-widest mt-1.5">UNSTOPPABLE MOMENTUM</div>
            </div>
          </motion.div>
        )}

        {/* Tasks */}
        <div className="space-y-4">
          <TaskCard 
            title="Morning Walk" 
            description="30 min, fasted, brisk pace."
            isDone={log.morning_walk_done}
            onToggle={() => toggleTask('morning_walk_done')}
          />

          <TaskCard 
            title={mealPlan.breakfast.title}
            description={mealPlan.breakfast.description}
            isDone={log.breakfast_done}
            onToggle={() => toggleTask('breakfast_done')}
          />

          {!dayInfo.isRestDay ? (
            <TaskCard 
              title={`${dayInfo.workoutType} Workout`}
              isDone={log.workout_done}
              onToggle={() => toggleTask('workout_done')}
            >
              <WorkoutDetail 
                dayType={dayInfo.workoutType} 
                weekNumber={dayInfo.weekNumber} 
                dateString={dayInfo.dateString}
                isDone={log.workout_done}
                onComplete={() => {
                  if (!log.workout_done) toggleTask('workout_done');
                }}
              />
            </TaskCard>
          ) : (
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="font-black text-2xl text-white mb-2 uppercase tracking-tight">REST DAY</h3>
              <p className="text-sm text-zinc-400 font-medium">Rest and recover — your muscles are rebuilding right now.</p>
            </div>
          )}

          <TaskCard 
            title={mealPlan.lunch.title}
            description={mealPlan.lunch.description}
            isDone={log.lunch_done}
            onToggle={() => toggleTask('lunch_done')}
          />

          <TaskCard 
            title={mealPlan.dinner.title}
            description={mealPlan.dinner.description}
            isDone={log.dinner_done}
            onToggle={() => toggleTask('dinner_done')}
          />
        </div>

        {/* Creatine Reminder */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 text-sm text-zinc-300 flex items-start gap-4 shadow-xl">
          <div className="w-3 h-3 rounded-full bg-[#CCFF00] mt-1 shadow-[0_0_12px_rgba(204,255,0,0.6)]"></div>
          <p className="font-medium leading-relaxed">
            <span className="font-bold text-white uppercase tracking-widest text-xs block mb-1.5">SUPPLEMENT</span>
            {mealPlan.creatine}
          </p>
        </div>

        {/* Body Weight Input */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl">
          <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-4">LOG BODY WEIGHT (KG)</h3>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.1"
              value={log.body_weight_kg || ''}
              onChange={(e) => setLog(prev => ({ ...prev, body_weight_kg: e.target.value }))}
              onBlur={(e) => saveWeight(e.target.value)}
              className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-xl font-black focus:outline-none focus:border-[#CCFF00] transition-colors placeholder:text-zinc-700"
              placeholder="e.g. 61.5"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl">
          <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-4">DAILY PROGRESS PHOTO</h3>
          {log.photo_url ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black border border-white/5 shadow-2xl">
              <img src={log.photo_url} alt="Progress" className="w-full h-full object-cover" />
              <label className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-full cursor-pointer hover:bg-black transition-colors border border-white/10 shadow-xl group">
                <Camera className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-white/10 border-dashed rounded-2xl cursor-pointer hover:bg-white/5 transition-colors bg-black/30 group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#CCFF00]"></div>
                ) : (
                  <>
                    <div className="bg-white/5 p-5 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-widest">UPLOAD PHOTO</p>
                    <p className="text-xs text-zinc-500 mt-2 font-medium">Show up for yourself today</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </div>
    </motion.div>
  );
}
