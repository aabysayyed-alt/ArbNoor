import React, { useState } from 'react';
// @ts-ignore
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, Search, Library, User, Play, Pause } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import PlayerOverlay from './PlayerOverlay';

const Layout = () => {
  const location = useLocation();
  const { currentTrack, isPlaying, togglePlay, progress } = useAudio();
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Active state: Warm Charcoal/Brown
  const isActive = (path: string) => location.pathname === path 
    ? 'text-charcoal-800 dark:text-white opacity-100 scale-110' 
    : 'text-stone-400 dark:text-stone-500 opacity-80 hover:opacity-100 hover:text-stone-600 dark:hover:text-stone-300';
  
  const iconWeight = (path: string) => location.pathname === path ? 2 : 1.5;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500 max-w-2xl mx-auto bg-white dark:bg-[#1C1917] shadow-2xl relative">
      <main className="flex-1 overflow-y-auto pb-24 w-full">
        <Outlet />
      </main>

      {/* Mini Player - Floating Glass Pill */}
      {currentTrack && !isFullPlayerOpen && (
        <div 
          onClick={() => setIsFullPlayerOpen(true)}
          className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[calc(42rem-3rem)] h-16 glass-card rounded-full flex items-center justify-between cursor-pointer z-40 transition-all hover:-translate-y-1 active:scale-[0.98] pr-3 pl-2"
        >
           {/* Subtle Progress Line at Bottom */}
           <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-stone-200/50 dark:bg-stone-700/50 rounded-full overflow-hidden mb-[1px]">
             <div className="h-full bg-charcoal-800/80 dark:bg-white/80" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="flex items-center gap-4 overflow-hidden h-full">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/60 dark:border-white/10 ml-0.5 shadow-sm">
                <img 
                src={currentTrack.coverUrl} 
                alt="cover" 
                className="w-full h-full object-cover opacity-95" 
                />
            </div>
            
            <div className="truncate py-1 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-white truncate leading-tight tracking-wide">{currentTrack.title}</h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate tracking-widest uppercase opacity-80 mt-0.5">{currentTrack.artist}</p>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-stone-200/30 dark:hover:bg-white/10 transition-colors text-charcoal-800 dark:text-white"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" strokeWidth={0} /> : <Play size={20} fill="currentColor" className="ml-0.5" strokeWidth={0} />}
          </button>
        </div>
      )}

      {/* Bottom Navigation - Floating Glass Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[calc(42rem-3rem)] h-[4.5rem] glass-card rounded-[2.5rem] flex justify-around items-center z-40 px-2 shadow-xl shadow-stone-300/20 dark:shadow-black/20">
        <Link to="/" className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isActive('/')}`}>
          <Home size={22} strokeWidth={iconWeight('/')} />
          {location.pathname === '/' && <span className="w-1 h-1 bg-charcoal-800 dark:bg-white rounded-full mt-1.5 opacity-60"></span>}
        </Link>
        <Link to="/search" className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isActive('/search')}`}>
          <Search size={22} strokeWidth={iconWeight('/search')} />
           {location.pathname === '/search' && <span className="w-1 h-1 bg-charcoal-800 dark:bg-white rounded-full mt-1.5 opacity-60"></span>}
        </Link>
        <Link to="/library" className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isActive('/library')}`}>
          <Library size={22} strokeWidth={iconWeight('/library')} />
           {location.pathname === '/library' && <span className="w-1 h-1 bg-charcoal-800 dark:bg-white rounded-full mt-1.5 opacity-60"></span>}
        </Link>
        <Link to="/account" className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isActive('/account')}`}>
          <User size={22} strokeWidth={iconWeight('/account')} />
           {location.pathname === '/account' && <span className="w-1 h-1 bg-charcoal-800 dark:bg-white rounded-full mt-1.5 opacity-60"></span>}
        </Link>
      </nav>

      {/* Full Screen Player */}
      <PlayerOverlay 
        isOpen={isFullPlayerOpen} 
        onClose={() => setIsFullPlayerOpen(false)} 
      />
    </div>
  );
};

export default Layout;