import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, XCircle, CheckCircle2, Play, ArrowUpRight, ArrowLeft } from 'lucide-react';
// @ts-ignore
import { useLocation, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { Track, Category } from '../types';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get category from navigation state if present
  const categoryFilter = location.state?.category as Category | undefined;
  
  const [query, setQuery] = useState('');
  const { playTrack, currentTrack, tracks, isDownloaded, isPlaying } = useAudio();

  // Filter logic: Apply category filter first if present, then text search
  const filteredTracks = useMemo(() => {
    let result = tracks;

    // 1. Filter by Category if in Browse Mode
    if (categoryFilter) {
      result = result.filter(t => t.category === categoryFilter);
    }

    // 2. Filter by Search Query
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.artist.toLowerCase().includes(q)
      );
    }

    return result;
  }, [query, tracks, categoryFilter]);

  // Handle clearing the category mode
  const clearCategory = () => {
    navigate('/search', { replace: true, state: {} });
  };

  const getPageTitle = () => {
    if (categoryFilter) return categoryFilter; // e.g., "Naat", "Hamd"
    return "Search";
  };

  return (
    <div className="p-6 min-h-full pb-32">
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex items-center gap-4 mb-8 pt-4 relative z-10">
        {categoryFilter && (
            <button onClick={clearCategory} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white transition-colors">
                <ArrowLeft size={18} />
            </button>
        )}
        <h1 className="text-4xl font-medium text-charcoal-900 dark:text-white font-serif tracking-tight">
            {getPageTitle()}
        </h1>
      </div>
      
      {/* Search Bar - Premium Glass Pill */}
      <div className="relative mb-8 group z-10">
        <div className="absolute inset-0 bg-teal-500/5 rounded-[2rem] blur-xl transition-opacity opacity-0 group-focus-within:opacity-100"></div>
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-teal-600 transition-colors" size={22} />
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={categoryFilter ? `Search in ${categoryFilter}...` : "Naat, Reciter, Nasheed..."}
          className="relative w-full bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 text-charcoal-900 dark:text-white pl-16 pr-12 py-5 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-400/50 transition-all placeholder:text-stone-400 font-medium text-lg shadow-sm"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 z-10 transition-colors"
          >
            <XCircle size={22} fill="currentColor" className="text-stone-200 dark:text-stone-600" />
          </button>
        )}
      </div>

      {/* Results or Empty State */}
      <div className="space-y-4 relative z-10">
        {/* If we have a query OR we are in category filter mode */}
        {(query.length > 0 || categoryFilter) ? (
          filteredTracks.length > 0 ? (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 px-2">
                    {query ? 'Results' : 'Browse List'}
                </h3>
                {filteredTracks.map(track => (
                <SearchItem 
                    key={track.id} 
                    track={track} 
                    onClick={() => playTrack(track)} 
                    active={currentTrack?.id === track.id} 
                    downloaded={isDownloaded(track.id)}
                    isPlaying={isPlaying}
                />
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <SearchIcon size={48} className="opacity-20 mb-4" />
              <p className="font-serif text-lg">No tracks found</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">
                 {categoryFilter ? `No ${categoryFilter} content yet` : "Try searching for something else"}
              </p>
            </div>
          )
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Browse All</h3>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full uppercase tracking-wide">{tracks.length} Tracks</span>
            </div>
            
            <div className="bg-cream-50/40 dark:bg-white/5 backdrop-blur-md rounded-[2.5rem] p-3 border border-white/40 dark:border-white/5 shadow-sm space-y-2 min-h-[300px]">
              {tracks.length > 0 ? tracks.map(track => (
                <SearchItem 
                    key={track.id} 
                    track={track} 
                    onClick={() => playTrack(track)} 
                    active={currentTrack?.id === track.id}
                    downloaded={isDownloaded(track.id)}
                    isPlaying={isPlaying}
                />
              )) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-50">
                    <p className="text-sm font-bold text-stone-400">Library is empty.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchItem: React.FC<{ 
    track: Track, 
    onClick: () => void, 
    active: boolean, 
    downloaded: boolean,
    isPlaying: boolean
}> = ({ track, onClick, active, downloaded, isPlaying }) => (
  <div 
    onClick={onClick} 
    className={`group flex items-center gap-5 p-3 pr-5 rounded-[2rem] cursor-pointer transition-all border ${
        active 
        ? 'glass-card bg-white/80 border-white dark:bg-white/10 dark:border-white/10 shadow-md transform scale-[1.01]' 
        : 'hover:bg-white/50 dark:hover:bg-white/5 border-transparent'
    }`}
  >
    <div className="relative w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 object-cover shadow-sm border border-white/30 dark:border-white/5 overflow-hidden flex-shrink-0">
        <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
        {active && isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
             <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        )}
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className={`text-sm font-bold truncate ${active ? 'text-teal-900 dark:text-white' : 'text-stone-800 dark:text-stone-200'}`}>{track.title}</h4>
          {downloaded && (
             <CheckCircle2 size={12} className="text-teal-600 dark:text-teal-400 flex-shrink-0" fill="currentColor" stroke="white" />
          )}
      </div>
      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
        {track.artist}
      </p>
    </div>

    {active ? (
         <div className="w-8 h-8 rounded-full bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 flex items-center justify-center shadow-md">
            {isPlaying ? (
                <span className="w-2 h-2 bg-current rounded-sm animate-spin"></span>
            ) : (
                <Play size={10} fill="currentColor" className="ml-0.5" />
            )}
         </div>
    ) : (
        <ArrowUpRight size={18} className="text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    )}
  </div>
);

export default Search;