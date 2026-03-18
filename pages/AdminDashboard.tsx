import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Trash2, Play, Square, CheckCircle, Upload, Image as ImageIcon, Music, ArrowLeft, MoreHorizontal, User, Edit2, X, Save, Loader2, AlertCircle } from 'lucide-react';
import { Category, Track } from '../types';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { tracks, addTrack, updateTrack, deleteTrack } = useAudio();
  const navigate = useNavigate();

  // Filter tracks to show only those owned by this publisher
  const myTracks = tracks.filter(t => t.publisherId === user?.id);

  // Edit Mode State
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState<Category>(Category.NAAT);
  
  // File State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Previews
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');

  const [isVocalsVerified, setIsVocalsVerified] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // File Refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleExit = () => {
    if (previewAudio) {
      previewAudio.pause();
    }
    navigate('/account');
  };

  const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/x-m4a', 'audio/mp4', 'audio/aac'];

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!allowedAudioTypes.includes(file.type)) {
        setErrorMsg("Invalid audio format. Allowed: MP3, WAV, M4A.");
        if (audioInputRef.current) audioInputRef.current.value = '';
        return;
      }
      setAudioFile(file);
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg("Please upload a valid image file.");
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const handlePreview = () => {
    if (isPreviewPlaying && previewAudio) {
      previewAudio.pause();
      setIsPreviewPlaying(false);
    } else {
      if (!audioPreviewUrl) return;
      const audio = new Audio(audioPreviewUrl);
      audio.onended = () => setIsPreviewPlaying(false);
      audio.play().catch(e => alert("Could not play audio."));
      setPreviewAudio(audio);
      setIsPreviewPlaying(true);
    }
  };

  const resetForm = () => {
    setEditingTrackId(null);
    setTitle('');
    setArtist('');
    setCategory(Category.NAAT);
    setAudioFile(null);
    setImageFile(null);
    setAudioPreviewUrl('');
    setImagePreviewUrl('');
    setIsVocalsVerified(false);
    setIsUploading(false);
    setUploadProgress(0);
    setErrorMsg('');
    if(audioInputRef.current) audioInputRef.current.value = '';
    if(imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleEditClick = (track: Track) => {
    setEditingTrackId(track.id);
    setTitle(track.title);
    setArtist(track.artist);
    setCategory(track.category);
    // Set current URLs for preview. 
    setAudioPreviewUrl(track.url);
    setImagePreviewUrl(track.coverUrl);
    setIsVocalsVerified(true);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const simulateUpload = (): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        setUploadProgress(Math.floor(progress));
        if (progress === 100) {
          clearInterval(interval);
          resolve();
        }
      }, 300); // 300ms * 5-10 ticks ~= 2-3 seconds total
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!user) {
        setErrorMsg("You must be logged in to publish.");
        return;
    }

    if (!isVocalsVerified) {
      setErrorMsg("You must verify that the content is Vocals Only.");
      return;
    }

    // Mandatory Thumbnail Check
    if (!imageFile && !editingTrackId) {
        setErrorMsg("A thumbnail image is mandatory.");
        return;
    }
    // For editing, if no new image selected, we assume existing one is valid (as it was mandatory on creation)

    setIsUploading(true);
    setUploadProgress(0);

    try {
        await simulateUpload();

        if (editingTrackId) {
           // --- UPDATE EXISTING TRACK ---
           const existingTrack = tracks.find(t => t.id === editingTrackId);
           if (!existingTrack) throw new Error("Track not found");

           const updatedTrack: Track = {
             ...existingTrack,
             title,
             artist,
             category,
             // If new file selected, use it. Else keep existing.
             localAudioFile: audioFile || existingTrack.localAudioFile,
             localImageFile: imageFile || existingTrack.localImageFile,
             // If new file, use new preview URL (Blob). Else keep existing URL.
             url: audioFile ? audioPreviewUrl : existingTrack.url,
             coverUrl: imageFile ? imagePreviewUrl : existingTrack.coverUrl,
           };

           await updateTrack(updatedTrack);

        } else {
           // --- CREATE NEW TRACK ---
           if (!audioFile || !imageFile) {
                setErrorMsg("Both audio and thumbnail files are mandatory.");
                setIsUploading(false);
                return;
           }

           // Check for duplicates (simple check by title+artist)
           const isDuplicate = tracks.some(t => t.title.toLowerCase() === title.toLowerCase() && t.artist.toLowerCase() === artist.toLowerCase());
           if (isDuplicate) {
               setErrorMsg("A track with this title and artist already exists.");
               setIsUploading(false);
               return;
           }

           const newTrack: Track = {
              id: Date.now().toString(),
              title,
              artist,
              category,
              url: audioPreviewUrl, 
              coverUrl: imagePreviewUrl,
              duration: 0, 
              isVocalsOnly: true,
              localAudioFile: audioFile,
              localImageFile: imageFile,
              publisherId: user.id
           };

           await addTrack(newTrack);
        }
        
        resetForm();
        alert(editingTrackId ? "Track updated successfully!" : "Track published successfully!");

    } catch (err) {
        console.error(err);
        setErrorMsg("Upload failed. Please try again.");
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeleteClick = async (trackId: string) => {
    if (window.confirm("Are you sure you want to delete this audio?")) {
      try {
        await deleteTrack(trackId);
        if (editingTrackId === trackId) resetForm();
      } catch (e) {
        alert("Failed to delete track.");
      }
    }
  };

  return (
    <div className="min-h-screen relative pattern-bg pb-20 overflow-x-hidden">
      
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-cream-50/90 dark:bg-stone-900/90 backdrop-blur-sm z-0"></div>
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Upload Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-stone-800 p-8 rounded-[2rem] w-80 shadow-2xl flex flex-col items-center">
                <Loader2 size={48} className="text-teal-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-charcoal-900 dark:text-white mb-2">{editingTrackId ? 'Updating...' : 'Uploading...'}</h3>
                <div className="w-full h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-teal-500 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs font-bold text-stone-400">{uploadProgress}%</p>
            </div>
        </div>
      )}

      {/* Navbar */}
      <div className="relative z-20 px-6 pt-6 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center border border-white/60 dark:border-white/10 shadow-lg">
             <ShieldCheck size={24} className="text-charcoal-900 dark:text-white" strokeWidth={1} />
          </div>
          <div>
            <h1 className="font-bold text-charcoal-900 dark:text-white font-serif text-2xl leading-none">Publisher</h1>
            <div className="flex items-center gap-1.5 text-[9px] tracking-widest text-teal-700 dark:text-teal-400 font-bold uppercase mt-1.5">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
              {user?.name || 'Workspace'}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleExit} 
          className="flex items-center gap-2 px-4 py-3 glass-card rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-charcoal-900 dark:text-stone-400 dark:hover:text-white transition-colors hover:bg-white/60"
        >
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Back to App</span>
        </button>
      </div>

      <div className="relative z-10 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Upload/Edit Form */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-[2.5rem] p-8 shadow-2xl shadow-charcoal-900/5 border border-white/60 dark:border-white/5 bg-cream-50/60 dark:bg-stone-800/60 relative overflow-hidden sticky top-6">
             {/* Decorative Top Gradient */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-stone-300 to-gold-400 opacity-50"></div>

            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <span className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${editingTrackId ? 'bg-gold-500 text-white' : 'bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900'}`}>
                   {editingTrackId ? <Edit2 size={18} /> : <Plus size={20} />}
                 </span>
                 <h2 className="text-xl font-bold font-serif text-charcoal-900 dark:text-white">
                   {editingTrackId ? 'Edit Content' : 'Upload New'}
                 </h2>
               </div>
               {editingTrackId && (
                 <button onClick={resetForm} className="text-stone-400 hover:text-stone-600 transition-colors p-2" title="Cancel Edit">
                   <X size={20} />
                 </button>
               )}
            </div>

            {errorMsg && (
                <div className="mb-6 bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-600 dark:text-red-300 leading-relaxed">{errorMsg}</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Metadata Inputs */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest ml-4">Track Title</label>
                  <input 
                    required 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full bg-white/60 dark:bg-black/20 border border-white/50 dark:border-stone-700 rounded-[1.5rem] px-6 py-4 text-sm focus:outline-none focus:bg-white/80 dark:focus:bg-stone-900/50 focus:border-teal-300 transition-all placeholder:text-stone-300 font-medium text-charcoal-900 dark:text-white shadow-sm" 
                    placeholder="e.g. Maula Ya Salli" 
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest ml-4">Reciter / Artist</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                    <input 
                      required 
                      value={artist} 
                      onChange={e => setArtist(e.target.value)} 
                      className="w-full bg-white/60 dark:bg-black/20 border border-white/50 dark:border-stone-700 rounded-[1.5rem] pl-12 pr-6 py-4 text-sm focus:outline-none focus:bg-white/80 dark:focus:bg-stone-900/50 focus:border-teal-300 transition-all placeholder:text-stone-300 font-medium text-charcoal-900 dark:text-white shadow-sm" 
                      placeholder="e.g. Junaid Jamshed" 
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest ml-4">Category</label>
                  <div className="relative">
                      <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value as Category)} 
                        className="w-full bg-white/60 dark:bg-black/20 border border-white/50 dark:border-stone-700 rounded-[1.5rem] px-6 py-4 text-sm focus:outline-none focus:bg-white/80 dark:focus:bg-stone-900/50 focus:border-teal-300 transition-all font-medium appearance-none text-charcoal-900 dark:text-white shadow-sm cursor-pointer"
                        disabled={isUploading}
                      >
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <MoreHorizontal className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* Upload Zones */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Audio Zone */}
                <div className={`col-span-1 border-2 border-dashed rounded-[2rem] p-4 flex flex-col items-center justify-center text-center transition-all aspect-square cursor-pointer relative overflow-hidden group ${audioPreviewUrl ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-900/20' : 'border-stone-200 dark:border-stone-700 hover:border-teal-300 hover:bg-white/40'}`}>
                    <input 
                        type="file" 
                        accept=".mp3,.wav,.m4a" 
                        ref={audioInputRef}
                        onChange={handleAudioFileChange}
                        className="hidden" 
                        id="audio-upload"
                        disabled={isUploading}
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center z-10">
                        {audioPreviewUrl ? (
                            <>
                                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-200 flex items-center justify-center mb-2 shadow-sm">
                                  <Music size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 truncate w-full px-2">
                                  {audioFile ? audioFile.name : (editingTrackId ? "Existing File" : "Audio Selected")}
                                </span>
                                <button type="button" onClick={handlePreview} className="mt-2 text-[9px] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 shadow-sm hover:scale-105 transition-transform z-20">
                                    {isPreviewPlaying ? <Square size={8} className="text-red-500" fill="currentColor"/> : <Play size={8} className="text-teal-600" fill="currentColor"/>}
                                    Preview
                                </button>
                                {editingTrackId && <span className="text-[8px] text-stone-400 mt-2 uppercase">Click to Replace</span>}
                            </>
                        ) : (
                            <>
                                <Upload size={24} className="text-stone-300 group-hover:text-teal-500 transition-colors mb-2" />
                                <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-600">Select Audio</span>
                                <span className="text-[8px] text-stone-300 mt-1 uppercase">MP3, WAV, M4A</span>
                            </>
                        )}
                    </label>
                </div>

                {/* Image Zone */}
                <div className={`col-span-1 border-2 border-dashed rounded-[2rem] p-4 flex flex-col items-center justify-center text-center transition-all aspect-square cursor-pointer relative overflow-hidden group ${imagePreviewUrl ? 'border-teal-400' : 'border-stone-200 dark:border-stone-700 hover:border-teal-300 hover:bg-white/40'}`}>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={imageInputRef}
                        onChange={handleImageFileChange}
                        className="hidden" 
                        id="image-upload"
                        disabled={isUploading}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center z-20">
                         {!imagePreviewUrl && (
                            <>
                                <ImageIcon size={24} className="text-stone-300 group-hover:text-teal-500 transition-colors mb-2" />
                                <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-600">Select Cover</span>
                                <span className="text-[8px] text-stone-300 mt-1 uppercase text-red-400/80 font-bold">* Mandatory</span>
                            </>
                         )}
                         {imagePreviewUrl && <span className="sr-only">Change</span>}
                    </label>
                    {imagePreviewUrl && (
                        <>
                           <img src={imagePreviewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-10 opacity-100" />
                           <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <p className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 uppercase tracking-widest border border-white px-2 py-1 rounded">
                                {editingTrackId && !imageFile ? "Replace" : "Change"}
                              </p>
                           </div>
                        </>
                    )}
                </div>
              </div>

              {/* Verification */}
              <div className="bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-[2rem] p-5 shadow-sm">
                <label className="flex items-start gap-4 cursor-pointer group">
                  <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${isVocalsVerified ? 'bg-teal-600 border-teal-600' : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-transparent group-hover:border-teal-400'}`}>
                    {isVocalsVerified && <CheckCircle size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isVocalsVerified} onChange={e => setIsVocalsVerified(e.target.checked)} disabled={isUploading} />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-charcoal-900 dark:text-white block mb-1">Vocals Only Verification</span>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                      I certify that this audio file does NOT contain any musical instruments, beats, or non-compliant background music.
                    </p>
                  </div>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className={`w-full hover:bg-charcoal-900 dark:hover:bg-stone-200 text-cream-50 dark:text-charcoal-900 font-bold py-5 rounded-[1.5rem] transition-all shadow-xl shadow-charcoal-900/10 active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${editingTrackId ? 'bg-gold-500 text-white' : 'bg-charcoal-800 dark:bg-white'} ${isUploading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isUploading ? 'Processing...' : (editingTrackId ? <><Save size={16} /> Save Changes</> : <><Upload size={16} /> Publish Content</>)}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Manage Content */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-[2.5rem] border border-white/60 dark:border-white/5 shadow-2xl shadow-charcoal-900/5 bg-cream-50/60 dark:bg-stone-800/60 flex flex-col h-full min-h-[600px] overflow-hidden">
             
             {/* Header */}
             <div className="p-8 pb-4 border-b border-stone-100 dark:border-stone-700/50 flex justify-between items-end bg-white/40 dark:bg-white/5 backdrop-blur-md">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal-900 dark:text-white">Published Library</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">Manage your content visibility</p>
                </div>
                <div className="text-right bg-white/60 dark:bg-white/10 px-4 py-2 rounded-2xl border border-white/50 dark:border-white/10">
                   <p className="text-2xl font-bold text-charcoal-900 dark:text-white leading-none">{myTracks.length}</p>
                   <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Tracks</p>
                </div>
             </div>

             {/* List Content */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {myTracks.length > 0 ? (
                 myTracks.map((track) => (
                   <div key={track.id} className="group relative flex items-center gap-4 p-3 pr-5 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-none">
                      
                      {/* Image */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/50 shadow-sm relative">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="text-sm font-bold text-charcoal-900 dark:text-white truncate">{track.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-md uppercase tracking-wide border border-teal-100 dark:border-teal-800/50">
                            {track.category}
                          </span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium truncate">
                            {track.artist}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleEditClick(track)}
                           disabled={isUploading}
                           className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300 hover:bg-gold-400 hover:text-white dark:hover:bg-gold-500 transition-colors shadow-sm"
                           title="Edit Audio"
                         >
                           <Edit2 size={16} />
                         </button>
                         <button 
                           onClick={() => handleDeleteClick(track.id)}
                           disabled={isUploading}
                           className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                           title="Delete Audio"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>

                   </div>
                 ))
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center pb-20 opacity-60">
                    <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                       <Upload size={32} className="text-stone-400" />
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 font-medium text-sm">No audio uploaded yet.</p>
                    <p className="text-xs text-stone-400 mt-1">Use the form to add content.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;