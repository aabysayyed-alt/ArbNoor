import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Track, AudioQuality, Playlist } from '../types';
import { saveTrackToDB, getTracksFromDB, deleteTrackFromDB } from '../utils/storage';

interface AudioContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  toggleFavorite: (trackId: string) => void;
  favorites: string[];
  history: Track[]; // Listening history
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
  isDownloaded: (trackId: string) => boolean;
  toggleDownload: (trackId: string) => void;
  audioQuality: AudioQuality;
  setAudioQuality: (q: AudioQuality) => void;
  // Playlist functions
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  // Admin functions
  addTrack: (track: Track) => Promise<void>;
  updateTrack: (track: Track) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  isLoading: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Persistence for user preferences
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('arbnoor_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [downloads, setDownloads] = useState<string[]>(() => {
    const saved = localStorage.getItem('arbnoor_downloads');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<Track[]>(() => {
    return []; 
  });
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('arbnoor_playlists');
    return saved ? JSON.parse(saved) : [];
  });

  const [audioQuality, setAudioQuality] = useState<AudioQuality>('high');
  const [sleepTimer, setSleepTimerState] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Load Tracks from IndexedDB on Mount
  useEffect(() => {
    const loadTracks = async () => {
        setIsLoading(true);
        try {
            const storedTracks = await getTracksFromDB();
            setTracks(storedTracks);
        } catch (error) {
            console.error("Failed to load tracks from storage:", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadTracks();
  }, []);

  // Playback Logic & Media Session
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    // We handle 'ended' by calling playNext. 
    // However, playNext needs to be accessible here.
    // We'll attach the listener in a separate effect or use a stable ref for playNext if needed.
    // But standard practice: define handler here.
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
      // Don't pause on unmount to allow navigation, but pause on full app unmount
    };
  }, []);

  // Sleep Timer
  useEffect(() => {
    if (sleepTimer !== null) {
      if (sleepTimer <= 0) {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
        setSleepTimerState(null);
        return;
      }
      timerRef.current = window.setTimeout(() => {
        setSleepTimerState(prev => (prev ? prev - 1 : null));
      }, 60000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sleepTimer]);

  const addToHistory = (track: Track) => {
    setHistory(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const playTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      if (currentTrack?.id === track.id) {
        // Just toggle if same track
        if (audioRef.current.paused) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        return;
      }
      
      // New Track
      setCurrentTrack(track);
      addToHistory(track);
      
      audioRef.current.src = track.url;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.error("Playback failed", e));
    }
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  }, [currentTrack, isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const playNext = useCallback(() => {
    // Need current tracks list and current track ID
    // We use functional state updates or refs if we were inside a closure, 
    // but here we rely on the component re-rendering or dependencies.
    // Since this is inside Context Provider, we need to be careful about dependencies.
    // However, to break dependency cycles, we can check the 'tracks' state directly.
    
    // NOTE: 'tracks' and 'currentTrack' are dependencies.
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  }, [currentTrack, tracks, playTrack]);

  const playPrev = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  }, [currentTrack, tracks, playTrack]);

  // Handle 'ended' event separate from mount effect to use updated playNext closure
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playNext]);

  // Media Session API Support (Lock Screen / Background)
  useEffect(() => {
    if (currentTrack && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: 'ArbNoor',
        artwork: [
          { src: currentTrack.coverUrl, sizes: '96x96', type: 'image/png' },
          { src: currentTrack.coverUrl, sizes: '128x128', type: 'image/png' },
          { src: currentTrack.coverUrl, sizes: '192x192', type: 'image/png' },
          { src: currentTrack.coverUrl, sizes: '256x256', type: 'image/png' },
          { src: currentTrack.coverUrl, sizes: '384x384', type: 'image/png' },
          { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
         audioRef.current?.play().catch(console.error);
         setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
         audioRef.current?.pause();
         setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) seek(details.seekTime);
      });
    }
  }, [currentTrack, playNext, playPrev, seek]);

  const toggleFavorite = (trackId: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId];
      localStorage.setItem('arbnoor_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const toggleDownload = (trackId: string) => {
    setDownloads(prev => {
      const newDownloads = prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId];
      localStorage.setItem('arbnoor_downloads', JSON.stringify(newDownloads));
      return newDownloads;
    });
  };

  const isDownloaded = (trackId: string) => downloads.includes(trackId);

  // Playlist Management
  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      trackIds: [],
      createdAt: Date.now()
    };
    setPlaylists(prev => {
      const updated = [newPlaylist, ...prev];
      localStorage.setItem('arbnoor_playlists', JSON.stringify(updated));
      return updated;
    });
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('arbnoor_playlists', JSON.stringify(updated));
      return updated;
    });
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      });
      localStorage.setItem('arbnoor_playlists', JSON.stringify(updated));
      return updated;
    });
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
        }
        return p;
      });
      localStorage.setItem('arbnoor_playlists', JSON.stringify(updated));
      return updated;
    });
  };

  const addTrack = async (track: Track) => {
    try {
        await saveTrackToDB(track);
        // We add to state immediately for responsiveness.
        setTracks(prev => [track, ...prev]);
    } catch (e) {
        console.error("Failed to save track", e);
        throw e; // Propagate error
    }
  };

  const updateTrack = async (track: Track) => {
    try {
        await saveTrackToDB(track);
        setTracks(prev => prev.map(t => t.id === track.id ? track : t));
        if (currentTrack?.id === track.id) {
          setCurrentTrack(track);
        }
    } catch (e) {
        console.error("Failed to update track", e);
        throw e;
    }
  };

  const deleteTrack = async (trackId: string) => {
    try {
        await deleteTrackFromDB(trackId);
        setTracks(prev => prev.filter(t => t.id !== trackId));
        if (currentTrack?.id === trackId) {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setCurrentTrack(null);
        }
    } catch (e) {
        console.error("Failed to delete track", e);
        throw e;
    }
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <AudioContext.Provider value={{
      tracks,
      currentTrack,
      isPlaying,
      progress,
      currentTime,
      duration,
      playTrack,
      togglePlay,
      playNext,
      playPrev,
      seek,
      toggleFavorite,
      favorites,
      history,
      sleepTimer,
      setSleepTimer: setSleepTimerState,
      isDownloaded,
      toggleDownload,
      audioQuality,
      setAudioQuality,
      playlists,
      createPlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      addTrack,
      updateTrack,
      deleteTrack,
      isLoading
    }}>
      {children}
    </AudioContext.Provider>
  );
};