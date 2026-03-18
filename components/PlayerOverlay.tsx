import React, { useState, useEffect } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Heart, Moon, Share2, Download, ListMusic, ShieldCheck, Plus, X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types';

interface PlayerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayerOverlay: React.FC<PlayerOverlayProps> = ({ isOpen, onClose }) => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrev, 
    seek, 
    duration, 
    currentTime: audioCurrentTime,
    favorites,
    toggleFavorite,
    sleepTimer,
    setSleepTimer,
    isDownloaded,
    toggleDownload,
    playlists,
    createPlaylist,
    addTrackToPlaylist
  } = useAudio();
  
  const [showSleepOptions, setShowSleepOptions] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [localSeekValue, setLocalSeekValue] = useState<number | null>(null);

  // Sync local seek value with actual audio time unless user is dragging
  useEffect(() => {
    if (localSeekValue === null) {
      // Not dragging
    }
  }, [audioCurrentTime]);

  if (!isOpen || !currentTrack) return null;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isFav = favorites.includes(currentTrack.id);
  const isDown = isDownloaded(currentTrack.id);

  const handleCreateAndAdd = () => {
    const name = prompt("Enter new playlist name:");
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (currentTrack) {
        addTrackToPlaylist(playlistId, currentTrack.id);
        setShowPlaylistSelector(false);
        alert("Added to playlist!");
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSeekValue(Number(e.target.value));
  };

  const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (localSeekValue !== null) {
      seek(localSeekValue);
      setLocalSeekValue(null);
    }
  };

  // The value displayed on the slider
  const displayTime = localSeekValue !== null ? localSeekValue : audioCurrentTime;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pattern-bg transition-colors duration-500">
      
      {/* Background Overlay to ensure readability */}
      <div className="absolute inset-0 bg-cream-100/60 dark:bg-black/80 backdrop-blur-[2px]"></div>

      {/* Close Button Top Right */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-4 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white transition-colors z-20"
      >
        <ChevronDown size={32} strokeWidth={1} />
      </button>

      {/* Playlist Selector Overlay */}
      {showPlaylistSelector && (
        <div className="absolute inset-0 z-[60] bg-charcoal-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-300">
           <div className="glass-card w-full sm:w-80 sm:rounded-[2rem] rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 bg-cream-50/90 dark:bg-stone-800/90">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-serif font-bold text-charcoal-900 dark:text-white">Add to Playlist</h3>
               <button onClick={() => setShowPlaylistSelector(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors">
                 <X size={20} strokeWidth={1.5} />
               </button>
             </div>
             
             <div className="max-h-[50vh] overflow-y-auto space-y-3 mb-4 no-scrollbar">
               <button 
                  onClick={handleCreateAndAdd}
                  className="w-full p-4 flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 dark:border-stone-600 text-stone-500 font-bold uppercase tracking-wide text-xs"
                >
                  <Plus size={16} /> Create New
                </button>
                {playlists.map(p => (
                   <button 
                     key={p.id}
                     onClick={() => handleAddToPlaylist(p.id)}
                     className="w-full p-4 flex items-center justify-between rounded-2xl bg-white/50 dark:bg-stone-700/50 hover:bg-white/80 text-charcoal-800 dark:text-stone-200 transition-colors text-left"
                   >
                     <span className="font-bold text-sm">{p.name}</span>
                     <span className="text-[10px] font-medium opacity-60 bg-stone-100 dark:bg-stone-600 px-2 py-0.5 rounded-full">{p.trackIds.length}</span>
                   </button>
                ))}
             </div>
           </div>
        </div>
      )}

      {/* Sleep Timer Menu */}
      {showSleepOptions && (
        <div className="absolute top-24 right-6 glass-card bg-cream-50/90 dark:bg-stone-800/90 rounded-2xl p-2 w-40 z-50 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
          {[15, 30, 45, 60].map((min) => (
            <button
              key={min}
              onClick={() => { setSleepTimer(min); setShowSleepOptions(false); }}
              className="block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wide text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors"
            >
              {min} Minutes
            </button>
          ))}
          <button
            onClick={() => { setSleepTimer(null); setShowSleepOptions(false); }}
            className="block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wide text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors border-t border-stone-200/50 mt-1"
          >
            Off
          </button>
        </div>
      )}

      {/* MAIN CARD - The Glass Monolith */}
      <div className="relative z-10 w-full max-w-sm mx-6 aspect-[9/16] max-h-[85vh] glass-card rounded-[3rem] p-8 flex flex-col items-center shadow-2xl shadow-charcoal-900/10 dark:shadow-black/50 overflow-hidden">
        
        {/* Inner Border Line (Decorative) */}
        <div className="absolute inset-3 border border-white/40 dark:border-white/5 rounded-[2.5rem] pointer-events-none"></div>

        {/* Top Actions Row */}
        <div className="w-full flex justify-between items-center mb-8 relative z-20">
           <button 
              onClick={() => toggleDownload(currentTrack.id)}
              className={`p-3 rounded-full transition-colors active:scale-95 ${isDown ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'text-stone-400 hover:text-stone-600'}`}
           >
             <Download size={20} strokeWidth={isDown ? 2 : 1.5} />
           </button>
           
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Now Playing</span>
           
           <button 
             onClick={() => setShowSleepOptions(!showSleepOptions)} 
             className={`p-3 rounded-full transition-colors ${sleepTimer ? 'text-gold-500' : 'text-stone-400 hover:text-stone-600'}`}
           >
             <Moon size={20} fill={sleepTimer ? "currentColor" : "none"} />
           </button>
        </div>

        {/* Album Art */}
        <div className="w-full aspect-square rounded-[2rem] overflow-hidden shadow-lg border border-white/60 dark:border-white/10 relative mb-8 group">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover"
          />
          {currentTrack.isVocalsOnly && (
             <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/30 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/40 shadow-sm">
               <ShieldCheck size={10} className="text-white" />
               <span className="text-[8px] font-bold uppercase tracking-widest text-white">Vocals</span>
             </div>
          )}
        </div>

        {/* Title Info */}
        <div className="text-center mb-8 w-full px-2">
           <h2 className="text-2xl font-serif font-bold text-charcoal-900 dark:text-white mb-2 leading-tight">{currentTrack.title}</h2>
           <p className="text-sm text-stone-500 dark:text-stone-400 font-medium tracking-widest uppercase">{currentTrack.artist}</p>
        </div>

        {/* Progress */}
        <div className="w-full mb-8 group relative z-20">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={displayTime}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full appearance-none cursor-pointer accent-charcoal-800 dark:accent-white hover:accent-charcoal-600 transition-all"
          />
          <div className="flex justify-between mt-2 text-[10px] text-stone-400 font-bold tracking-widest">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="w-full flex justify-between items-center mb-8 px-4 relative z-20">
             <button onClick={playPrev} className="p-4 text-stone-400 hover:text-charcoal-800 dark:hover:text-white transition-colors active:scale-90">
                 <SkipBack size={28} strokeWidth={1.5} />
             </button>

             <button 
                onClick={togglePlay} 
                className="w-20 h-20 rounded-[2rem] bg-charcoal-800 dark:bg-white text-cream-50 dark:text-charcoal-900 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-charcoal-900/20"
             >
                {isPlaying ? <Pause size={28} fill="currentColor" strokeWidth={0} /> : <Play size={28} fill="currentColor" className="ml-1" strokeWidth={0} />}
             </button>

             <button onClick={playNext} className="p-4 text-stone-400 hover:text-charcoal-800 dark:hover:text-white transition-colors active:scale-90">
                 <SkipForward size={28} strokeWidth={1.5} />
             </button>
        </div>

        {/* Bottom Actions */}
        <div className="w-full flex justify-between items-center px-8 relative z-20 mt-auto">
           <button 
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`transition-colors active:scale-90 ${isFav ? 'text-red-500' : 'text-stone-400 hover:text-stone-600'}`}
           >
             <Heart size={22} fill={isFav ? "currentColor" : "none"} strokeWidth={2} />
           </button>
           
           <button 
              onClick={() => setShowPlaylistSelector(true)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors active:scale-90"
           >
             <ListMusic size={22} strokeWidth={2} />
           </button>
        </div>
      </div>

    </div>
  );
};

export default PlayerOverlay;