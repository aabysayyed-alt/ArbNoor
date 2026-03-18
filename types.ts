export enum Category {
  NAAT = 'Naat',
  NASHEED = 'Nasheed',
  HAMD = 'Hamd'
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  category: Category;
  url: string; // Can be a remote URL or a blob URL
  coverUrl: string; // Can be a remote URL or a blob URL
  duration: number; // in seconds
  isVocalsOnly: boolean;
  localAudioFile?: File; // For publisher upload
  localImageFile?: File; // For publisher upload
  publisherId?: string; // ID of the user who uploaded this
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AudioQuality = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  email: string;
  password?: string; // Stored locally in IndexedDB
  role: 'publisher' | 'user';
  name: string;
  createdAt?: number;
  preferences?: {
    theme: ThemeMode;
    quality: AudioQuality;
  };
}