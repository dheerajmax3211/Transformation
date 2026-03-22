import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { Camera, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabase();

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('daily_log')
        .select('log_date, photo_url')
        .not('photo_url', 'is', null)
        .order('log_date', { ascending: false });
      
      if (data) {
        setPhotos(data);
      }
      setLoading(false);
    };
    fetchPhotos();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CCFF00]"></div>
      </div>
    );
  }

  const newestPhoto = photos.length > 0 ? photos[0] : null;
  const oldestPhoto = photos.length > 1 ? photos[photos.length - 1] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-transparent font-sans pb-24"
    >
      <div className="p-4 max-w-md mx-auto space-y-6">
        <h1 className="text-4xl font-black text-white mb-8 pt-4 uppercase tracking-tight">TRANSFORMATION</h1>
        
        {photos.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-10 text-center shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/50 border border-white/10 text-zinc-500 mb-6 shadow-inner">
              <Camera size={32} />
            </div>
            <p className="text-white font-black uppercase tracking-widest mb-2 relative z-10">NO PHOTOS YET</p>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed relative z-10">Take a photo on the Today screen to start your visual timeline.</p>
          </motion.div>
        ) : (
          <>
            {/* Comparison Section */}
            {oldestPhoto && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-2xl mb-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <h2 className="text-sm font-black text-[#CCFF00] uppercase tracking-widest mb-6 text-center relative z-10">PROGRESS COMPARISON</h2>
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/50 border border-white/5 shadow-inner">
                    <img src={oldestPhoto.photo_url} alt="Day 1" className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8">
                      <p className="text-white text-[10px] font-black uppercase tracking-widest text-center">DAY 1</p>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-black/80 border border-white/10 text-[#CCFF00] z-10 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                    <ArrowRight size={18} />
                  </div>

                  <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/50 border border-[#CCFF00]/20 shadow-[0_0_20px_rgba(204,255,0,0.1)]">
                    <img src={newestPhoto.photo_url} alt="Current" className="w-full h-full object-cover opacity-90" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8">
                      <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-widest text-center">CURRENT</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
              className="grid grid-cols-2 gap-4"
            >
              {photos.map((p) => (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  key={p.log_date} 
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900/40 cursor-pointer group border border-white/5 shadow-lg hover:border-white/20 transition-all duration-500 hover:shadow-[0_10px_30px_-10px_rgba(204,255,0,0.2)] hover:-translate-y-1"
                  onClick={() => setSelectedPhoto(p)}
                >
                  <img 
                    src={p.photo_url} 
                    alt={`Progress on ${p.log_date}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12">
                    <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-widest">{format(parseISO(p.log_date), 'MMM d, yyyy')}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* Fullscreen Photo Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-[100] flex flex-col"
              onClick={() => setSelectedPhoto(null)}
            >
              <div className="p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent absolute top-0 w-full z-10">
                <span className="text-[#CCFF00] font-black uppercase tracking-widest text-sm">{format(parseISO(selectedPhoto.log_date), 'MMMM d, yyyy')}</span>
                <button className="text-zinc-500 hover:text-white p-2 transition-colors">✕</button>
              </div>
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                src={selectedPhoto.photo_url} 
                alt="Fullscreen progress" 
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
