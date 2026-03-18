import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
// @ts-ignore
import { Link } from 'react-router-dom';
import { 
  History, Settings as SettingsIcon, ShieldCheck, 
  LogOut, ChevronRight, Moon, Sun, 
  Volume2, Crown, Mail, MessageSquare 
} from 'lucide-react';
import { ThemeMode, AudioQuality } from '../types';

const Account = () => {
  const { user, logout, isAdmin } = useAuth();
  const { history, playTrack, currentTrack, isPlaying, audioQuality, setAudioQuality } = useAudio();
  const { theme, setTheme } = useTheme();
  
  // Feedback form state
  const [feedback, setFeedback] = useState('');

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // Internally route to arbnoor.feedback@gmail.com
    const subject = encodeURIComponent(`ArbNoor Feedback from ${user?.name || 'User'}`);
    const body = encodeURIComponent(feedback);
    window.location.href = `mailto:arbnoor.feedback@gmail.com?subject=${subject}&body=${body}`;
    
    setFeedback('');
  };

  return (
    <div className="p-6 pb-32 min-h-full">
      <div className="flex justify-between items-center mb-8 pt-4">
        <h1 className="text-3xl font-bold text-charcoal-900 dark:text-stone-100 font-serif">My Account</h1>
        {isAdmin && (
            <span className="bg-charcoal-100 dark:bg-stone-700 text-charcoal-800 dark:text-white text-[10px] font-bold px-3 py-1 rounded-full border border-charcoal-200 dark:border-stone-600 uppercase tracking-wider">
                Publisher
            </span>
        )}
      </div>

      <div className="space-y-8">
        
        {/* 1. My Account Section - Glass Card */}
        <section className="glass-card bg-cream-50/60 dark:bg-stone-800/60 rounded-[2.5rem] p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-charcoal-600 to-charcoal-800 rounded-full flex items-center justify-center text-white text-2xl font-serif font-bold shadow-lg">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded-md w-fit">
                {user?.role === 'publisher' ? <Crown size={12} className="text-gold-500" /> : <ShieldCheck size={12} />}
                {user?.role === 'publisher' ? 'Publisher Account' : 'Listener Account'}
              </div>
            </div>
          </div>
          
          {user?.role === 'publisher' && (
             <Link to="/admin/dashboard" className="w-full bg-charcoal-800 dark:bg-white hover:bg-charcoal-900 dark:hover:bg-stone-200 text-white dark:text-charcoal-900 py-4 rounded-[1.5rem] text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-stone-300 dark:shadow-none mt-4">
                Go to Publisher Dashboard <ChevronRight size={16} />
             </Link>
          )}
        </section>

        {/* 2. Listening History */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <History size={18} className="text-stone-400" />
            <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.2em]">Recently Played</h3>
          </div>
          
          {history.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
              {history.map((track) => (
                <div 
                  key={track.id} 
                  onClick={() => playTrack(track)}
                  className="flex-shrink-0 w-32 snap-start group cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-[1.5rem] overflow-hidden relative shadow-sm mb-3 border border-white/50 dark:border-white/10 bg-stone-100 dark:bg-stone-800">
                    <img src={track.coverUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt={track.title} />
                    {currentTrack?.id === track.id && isPlaying && (
                       <div className="absolute inset-0 bg-charcoal-900/40 flex items-center justify-center backdrop-blur-[1px]">
                         <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <span className="block w-2 h-2 bg-charcoal-800 rounded-sm animate-spin"></span>
                         </div>
                       </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-charcoal-800 dark:text-stone-200 truncate pr-1">{track.title}</p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-500 truncate font-medium">{track.artist}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card bg-white/40 dark:bg-white/5 rounded-2xl p-6 text-center border-dashed border-stone-300 dark:border-stone-700">
              <p className="text-xs font-medium text-stone-400">No history yet. Start listening!</p>
            </div>
          )}
        </section>

        {/* 3. Settings / Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <SettingsIcon size={18} className="text-stone-400" />
            <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.2em]">Preferences</h3>
          </div>
          
          <div className="glass-card bg-cream-50/60 dark:bg-stone-800/60 rounded-[2rem] overflow-hidden border border-white/60 dark:border-white/10 shadow-sm divide-y divide-stone-100 dark:divide-stone-700/50">
            
            {/* Dark Mode */}
            <div className="p-5 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <span className="text-sm font-bold text-stone-700 dark:text-stone-200">Appearance</span>
              </div>
              <div className="flex bg-stone-100 dark:bg-stone-900/80 rounded-lg p-1">
                {(['light', 'system', 'dark'] as ThemeMode[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${theme === t ? 'bg-white dark:bg-stone-700 shadow-sm text-charcoal-800 dark:text-white' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Quality */}
            <div className="p-5 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Volume2 size={18} />
                </div>
                <span className="text-sm font-bold text-stone-700 dark:text-stone-200">Audio Quality</span>
              </div>
              <div className="flex bg-stone-100 dark:bg-stone-900/80 rounded-lg p-1">
                {(['low', 'medium', 'high'] as AudioQuality[]).map((q) => (
                   <button
                   key={q}
                   onClick={() => setAudioQuality(q)}
                   className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${audioQuality === q ? 'bg-white dark:bg-stone-700 shadow-sm text-charcoal-800 dark:text-white' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
                 >
                   {q}
                 </button>
                ))}
              </div>
            </div>
            
          </div>
        </section>

        {/* 4. About ArbNoor */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <ShieldCheck size={18} className="text-stone-400" />
            <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.2em]">About</h3>
          </div>
          <div className="glass-card bg-cream-50/60 dark:bg-stone-800/60 rounded-[2.5rem] border border-white/60 dark:border-white/10 p-8 relative overflow-hidden">
             
             {/* Decorative pattern fade */}
             <div className="absolute inset-0 pattern-bg opacity-10 pointer-events-none"></div>

             <div className="relative z-10 text-center">
                 <h4 className="font-serif font-bold text-xl text-charcoal-900 dark:text-white mb-3">ArbNoor Mission</h4>
                 <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-6 font-medium">
                   Providing a premium, distraction-free environment for Islamic audio. Strictly <strong className="text-charcoal-800 dark:text-white">Vocals Only</strong>.
                 </p>
                 <div className="bg-white/60 dark:bg-stone-700/50 p-4 rounded-2xl border border-white/60 dark:border-stone-600/50 backdrop-blur-sm inline-block">
                   <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wide font-bold">
                     Version 1.0.0 (Beta)
                   </p>
                 </div>
             </div>
          </div>
        </section>

        {/* 5. Contact Us */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <MessageSquare size={18} className="text-stone-400" />
            <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-[0.2em]">Contact</h3>
          </div>
          <div className="glass-card bg-cream-50/60 dark:bg-stone-800/60 rounded-[2.5rem] border border-white/60 dark:border-white/10 p-6">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-stone-700/50 flex items-center justify-center text-stone-400 dark:text-stone-300 shadow-sm border border-white/50">
                 <Mail size={20} />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Email Support</p>
                 <p className="text-sm font-bold text-charcoal-900 dark:text-white">salam@arbnoor.com</p>
               </div>
             </div>

             <form onSubmit={handleFeedbackSubmit}>
               <textarea 
                 value={feedback}
                 onChange={(e) => setFeedback(e.target.value)}
                 placeholder="Send us feedback..."
                 className="w-full bg-white/60 dark:bg-black/20 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 text-sm focus:outline-none focus:bg-white/80 focus:border-stone-300 mb-3 min-h-[100px] text-charcoal-900 dark:text-white placeholder:text-stone-400 resize-none font-medium transition-all"
                 required
               />
               <button type="submit" className="w-full bg-charcoal-800 dark:bg-white hover:bg-charcoal-900 dark:hover:bg-stone-200 text-white dark:text-charcoal-900 py-4 rounded-[1.5rem] text-xs font-bold uppercase tracking-wide transition-all active:scale-95 shadow-lg shadow-stone-300 dark:shadow-none">
                 Send Feedback
               </button>
             </form>
          </div>
        </section>

        <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wide py-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors">
          <LogOut size={16} /> Log Out
        </button>

      </div>
    </div>
  );
};

export default Account;