import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { Moon, ShieldCheck, Trash2, Heart, Smartphone, Lock, ChevronRight } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-6 pb-32">
      <h1 className="text-3xl font-bold mb-8 text-stone-800 font-serif">Settings</h1>

      <div className="space-y-8">
        {/* Appearance */}
        <section>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 px-3">Preferences</h3>
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/60 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-stone-100/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50/80 rounded-2xl text-indigo-600"><Moon size={20} /></div>
                <span className="text-sm font-bold text-stone-700">Dark Mode</span>
              </div>
              <div className="w-12 h-7 bg-stone-200/80 rounded-full relative transition-colors cursor-pointer">
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            
             <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50/80 rounded-2xl text-amber-600"><Smartphone size={20} /></div>
                <div>
                  <span className="block text-sm font-bold text-stone-700">Audio Quality</span>
                  <span className="text-xs text-stone-400 font-medium">High (128kbps)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data */}
        <section>
             <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 px-3">Storage</h3>
             <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/60 shadow-sm">
                <button className="w-full flex items-center justify-between p-5 hover:bg-white/40 transition-colors">
                   <div className="flex items-center gap-4">
                       <div className="p-3 bg-red-50/80 rounded-2xl text-red-500"><Trash2 size={20} /></div>
                       <span className="text-sm font-bold text-stone-700">Clear Cache</span>
                   </div>
                   <ChevronRight size={18} className="text-stone-300" />
                </button>
             </div>
        </section>

        {/* Support */}
        <section>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 px-3">About</h3>
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-200 via-stone-200 to-amber-200"></div>
            
              <h4 className="text-teal-900 font-serif font-bold text-2xl mb-1 mt-2">ArbNoor Premium</h4>
              <p className="text-xs text-stone-400 mb-8 font-medium tracking-wide">Version 1.0.0 (Beta)</p>
              
              <p className="text-sm text-stone-600 leading-relaxed mb-8 font-medium">
                ArbNoor is a completely free initiative to provide high-quality Islamic audio without distractions or paywalls.
              </p>
              
              <div className="bg-stone-50/50 rounded-2xl p-5 mb-8 border border-stone-100/50">
                <h5 className="text-stone-800 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} className="text-teal-600" /> Strict Content Policy
                </h5>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Zero-tolerance for musical instruments. All content is strictly vocals-only (Naat, Nasheed, Hamd) to ensure a pure spiritual experience.
                </p>
              </div>
              
              <a 
                href="mailto:arbnoor.feedback@gmail.com?subject=Support%20ArbNoor" 
                className="bg-stone-800 text-[#FDFBF7] px-8 py-4 rounded-full font-bold text-sm shadow-xl shadow-stone-300 transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
              >
                <Heart size={16} fill="currentColor" className="text-red-400" />
                Support ArbNoor
              </a>
          </div>
        </section>
        
        {/* Publisher Link */}
        <div className="text-center pb-8 pt-2">
          <Link to="/admin/login" className="inline-flex items-center gap-2 text-[11px] font-bold text-stone-500 hover:text-stone-800 transition-colors bg-white/40 border border-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <Lock size={12} /> Go as Publisher
          </Link>
          <p className="text-[10px] text-stone-400 mt-4 opacity-70">
            Content is strictly Islamic (Naat, Nasheed, Hamd). No musical instruments used.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;