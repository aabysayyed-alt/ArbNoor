import { Track, User } from '../types';

const DB_NAME = 'ArbNoor_v1';
const TRACKS_STORE = 'tracks';
const USERS_STORE = 'users';
const DB_VERSION = 3; // Bumped version to ensure clean slate if needed

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create Tracks Store if not exists
      if (!db.objectStoreNames.contains(TRACKS_STORE)) {
        db.createObjectStore(TRACKS_STORE, { keyPath: 'id' });
      }

      // Create Users Store if not exists
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const userStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }
    };
  });
};

// --- TRACKS OPERATIONS ---

// Save a track (including File objects) to DB
export const saveTrackToDB = async (track: Track) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([TRACKS_STORE], 'readwrite');
    const store = transaction.objectStore(TRACKS_STORE);
    
    // We clone the track to ensure we are storing a clean object.
    // IndexedDB supports storing File objects directly.
    // Note: The 'url' and 'coverUrl' strings might be Blob URLs from the session, 
    // which expire. We rely on 'localAudioFile' and 'localImageFile' for persistence.
    const request = store.put(track); 
    
    request.onsuccess = () => resolve();
    request.onerror = (e) => {
        console.error("IndexedDB Save Error:", request.error);
        reject(request.error);
    };
  });
};

// Retrieve all tracks and regenerate Blob URLs
export const getTracksFromDB = async (): Promise<Track[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TRACKS_STORE], 'readonly');
    const store = transaction.objectStore(TRACKS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
        const tracks = request.result as Track[];
        
        if (!tracks) {
            resolve([]);
            return;
        }

        // 1. Sort by ID descending (Newest first)
        // Assuming ID is a timestamp string
        tracks.sort((a, b) => Number(b.id) - Number(a.id));

        // 2. Hydrate: Create fresh Blob URLs for the current session
        const hydratedTracks = tracks.map(t => {
            let audioUrl = t.url;
            let coverUrl = t.coverUrl;

            // If we have the File object stored, create a new URL for this session
            if (t.localAudioFile instanceof Blob) {
                 audioUrl = URL.createObjectURL(t.localAudioFile);
            }
            
            if (t.localImageFile instanceof Blob) {
                 coverUrl = URL.createObjectURL(t.localImageFile);
            }
            
            return {
                ...t,
                url: audioUrl,
                coverUrl: coverUrl
            };
        });
        
        resolve(hydratedTracks);
    };
    request.onerror = () => reject(request.error);
  });
};

// Delete a track from DB
export const deleteTrackFromDB = async (id: string) => {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([TRACKS_STORE], 'readwrite');
        const store = transaction.objectStore(TRACKS_STORE);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

// --- USER OPERATIONS ---

export const registerUserInDB = async (user: User): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USERS_STORE], 'readwrite');
    const store = transaction.objectStore(USERS_STORE);
    
    const emailIndex = store.index('email');
    const checkRequest = emailIndex.get(user.email);

    checkRequest.onsuccess = () => {
      if (checkRequest.result) {
        reject(new Error("Email already registered"));
      } else {
        const addRequest = store.add(user);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      }
    };
    checkRequest.onerror = () => reject(checkRequest.error);
  });
};

export const getUserFromDB = async (email: string): Promise<User | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);
    const index = store.index('email');
    const request = index.get(email);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getUserByIdFromDB = async (id: string): Promise<User | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};