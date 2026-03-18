import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Track } from '../types';
import { Heart, Download, Music, ListMusic, Plus, ChevronLeft, Trash2, CheckCircle2, Play } from 'lucide-react';

type Tab = 'favorites' | 'downloads' | 'playlists';

const Library = () => {
  const [activeTab, setActiveTab] = useState<Tab>('favorites');
  const [viewingPlaylistId, setViewingPlaylistId] = useState<string | null>(null);
  
  const { 
    favorites, 
    isDownloaded,
    toggleDownload, 
    playlists, 
    createPlaylist, 
    deletePlaylist, 
    removeTrackFromPlaylist, 
    playTrack, 
    currentTrack, 
    tracks,
    isPlaying
  } = useAudio();

  // Helper to get tracks
  const getTracksByIds = (ids: string[]) => tracks.filter(t => ids.includes(t.id));

  const favoriteTracks = getTracksByIds(favorites);
  const downloadedTracks = tracks.filter(t => isDownloaded(t.id));
  
  const viewingPlaylist = viewingPlaylistId ? playlists.find(p => p.id === viewingPlaylistId) : null;
  const playlistTracks = viewingPlaylist ? getTracksByIds(viewingPlaylist.trackIds) : [];

  const handleCreatePlaylist = () => {
    const name = prompt("Enter playlist name:");
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };

  const handleDeletePlaylist = () => {
    if (viewingPlaylist && confirm(`Are you sure you want to delete "${viewingPlaylist.name}"?`)) {
      deletePlaylist(viewingPlaylist.id);
      setViewingPlaylistId(null);
    }
  };

  // --- Playlist Detail View ---
  if (viewingPlaylistId && viewingPlaylist) {
    return (
      <div className="p-6 min-h-full pb-32">
         {/* Ambient Glow */}
         <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <button 
          onClick={() => setViewingPlaylistId(null)} 
          className="relative z-10 flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white mb-8 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-white/10 flex items-center justify-center group-hover:bg-white/60 transition-colors">
            <ChevronLeft size={18} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
        
        <div className="relative z-10 flex justify-between items-end mb-8">
           <div>
             <h1 className="text-4xl font-serif font-medium text-charcoal-900 dark:text-white mb-2">{viewingPlaylist.name}</h1>
             <p className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest opacity-80 pl-1">{playlistTracks.length} Tracks</p>
           </div>
           <button 
             onClick={handleDeletePlaylist}
             className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm border border-red-100 dark:border-red-900/30"
           >
             <Trash2 size={20} />
           </button>
        </div>

        <div className="space-y-4 relative z-10">
          {playlistTracks.length > 0 ? (
            playlistTracks.map(track => (
              <LibraryItem 
                key={track.id} 
                track={track} 
                onClick={() => playTrack(track)} 
                isActive={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                downloaded={isDownloaded(track.id)}
                onRemove={(e) => {
                  e.stopPropagation();
                  removeTrackFromPlaylist(viewingPlaylist.id, track.id);
                }}
              />
            ))
          ) : (
            <div className="text-center py-20 text-stone-400 glass-card rounded-[2.5rem]">
              <Music size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium">This playlist is empty.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Main Library View ---
  return (
    <div className="p-6 min-h-full pb-32">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <h1 className="relative z-10 text-4xl font-medium mb-8 text-charcoal-900 dark:text-white font-serif tracking-tight pt-4">Your Library</h1>

      {/* Tabs - Glass Pill Style */}
      <div className="relative z-10 flex p-1.5 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-full mb-10 shadow-sm">
        {(['favorites', 'downloads', 'playlists'] as Tab[]).map((tab) => (
           <button 
           key={tab}
           onClick={() => setActiveTab(tab)}
           className={`flex-1 py-3 text-xs sm:text-xs font-bold rounded-full transition-all capitalize tracking-wider ${
             activeTab === tab 
             ? 'bg-charcoal-800 dark:bg-white text-white dark:text-charcoal-900 shadow-md transform scale-[1.02]' 
             : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-white/30 dark:hover:bg-white/5'
           }`}
         >
           {tab}
         </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'playlists' ? (
          <>
            <button 
              onClick={handleCreatePlaylist}
              className="w-full py-5 border border-dashed border-stone-300 dark:border-stone-700 rounded-[2rem] text-stone-500 dark:text-stone-400 font-bold flex items-center justify-center gap-3 hover:bg-white/40 dark:hover:bg-white/5 transition-colors mb-6 group"
            >
              <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <Plus size={16} />
              </div>
              Create New Playlist
            </button>
            
            <div className="space-y-4">
              {playlists.length > 0 ? (
                playlists.map(playlist => (
                  <div 
                    key={playlist.id}
                    onClick={() => setViewingPlaylistId(playlist.id)}
                    className="glass-card flex items-center gap-5 p-4 rounded-[2rem] cursor-pointer hover:bg-white/60 dark:hover:bg-white/10 transition-all group border border-white/40 dark:border-white/5"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-white/50 dark:border-white/10 shadow-inner">
                      <ListMusic size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-charcoal-900 dark:text-white text-lg font-serif">{playlist.name}</h4>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-widest font-bold">{playlist.trackIds.length} Tracks</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent group-hover:bg-white/50 dark:group-hover:bg-white/10 transition-colors">
                        <ChevronLeft size={20} className="rotate-180 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200" />
                    </div>
                  </div>
                ))
              ) : (
                 <div className="text-center py-10">
                   <p className="text-stone-400 text-sm">No playlists created yet.</p>
                 </div>
              )}
            </div>
          </>
        ) : (
          (activeTab === 'favorites' ? favoriteTracks : downloadedTracks).length > 0 ? (
            (activeTab === 'favorites' ? favoriteTracks : downloadedTracks).map(track => (
              <LibraryItem 
                key={track.id} 
                track={track} 
                onClick={() => playTrack(track)} 
                isActive={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                downloaded={isDownloaded(track.id)}
                // Allow removing downloads if we are in the Downloads tab
                onRemove={activeTab === 'downloads' ? (e) => {
                  e.stopPropagation();
                  toggleDownload(track.id);
                } : undefined}
              />
            ))
          ) : (
            <EmptyState type={activeTab} />
          )
        )}
      </div>
    </div>
  );
};

const LibraryItem: React.FC<{ 
  track: Track, 
  onClick: () => void, 
  isActive: boolean,
  isPlaying: boolean,
  downloaded: boolean, 
  onRemove?: (e: React.MouseEvent) => void 
}> = ({ 
  track, 
  onClick, 
  isActive,
  isPlaying,
  downloaded, 
  onRemove 
}) => (
  <div 
    onClick={onClick}
    className={`group flex items-center gap-5 p-3 pr-5 rounded-[2rem] transition-all cursor-pointer border ${
      isActive 
      ? 'glass-card bg-white/60 border-white/80 dark:bg-white/10 dark:border-white/10' 
      : 'hover:bg-white/40 dark:hover:bg-white/5 border-transparent'
    }`}
  >
    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm border border-white/30 dark:border-white/5 flex-shrink-0">
      <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
      {isActive && isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
             <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
      )}
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
          <h4 className={`text-sm font-bold truncate tracking-wide ${isActive ? 'text-charcoal-900 dark:text-white' : 'text-charcoal-800 dark:text-stone-300'}`}>
            {track.title}
          </h4>
          {downloaded && (
             <CheckCircle2 size={12} className="text-teal-600 dark:text-teal-400 flex-shrink-0" fill="currentColor" stroke="white" />
          )}
      </div>
      <p className="text-[10px] text-stone-500 dark:text-stone-500 font-bold uppercase tracking-widest opacity-80">{track.artist}</p>
    </div>
    
    {isActive ? (
      <div className="w-10 h-10 rounded-full bg-charcoal-900 dark:bg-white flex items-center justify-center shadow-lg">
        {isPlaying ? (
           <div className="flex gap-0.5 items-end h-3">
             <div className="w-0.5 bg-white dark:bg-charcoal-900 h-full animate-[bounce_1s_infinite]"></div>
             <div className="w-0.5 bg-white dark:bg-charcoal-900 h-2/3 animate-[bounce_1.2s_infinite]"></div>
             <div className="w-0.5 bg-white dark:bg-charcoal-900 h-full animate-[bounce_0.8s_infinite]"></div>
           </div>
        ) : (
           <Play size={14} fill="currentColor" className="text-white dark:text-charcoal-900 ml-0.5" />
        )}
      </div>
    ) : onRemove ? (
      <button 
        onClick={onRemove} 
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-stone-300 hover:text-red-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>
    ) : null}
  </div>
);

const EmptyState = ({ type }: { type: Tab }) => (
  <div className="flex flex-col items-center justify-center py-20 text-stone-400 glass-card rounded-[2.5rem]">
    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/60 to-transparent dark:from-white/5 dark:to-transparent border border-white/50 dark:border-white/5 flex items-center justify-center mb-6 shadow-sm backdrop-blur-sm rotate-6">
      {type === 'favorites' ? <Heart size={36} className="text-stone-300 dark:text-stone-600" /> : <Download size={36} className="text-stone-300 dark:text-stone-600" />}
    </div>
    <p className="text-xl font-serif font-bold text-stone-600 dark:text-stone-300 capitalize">No {type} yet</p>
    <p className="text-xs font-bold uppercase tracking-widest mt-2 text-stone-400 opacity-70">Start listening to build your collection.</p>
  </div>
);

export default Library;