import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, UserPlus, LogIn, User, Music, Mic, Eye, EyeOff, Check, X } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'publisher'>('user');
  
  // UX State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    noSpaces: true
  });
  
  const [formError, setFormError] = useState('');
  const { login, signup, authError } = useAuth();
  const navigate = useNavigate();

  // Reset visibility on unmount or mode toggle
  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isSignUp]);

  const validatePassword = (pass: string) => {
    const validations = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      noSpaces: !/\s/.test(pass)
    };
    setPasswordValidations(validations);
    return Object.values(validations).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    setPassword(newPass);
    if (isSignUp) {
      validatePassword(newPass);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isSignUp) {
      // Final Validation Check
      if (!validatePassword(password)) {
        setFormError("Please meet all password requirements.");
        return;
      }

      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }
      
      const success = await signup(email, password, name, role);
      if (success) navigate('/');

    } else {
      const success = await login(email, password);
      if (success) navigate('/');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormError('');
    setPasswordError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setRole('user');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pattern-bg relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-cream-50/90 dark:bg-stone-900/90 backdrop-blur-sm z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 glass-card rounded-[2rem] flex items-center justify-center mb-6 shadow-lg rotate-3 border border-white/60 dark:border-white/10 relative">
            <div className="absolute inset-0 ornament-bg opacity-10"></div>
            <ShieldCheck size={48} className="text-charcoal-800 dark:text-white" strokeWidth={1} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-charcoal-900 dark:text-white text-center">
            ArbNoor
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-bold tracking-widest uppercase">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-[2.5rem] shadow-2xl shadow-charcoal-900/5 dark:shadow-black/30 space-y-4 relative overflow-hidden bg-cream-50/60 dark:bg-stone-800/60">
          
          {(formError || authError) && (
            <div className="bg-red-50/90 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-4 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100 dark:border-red-900/50">
              <AlertCircle size={18} />
              {formError || authError}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-4">Full Name</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="relative w-full bg-white/60 dark:bg-black/20 border border-white/50 dark:border-stone-700 text-charcoal-900 dark:text-white pl-14 pr-6 py-4 rounded-[1.5rem] focus:outline-none focus:bg-white/80 dark:focus:bg-stone-900/50 focus:border-teal-300 transition-all placeholder:text-stone-300 font-medium text-sm"
                  placeholder="Your Name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-4">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative w-full bg-white/60 dark:bg-black/20 border border-white/50 dark:border-stone-700 text-charcoal-900 dark:text-white pl-14 pr-6 py-4 rounded-[1.5rem] focus:outline-none focus:bg-white/80 dark:focus:bg-stone-900/50 focus:border-teal-300 transition-all placeholder:text-stone-300 font-medium text-sm"
                placeholder="salam@arbnoor.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-4">Password</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handlePasswordChange}
                className="relative w-full bg-white/60 dark:bg-black/20 border border-white/50 dark:border-stone-700 text-charcoal-900 dark:text-white pl-14 pr-12 py-4 rounded-[1.5rem] focus:outline-none focus:bg-white/80 dark:focus:bg-stone-900/50 focus:border-teal-300 transition-all placeholder:text-stone-300 font-medium text-sm"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Real-time Password Validation Hints (Only for SignUp) */}
            {isSignUp && password.length > 0 && (
               <div className="px-4 pt-2 space-y-1">
                 <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <PasswordRule label="Min 8 chars" valid={passwordValidations.length} />
                    <PasswordRule label="Uppercase" valid={passwordValidations.upper} />
                    <PasswordRule label="Lowercase" valid={passwordValidations.lower} />
                    <PasswordRule label="Number" valid={passwordValidations.number} />
                    <PasswordRule label="No spaces" valid={passwordValidations.noSpaces} />
                 </div>
               </div>
            )}
          </div>

          {isSignUp && (
            <>
              <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-4">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="relative w-full bg-white/60 dark:bg-black/20 border border-white/50 dark:border-stone-700 text-charcoal-900 dark:text-white pl-14 pr-12 py-4 rounded-[1.5rem] focus:outline-none focus:bg-white/80 dark:focus:bg-stone-900/50 focus:border-teal-300 transition-all placeholder:text-stone-300 font-medium text-sm"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-4 mb-2 block">I am a...</label>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setRole('user')}
                    className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'user' ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-800 dark:text-teal-300' : 'bg-white/40 dark:bg-white/5 border-transparent text-stone-500 hover:bg-white/60'}`}
                  >
                    <Music size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Listener</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('publisher')}
                    className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'publisher' ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-800 dark:text-teal-300' : 'bg-white/40 dark:bg-white/5 border-transparent text-stone-500 hover:bg-white/60'}`}
                  >
                    <Mic size={20} />
                    <span className="text-xs font-bold uppercase tracking-wider">Publisher</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-charcoal-800 dark:bg-white hover:bg-charcoal-900 dark:hover:bg-stone-200 text-cream-50 dark:text-charcoal-900 font-bold py-5 rounded-[1.5rem] transition-all shadow-lg active:scale-95 mt-6 text-sm tracking-wide uppercase flex items-center justify-center gap-2"
          >
            {isSignUp ? (
              <><UserPlus size={18} /> Join ArbNoor</>
            ) : (
              <><LogIn size={18} /> Login</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-xs text-stone-500 font-medium">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button 
                onClick={toggleMode}
                className="mt-2 text-charcoal-800 dark:text-white font-bold uppercase tracking-wide text-xs hover:underline decoration-teal-500 decoration-2 underline-offset-4"
            >
                {isSignUp ? "Login Here" : "Create Account"}
            </button>
        </div>
      </div>
    </div>
  );
};

const PasswordRule = ({ label, valid }: { label: string, valid: boolean }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${valid ? 'text-teal-600 dark:text-teal-400' : 'text-stone-400 dark:text-stone-500'}`}>
    {valid ? <Check size={10} strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-600"></div>}
    {label}
  </div>
);

export default Auth;