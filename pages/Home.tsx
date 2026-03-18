import React from 'react';
import { Play, ShieldCheck, Mic, Loader, CheckCircle2 } from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types';

const Home = () => {
  const { playTrack, currentTrack, isPlaying, tracks, isLoading } = useAudio();
  const navigate = useNavigate();
  const featured = tracks.length > 0 ? tracks[0] : null;

  if (isLoading) {
    return (
        <div className="flex h-full items-center justify-center p-10 min-h-[60vh]">
            <Loader className="animate-spin text-stone-400" size={24} strokeWidth={1} />
        </div>
    );
  }

  // Empty State
  if (tracks.length === 0) {
      return (
        <div className="p-6 pb-32 flex flex-col items-center justify-center min-h-[80vh] text-center">
            <div className="w-32 h-32 glass-card rounded-full flex items-center justify-center mb-8 border border-white/60 relative overflow-hidden">
                <Mic size={32} strokeWidth={1} className="text-stone-400" />
            </div>
            <h1 className="text-4xl font-serif font-medium text-charcoal-900 dark:text-white mb-3">ArbNoor</h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm max-w-xs mb-10 font-light tracking-wide leading-relaxed">
                A pure, distraction-free space. <br/>Upload content to begin.
            </p>
        </div>
      );
  }

  return (
    <div className="pb-32 pt-8 px-6">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-medium text-charcoal-900 dark:text-white tracking-tight font-serif">ArbNoor</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-8 h-[1px] bg-charcoal-800 dark:bg-white opacity-40"></span>
            <p className="text-[10px] text-charcoal-800 dark:text-stone-300 uppercase tracking-[0.25em] font-medium opacity-70">
              Vocals Only
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center font-serif text-charcoal-800 dark:text-white text-lg border border-white/50 shadow-sm">
          A
        </div>
      </div>

      {/* Featured Card */}
      {featured && (
        <div 
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] glass-card rounded-[2.5rem] overflow-hidden group cursor-pointer transition-transform duration-700 hover:scale-[1.01] mb-12" 
          onClick={() => playTrack(featured)}
        >
          {/* Background Image (Subtle) */}
          <div className="absolute inset-0 opacity-100 group-hover:scale-105 transition-transform duration-1000">
             <img src={featured.coverUrl} alt="featured" className="w-full h-full object-cover" />
          </div>
          
          {/* Frosted Glass Overlay */}
          <div className="absolute inset-0 bg-cream-100/30 dark:bg-black/30 backdrop-blur-[2px]"></div>
          
          {/* Inner Content Border/Frame */}
          <div className="absolute inset-2 border border-white/40 rounded-[2rem] pointer-events-none"></div>

          {/* Decorative Band */}
          <div className="absolute top-1/2 left-0 right-0 h-16 -translate-y-1/2 bg-white/30 backdrop-blur-md flex items-center justify-center overflow-hidden border-y border-white/20">
             <div className="opacity-20 w-full h-full pattern-bg"></div>
          </div>
          
          {/* Content Layer */}
          <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 border border-white/50 shadow-sm">
              <span className="text-[9px] text-charcoal-900 dark:text-white uppercase tracking-[0.25em] font-bold">Featured Audio</span>
            </div>
            
            <h2 className="text-4xl font-serif text-charcoal-900 dark:text-white mb-3 drop-shadow-sm">{featured.title}</h2>
            <p className="text-sm text-charcoal-800 dark:text-stone-200 font-medium tracking-widest uppercase opacity-80">{featured.artist}</p>

             {/* Play Button */}
             <div className="mt-8 w-14 h-14 bg-charcoal-900 dark:bg-white text-cream-50 dark:text-charcoal-900 rounded-full flex items-center justify-center transition-all active:scale-90 hover:scale-110 shadow-lg shadow-charcoal-900/20">
                 {(currentTrack?.id === featured.id && isPlaying) ? 
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></span> : 
                    <Play fill="currentColor" className="ml-1" size={20} strokeWidth={0} />
                 }
             </div>
          </div>
        </div>
      )}

      {/* Categories / Discover */}
      <div className="mb-12">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 px-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
            Discover
        </h3>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate('/search', { state: { category: cat.id } })}
              className="group relative flex flex-col items-center justify-center aspect-[1/1.2] rounded-[2rem] glass-card 
                         border border-white/40 dark:border-white/5 
                         active:scale-95 transition-all duration-200 ease-out
                         hover:shadow-[0_0_20px_-5px_rgba(212,175,55,0.3)] dark:hover:shadow-[0_0_20px_-5px_rgba(212,175,55,0.15)]
                         hover:border-gold-400/50 dark:hover:border-gold-400/30 overflow-hidden"
            >
              {/* Background Tint */}
              <div className="absolute inset-0 bg-teal-50/30 dark:bg-teal-900/10 group-hover:bg-teal-100/40 dark:group-hover:bg-teal-800/20 transition-colors duration-300"></div>
              
              {/* Decorative Dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 mb-4 group-hover:bg-gold-500 group-hover:shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300"></div>
              
              <span className="font-serif text-[13px] sm:text-sm font-medium text-charcoal-900 dark:text-stone-100 relative z-10 leading-snug px-1">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent List */}
      <div>
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 px-2">Recent</h3>
        <div className="space-y-4">
          {tracks.slice(1).map((track) => (
            <TrackRow key={track.id} track={track} />
          ))}
          {tracks.length === 1 && (
            <div className="p-8 text-center glass-card rounded-[2rem] border-dashed border-stone-300 dark:border-stone-700">
                <p className="text-xs text-stone-400 uppercase tracking-widest">Library growing...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TrackRow: React.FC<{ track: Track }> = ({ track }) => {
  const { playTrack, currentTrack, isPlaying, isDownloaded } = useAudio();
  const isActive = currentTrack?.id === track.id;
  const downloaded = isDownloaded(track.id);

  return (
    <div 
      onClick={() => playTrack(track)}
      className={`relative group flex items-center gap-5 p-4 rounded-[2rem] transition-all cursor-pointer ${isActive ? 'glass-card bg-white/60 border-white/80' : 'hover:bg-white/40 dark:hover:bg-white/5 border border-transparent'}`}
    >
      <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-white/50">
        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover opacity-95" />
        {isActive && isPlaying && (
          <div className="absolute inset-0 bg-charcoal-900/30 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
            <h4 className={`text-sm font-bold truncate tracking-wide ${isActive ? 'text-charcoal-900 dark:text-white' : 'text-charcoal-800 dark:text-stone-300'}`}>
            {track.title}
            </h4>
            {downloaded && (
                <CheckCircle2 size={12} className="text-teal-600 dark:text-teal-400 flex-shrink-0" fill="currentColor" stroke="white" />
            )}
        </div>
        <p className="text-[10px] text-stone-500 dark:text-stone-500 truncate tracking-widest uppercase mt-1 opacity-80 font-medium">{track.artist}</p>
      </div>
      
      {track.isVocalsOnly && !isActive && (
         <ShieldCheck size={14} className="text-stone-300 dark:text-stone-600" />
      )}
      
      {isActive && (
        <div className="w-8 h-8 rounded-full bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 flex items-center justify-center shadow-md">
             <Play size={10} fill="currentColor" className="ml-0.5"/>
        </div>
      )}
    </div>
  );
};

export default Home;