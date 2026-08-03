import React, { useState } from 'react';
import { registerUserInSupabase, loginUserInSupabase } from '../api';
import { signInWithEmail, signInWithGoogle } from '../supabaseClient';
import BrandLogo from './BrandLogo';

export interface UserProfile {
  name: string;
  role: 'Farmer' | 'Retailer' | 'Cooperative' | 'Transport Provider';
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  ward?: string;
  localLocation?: string;
  extraField1?: string;
  extraField2?: string;
}

interface SignUpProps {
  initialProfile?: UserProfile;
  authErrorNotice?: string | null;
  initialMode?: Mode;
  onNavigateBack: () => void;
  onNavigateToDashboard?: (profile: UserProfile) => void;
}

type Role = 'Farmer' | 'Retailer' | 'Cooperative' | 'Transport Provider';
type Mode = 'wizard' | 'login';

export default function SignUp({ initialProfile, authErrorNotice, initialMode, onNavigateBack, onNavigateToDashboard }: SignUpProps) {
  const [mode, setMode] = useState<Mode>(() => {
    if (initialMode) return initialMode;
    if (authErrorNotice?.includes('registered using Email and Password')) return 'login';
    if (authErrorNotice?.includes('No registered account found')) return 'wizard';
    if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.hash.includes('error='))) {
      return 'login';
    }
    return 'wizard';
  });
  const [step, setStep] = useState<number>(1);
  const [authLoading, setAuthLoading] = useState(false);

  // Form State
  const [selectedRole, setSelectedRole] = useState<Role>('Farmer');
  const [name, setName] = useState(initialProfile?.name || '');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('Bagmati Province');
  const [district, setDistrict] = useState('Kathmandu');
  const [ward, setWard] = useState('1');
  const [localLocation, setLocalLocation] = useState('');
  const [extraField1, setExtraField1] = useState('');
  const [extraField2, setExtraField2] = useState('');

  // Login / Signup Auth Credentials
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(authErrorNotice || '');

  React.useEffect(() => {
    if (authErrorNotice) {
      setFormError(authErrorNotice);
      if (authErrorNotice.includes('registered using Email and Password')) {
        setMode('login');
      } else if (authErrorNotice.includes('No registered account found')) {
        setMode('wizard');
      }
      // Auto pre-fill the email address extracted from the warning message
      const match = authErrorNotice.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        setEmail(match[1]);
      }
    }
  }, [authErrorNotice]);

  const roles = [
    {
      id: 'Farmer' as Role,
      title: 'Farmer',
      icon: 'agriculture',
      description: 'Access real-time market prices, connect with buyers, and get AI crop advisory.',
      label1: 'Primary Crop',
      placeholder1: 'e.g. Large Cardamom, Potato, Apple',
      label2: 'Land Size (Optional)',
      placeholder2: 'e.g. 5 Ropani / 2 Bigha',
    },
    {
      id: 'Retailer' as Role,
      title: 'Retailer',
      icon: 'storefront',
      description: 'Source quality produce directly from farmers and track wholesale market trends.',
      label1: 'Store / Business Name',
      placeholder1: 'e.g. Kalimati Fresh Produce',
      label2: 'Monthly Sourcing Volume (Optional)',
      placeholder2: 'e.g. 1,500 kg / month',
    },
    {
      id: 'Cooperative' as Role,
      title: 'Cooperative',
      icon: 'groups',
      description: 'Manage member farmers, bulk negotiate prices, and plan regional logistics.',
      label1: 'Registered Cooperative Name',
      placeholder1: 'e.g. Mustang Agro Cooperative',
      label2: 'Active Member Count (Optional)',
      placeholder2: 'e.g. 120 Members',
    },
    {
      id: 'Transport Provider' as Role,
      title: 'Transport Provider',
      icon: 'local_shipping',
      description: 'Optimize route planning, find backhaul loads, and connect with local farmers.',
      label1: 'Vehicle Type',
      placeholder1: 'e.g. 5-Ton Mini Truck',
      label2: 'License Plate (Optional)',
      placeholder2: 'e.g. BA 3 PA 1234',
    },
  ];

  const currentRoleConfig = roles.find((r) => r.id === selectedRole) || roles[0];

  const nepalAdminData: Record<string, string[]> = {
    'Koshi Province': ['Taplejung', 'Sankhuwasabha', 'Solukhumbu', 'Dhankuta', 'Ilam', 'Jhapa', 'Morang', 'Sunsari'],
    'Madhesh Province': ['Saptari', 'Siraha', 'Dhanusha', 'Mahottari', 'Sarlahi', 'Rautahat', 'Bara', 'Parsa'],
    'Bagmati Province': ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Chitwan', 'Makwanpur', 'Nuwakot', 'Dhading'],
    'Gandaki Province': ['Kaski', 'Syangja', 'Baglung', 'Myagdi', 'Mustang', 'Lamjung', 'Gorkha', 'Tanahun'],
    'Lumbini Province': ['Rupandehi', 'Kapilvastu', 'Palpa', 'Banke', 'Bardiya', 'Dang'],
    'Karnali Province': ['Surkhet', 'Dailekh', 'Jajarkot', 'Rukum West', 'Jumla'],
    'Sudurpashchim Province': ['Kailali', 'Kanchanpur', 'Dadeldhura', 'Doti', 'Achham'],
  };

  const provinces = Object.keys(nepalAdminData);
  const districtsForProvince = nepalAdminData[province] ?? [];
  const wardNumbers = Array.from({ length: 35 }, (_, i) => String(i + 1));

  // Validation
  const validateStep = (currentStep: number): boolean => {
    setFormError('');
    if (currentStep === 1) {
      if (!selectedRole) {
        setFormError('Please select your role.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!name.trim()) {
        setFormError('Please enter your Full Name.');
        return false;
      }
      if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) {
        setFormError('Please enter a valid 10-digit mobile number.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!province || !district) {
        setFormError('Please select your Province and District.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!extraField1.trim()) {
        setFormError(`Please specify your ${currentRoleConfig.label1}.`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setFormError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Sign Up Submission (Step 5)
  const handleFinalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter your Email and Password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    try {
      setAuthLoading(true);
      setFormError('');

      const newProfile: UserProfile = {
        name: name.trim(),
        role: selectedRole,
        phone: phone.trim(),
        email: email.trim(),
        province,
        district,
        ward,
        localLocation: localLocation.trim(),
        extraField1: extraField1.trim(),
        extraField2: extraField2.trim(),
      };

      // 1. Send profile + credentials to backend API with isNewSignup check
      const res = await registerUserInSupabase({
        email: email.trim(),
        password: password,
        name: newProfile.name,
        role: newProfile.role,
        phone: newProfile.phone || '',
        province: newProfile.province,
        district: newProfile.district,
        ward: newProfile.ward,
        localLocation: newProfile.localLocation,
        extraField1: newProfile.extraField1,
        extraField2: newProfile.extraField2,
        isNewSignup: true,
      });

      if (res?.error) {
        setFormError(res.error);
        return;
      }

      // 2. Sign in immediately to retrieve valid Supabase session
      try {
        await signInWithEmail(email.trim(), password);
      } catch (e) {
        // Fallback session
      }

      if (onNavigateToDashboard) {
        onNavigateToDashboard(newProfile);
      }
    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Direct Log In Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter your Email and Password.');
      return;
    }

    try {
      setAuthLoading(true);
      setFormError('');

      // 1. Try login endpoint (handles Supabase Auth + Database fallback)
      const res = await loginUserInSupabase(email.trim(), password);

      if (res?.user) {
        const u = res.user;
        const profile: UserProfile = {
          name: u.name || u.user_metadata?.full_name || email.split('@')[0],
          email: u.email || email.trim(),
          role: u.role || 'Farmer',
          phone: u.phone,
          province: u.province,
          district: u.district,
          ward: u.ward,
          localLocation: u.local_location,
          extraField1: u.extra_field_1,
          extraField2: u.extra_field_2,
        };

        try {
          await signInWithEmail(email.trim(), password);
        } catch {}

        if (onNavigateToDashboard) {
          onNavigateToDashboard(profile);
        }
        return;
      }

      setFormError(res?.error || 'Invalid login credentials. Please check your email and password.');
    } catch (err: any) {
      setFormError(err.message || 'Invalid login credentials. Please check your email and password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setAuthLoading(true);
      setFormError('');

      // Validate questionnaire fields first
      if (!name.trim()) {
        setFormError('Please enter your Full Name in Step 2.');
        setStep(2);
        setAuthLoading(false);
        return;
      }
      if (!phone.trim() || !/^\d{10}$/.test(phone.trim())) {
        setFormError('Please enter a valid 10-digit mobile number in Step 2.');
        setStep(2);
        setAuthLoading(false);
        return;
      }
      if (!province || !district) {
        setFormError('Please select your location in Step 3.');
        setStep(3);
        setAuthLoading(false);
        return;
      }

      // Save questionnaire details to localStorage before redirecting to Google OAuth
      const pendingProfile: UserProfile = {
        name: name.trim(),
        role: selectedRole,
        phone: phone.trim(),
        email: email.trim(),
        province,
        district,
        ward,
        localLocation: localLocation.trim(),
        extraField1: extraField1.trim(),
        extraField2: extraField2.trim(),
      };
      localStorage.setItem('pending_google_signup_profile', JSON.stringify(pendingProfile));

      await signInWithGoogle();
    } catch (err: any) {
      setFormError(err.message || 'Google authentication failed.');
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setAuthLoading(true);
      setFormError('');
      await signInWithGoogle();
    } catch (err: any) {
      setFormError(err.message || 'Google authentication failed.');
      setAuthLoading(false);
    }
  };

  return (
    <div className="bg-[#faf8ff] text-slate-800 min-h-screen flex flex-col relative font-body-sm selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Header Navigation Bar (Identical to Landing Page) */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/20 px-4 md:px-12 h-16 flex items-center justify-between">
        <BrandLogo
          size="md"
          onClick={onNavigateBack}
        />
        <nav className="hidden md:flex gap-6">
          <button onClick={onNavigateBack} className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200 border-none bg-transparent cursor-pointer">Features</button>
          <button onClick={onNavigateBack} className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200 border-none bg-transparent cursor-pointer">How it Works</button>
          <button onClick={onNavigateBack} className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200 border-none bg-transparent cursor-pointer">Testimonials</button>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-label-caps hover:bg-primary-container transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer border-none"
          >
            Home
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="pt-24 pb-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        
        {/* Minimalist Centered Switcher */}
        <div className="w-full max-w-sm flex justify-center mb-6">
          <div className="flex bg-slate-200/60 p-1 rounded-full border border-slate-300/40 shadow-inner w-full">
            <button
              onClick={() => { setMode('wizard'); setStep(1); setFormError(''); }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                mode === 'wizard' ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setMode('login'); setFormError(''); }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border-none ${
                mode === 'login' ? 'bg-primary text-on-primary shadow-sm' : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Log In
            </button>
          </div>
        </div>

        {/* LOG IN VIEW */}
        {mode === 'login' ? (
          <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Log In
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access your account
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-1 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm transition-all cursor-pointer border-none shadow-sm flex items-center justify-center gap-2"
              >
                {authLoading ? 'Logging in...' : 'Log In'}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">OR</span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            {/* Log In with Google */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Log In with Google Account</span>
            </button>

            <div className="mt-6 text-center pt-3 border-t border-slate-100">
              <button
                onClick={() => { setMode('wizard'); setStep(1); setFormError(''); }}
                className="text-xs font-medium text-emerald-800 hover:text-emerald-950 transition-colors underline bg-transparent border-none cursor-pointer"
              >
                Don't have an account? Sign Up
              </button>
            </div>
          </div>
        ) : (
          /* MULTI-STEP SIGN UP WIZARD */
          <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-2xl p-6 md:p-8 shadow-xl relative animate-fade-in">
            
            {/* Step Progress Line */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Step {step} of 5</span>
                <span className="text-slate-400 font-normal">
                  {step === 1 && 'Role'}
                  {step === 2 && 'Identity'}
                  {step === 3 && 'Location'}
                  {step === 4 && 'Business Activity'}
                  {step === 5 && 'Credentials'}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-700 transition-all duration-300 rounded-full"
                  style={{ width: `${(step / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
                <span>{formError}</span>
              </div>
            )}

            {/* STEP 1: ROLE SELECTION */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Select your Role
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose how you participate in the Anvaya market network.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {roles.map((r) => {
                    const isSelected = selectedRole === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRole(r.id)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-xl ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {r.icon}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{r.title}</div>
                            <div className="text-xs text-slate-500">{r.description}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: FULL NAME & PHONE */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in py-1">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Personal Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your name and contact phone number.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Full Name / Contact Person *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ram Bahadur Tamang"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Nepal Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9841234567"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in py-1">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Location
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your location to receive local market price feeds.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Province *
                    </label>
                    <select
                      value={province}
                      onChange={(e) => {
                        const p = e.target.value;
                        setProvince(p);
                        setDistrict(nepalAdminData[p]?.[0] ?? '');
                        setWard('1');
                      }}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:bg-white focus:border-emerald-600 outline-none cursor-pointer"
                    >
                      {provinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      District *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:bg-white focus:border-emerald-600 outline-none cursor-pointer"
                    >
                      {districtsForProvince.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Ward No. *
                    </label>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:bg-white focus:border-emerald-600 outline-none cursor-pointer"
                    >
                      {wardNumbers.map((w) => (
                        <option key={w} value={w}>Ward {w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Local Market / Area
                    </label>
                    <input
                      type="text"
                      value={localLocation}
                      onChange={(e) => setLocalLocation(e.target.value)}
                      placeholder="e.g. Kalimati Market"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:bg-white focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: ROLE DETAILS */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in py-1">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {currentRoleConfig.title} Activity
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tell us about your produce or business.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      {currentRoleConfig.label1} *
                    </label>
                    <input
                      type="text"
                      value={extraField1}
                      onChange={(e) => setExtraField1(e.target.value)}
                      placeholder={currentRoleConfig.placeholder1}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-600 outline-none"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      {currentRoleConfig.label2}
                    </label>
                    <input
                      type="text"
                      value={extraField2}
                      onChange={(e) => setExtraField2(e.target.value)}
                      placeholder={currentRoleConfig.placeholder2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: CREDENTIALS (FINAL STEP WITH GOOGLE SIGN UP OPTION) */}
            {step === 5 && (
              <form onSubmit={handleFinalSignUp} className="space-y-4 animate-fade-in py-1">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Create Account Credentials
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Set up your email & password or sign up with Google.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. farmer@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-600 outline-none"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                      Password (6+ Characters) *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:bg-white focus:border-emerald-600 outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-1 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm transition-all cursor-pointer border-none shadow-sm flex items-center justify-center gap-2"
                  >
                    {authLoading ? 'Creating Account...' : 'Complete Sign Up with Email'}
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>

                <div className="my-4 flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-slate-200"></div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">OR</span>
                  <div className="flex-1 h-[1px] bg-slate-200"></div>
                </div>

                {/* Sign Up with Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign Up with Google Account</span>
                </button>
              </form>
            )}

            {/* Step Controls */}
            {step < 5 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold transition-all hover:bg-primary-container cursor-pointer border-none shadow-sm flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
