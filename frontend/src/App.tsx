import { useEffect, useState, type CSSProperties } from 'react'
import SignUp, { type UserProfile } from './components/SignUp'
import Dashboard from './components/Dashboard'
import { supabase } from './supabaseClient'
import { fetchMarketPricesFromSupabase, fetchUserProfile, registerUserInSupabase, type MarketPrice } from './api'

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(() => {
    try {
      const saved = localStorage.getItem('anvaya_user_profile');
      return saved ? JSON.parse(saved) : undefined;
    } catch {
      return undefined;
    }
  });

  const [farmerName, setFarmerName] = useState(() => {
    try {
      const saved = localStorage.getItem('anvaya_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return 'Farmer';
  });

  const [currentPage, setCurrentPage] = useState<'landing' | 'signup' | 'farmer-dashboard'>(() => {
    if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.hash.includes('error='))) {
      return 'signup';
    }
    const saved = localStorage.getItem('anvaya_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.phone && parsed.district) return 'farmer-dashboard';
      } catch {}
    }
    return 'landing';
  });

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Namaste! I am the Anvaya Agricultural Assistant. I can forecast weather trends, monitor soil analytics, or estimate floor prices. Select a topic below to test:' }
  ]);

  const [roiCrop, setRoiCrop] = useState('');
  const [roiQty, setRoiQty] = useState<number>(500);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [marketPricesLoading, setMarketPricesLoading] = useState(true);
  const [marketPriceSearch, setMarketPriceSearch] = useState('');
  const [showNepaliMarketNames, setShowNepaliMarketNames] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchMarketPricesFromSupabase().then((prices) => {
      if (isMounted) {
        setMarketPrices(prices);
        setMarketPricesLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!roiCrop && marketPrices[0]) {
      setRoiCrop(marketPrices[0].crop_name);
    }
  }, [marketPrices, roiCrop]);

  const handleAuthUserSession = async (user: any) => {
    try {
      const profileName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const email = user.email || '';

      // Check if local saved profile is already complete
      const cachedProfileStr = localStorage.getItem('anvaya_user_profile');
      if (cachedProfileStr) {
        try {
          const cached = JSON.parse(cachedProfileStr);
          if (cached.phone && cached.district && cached.email === email) {
            setUserProfile(cached);
            setFarmerName(cached.name || profileName);
            setCurrentPage('farmer-dashboard');
            return;
          }
        } catch {}
      }

      // Check if there is a pending questionnaire profile from Google signup
      const savedPending = localStorage.getItem('pending_google_signup_profile');
      if (savedPending) {
        try {
          const pending = JSON.parse(savedPending);
          localStorage.removeItem('pending_google_signup_profile');

          const completeProfile: UserProfile = {
            name: pending.name || profileName,
            role: pending.role || 'Farmer',
            phone: pending.phone || '',
            email: email,
            province: pending.province,
            district: pending.district,
            ward: pending.ward,
            localLocation: pending.localLocation,
            extraField1: pending.extraField1,
            extraField2: pending.extraField2,
          };

          // Register in database
          await registerUserInSupabase({
            id: user.id,
            email: email,
            name: completeProfile.name,
            role: completeProfile.role,
            phone: completeProfile.phone || '',
            province: completeProfile.province,
            district: completeProfile.district,
            ward: completeProfile.ward,
            localLocation: completeProfile.localLocation,
            extraField1: completeProfile.extraField1,
            extraField2: completeProfile.extraField2,
            isNewSignup: true,
          });

          setFarmerName(completeProfile.name);
          setUserProfile(completeProfile);
          localStorage.setItem('anvaya_user_profile', JSON.stringify(completeProfile));
          setCurrentPage('farmer-dashboard');
          return;
        } catch (e) {
          console.warn('Error saving pending profile:', e);
        }
      }

      // Check if user profile exists in database
      const existingDbProfile = await fetchUserProfile(email || user.id);

      // If account was originally created using Email & Password, block Google OAuth login for this email
      if (existingDbProfile && existingDbProfile.password && user.app_metadata?.provider === 'google') {
        await supabase.auth.signOut();
        localStorage.removeItem('anvaya_user_profile');
        setAuthErrorNotice(`This email (${email}) was registered using Email and Password. Please log in using your Email and Password.`);
        setCurrentPage('signup');
        return;
      }

      if (existingDbProfile && existingDbProfile.phone && existingDbProfile.district) {
        const profile: UserProfile = {
          name: existingDbProfile.name || profileName,
          email: existingDbProfile.email || email,
          phone: existingDbProfile.phone,
          role: existingDbProfile.role || 'Farmer',
          province: existingDbProfile.province,
          district: existingDbProfile.district,
          ward: existingDbProfile.ward,
          localLocation: existingDbProfile.local_location,
          extraField1: existingDbProfile.extra_field_1,
          extraField2: existingDbProfile.extra_field_2,
        };
        setFarmerName(profile.name);
        setUserProfile(profile);
        localStorage.setItem('anvaya_user_profile', JSON.stringify(profile));
        setCurrentPage('farmer-dashboard');
      } else {
        // Incomplete profile (New Google User): Prompt user to complete registration details
        const partialProfile: UserProfile = {
          name: profileName,
          email: email,
          role: 'Farmer',
        };
        setUserProfile(partialProfile);
        setAuthErrorNotice(`No registered account found for (${email}). Please complete the Sign Up questionnaire to create your profile.`);
        setCurrentPage('signup');
      }
    } catch (e) {
      console.warn('Session check error:', e);
      setCurrentPage('signup');
    }
  };

  // Listen for Supabase OAuth & Email session changes (e.g. Google Login redirect)
  useEffect(() => {
    if (window.location.hash.includes('error=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const errorDesc = params.get('error_description') || params.get('error') || 'OAuth authentication failed.';
      setAuthErrorNotice(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      setCurrentPage('signup');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthUserSession(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleAuthUserSession(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCropPriceInfo = (crop: string) => {
    const match = marketPrices.find((item) => item.crop_name === crop);

    if (match) {
      return {
        price: match.price_npr,
        brokerPrice: match.minimum_price_npr,
        unit: match.unit,
      };
    }

    return { price: 0, brokerPrice: 0, unit: 'kg' };
  };

  const activePriceInfo = getCropPriceInfo(roiCrop);
  const anvayaPayout = activePriceInfo.price * roiQty;
  const brokerPayout = activePriceInfo.brokerPrice * roiQty;
  const netExtraProfit = anvayaPayout - brokerPayout;
  const profitPercentage = brokerPayout ? Math.round((netExtraProfit / brokerPayout) * 100) : 0;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleAiSelect = (topic: string) => {
    let responseText = '';
    if (topic === 'weather') {
      responseText = 'Based on satellite feeds for Mustang: Expect clear skies and optimal harvesting weather for the next 5 days. Minimal frost risk.';
    } else if (topic === 'prices') {
      const firstPrice = marketPrices[0];
      responseText = firstPrice
        ? `Latest Kalimati price for ${firstPrice.crop_name} is NPR ${firstPrice.price_npr.toLocaleString()}/${firstPrice.unit}.`
        : 'Live Kalimati prices are not available yet. Please try again after the daily import runs.';
    } else {
      responseText = 'Recommended soil enrichment for Potato farming in Pokhara: Nitrogen-rich organic humus compost. Keep moisture at 70-75% this week.';
    }

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: `Check ${topic === 'weather' ? 'Weather Forecast' : topic === 'prices' ? 'Cardamom Price' : 'Soil Health'}` },
      { sender: 'ai', text: responseText }
    ]);
  };

  const cropTickerItems = marketPrices.map((item) => ({
    name: item.crop_name_ne || item.crop_name,
    price: `NPR ${item.price_npr.toLocaleString()}/${item.unit}`,
    changePercent: item.change_percent,
    up: item.is_up ?? true,
  }));

  // Duplicate items for seamless continuous loop
  const getMarketDisplayName = (item: MarketPrice) => (
<<<<<<< Updated upstream
    lang === 'ne' ? item.crop_name_ne : item.crop_name
=======
    showNepaliMarketNames ? item.crop_name_ne || item.crop_name : item.crop_name
>>>>>>> Stashed changes
  );

  const tickerList = [...cropTickerItems, ...cropTickerItems];
  const filteredMarketPrices = marketPrices.filter((item) => {
    const search = marketPriceSearch.trim().toLowerCase();
    if (!search) return true;
    return [item.crop_name, item.crop_name_ne, item.market, item.unit]
      .some((value) => value.toLowerCase().includes(search));
  });

  if (currentPage === 'farmer-dashboard') {
    return (
      <Dashboard
        farmerName={farmerName}
        userProfile={userProfile}
        onNavigateBack={() => {
          localStorage.removeItem('anvaya_user_profile');
          supabase.auth.signOut();
          setCurrentPage('landing');
        }}
      />
    );
  }

  if (currentPage === 'signup') {
    const isOAuthReturn = typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.hash.includes('error='));
    return (
      <SignUp
        initialProfile={userProfile}
        authErrorNotice={authErrorNotice}
        initialMode={isOAuthReturn ? 'login' : undefined}
        onNavigateBack={() => setCurrentPage('landing')}
        onNavigateToDashboard={(profile) => {
          setUserProfile(profile);
          setFarmerName(profile.name || 'Farmer');
          localStorage.setItem('anvaya_user_profile', JSON.stringify(profile));
          setCurrentPage('farmer-dashboard');
        }}
      />
    );
  }

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ne' : 'en');
  };

  const handleVoiceInput = () => {
    setIsVoiceActive(true);
    setTimeout(() => {
      setIsVoiceActive(false);
      const voiceQuery = lang === 'ne'
        ? 'झापा बजारमा अलैंचीको मूल्य कति छ?'
        : 'What is the Cardamom floor price in Jhapa Market?';
      const firstPrice = marketPrices[0];
      const voiceReply = lang === 'ne'
        ? firstPrice
          ? `🎙️ आवाज विश्लेषण: ${firstPrice.crop_name_ne} को औसत मूल्य रु ${firstPrice.price_npr.toLocaleString()} प्रति ${firstPrice.unit} छ।`
          : '🎙️ आवाज विश्लेषण: आजको कालीमाटी मूल्य उपलब्ध छैन।'
        : firstPrice
          ? `🎙️ Voice Analysis: ${firstPrice.crop_name} averages NPR ${firstPrice.price_npr.toLocaleString()}/${firstPrice.unit} at Kalimati.`
          : '🎙️ Voice Analysis: today’s Kalimati prices are not available yet.';

      setChatMessages(prev => [
        ...prev,
        { sender: 'user', text: voiceQuery },
        { sender: 'ai', text: voiceReply }
      ]);
      setIsAiOpen(true);
    }, 1500);
  };

  return (
    <div className="bg-background text-on-surface font-body-sm min-h-screen overflow-x-hidden selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 px-4 md:px-12 h-16 flex items-center justify-between">
        <div
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.location.hash) {
              history.pushState('', document.title, window.location.pathname);
            }
          }}
          className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 cursor-pointer select-none"
        >
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>grass</span>
          <span className="tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Anvaya</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <a className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200 no-underline" href="#features">{lang === 'ne' ? 'विशेषताहरू' : 'Features'}</a>
          <a className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200 no-underline" href="#how-it-works">{lang === 'ne' ? 'प्रक्रिया' : 'How it Works'}</a>
          <a className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200 no-underline" href="#testimonials">{lang === 'ne' ? 'प्रतिक्रिया' : 'Testimonials'}</a>
        </nav>
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-secondary-container text-primary font-bold text-xs border border-outline-variant/40 cursor-pointer flex items-center gap-1.5 transition-all"
            title="Toggle Nepali / English"
          >
            <span className="material-symbols-outlined text-base">translate</span>
            <span>{lang === 'en' ? 'नेपाली' : 'English'}</span>
          </button>

          <button
            onClick={() => setCurrentPage('signup')}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-label-caps hover:bg-primary-container transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer border-none"
          >
            {lang === 'ne' ? 'शुरु गर्नुहोस्' : 'Get Started'}
          </button>
        </div>
      </header>

      {/* Live Market Ticker */}
      <div className="fixed top-16 w-full z-40 bg-surface-container border-b border-outline-variant/20 py-2 overflow-hidden select-none">
        <div
          className="animate-ticker flex items-center gap-8 whitespace-nowrap"
          style={{ '--ticker-duration': `${Math.max(60, marketPrices.length * 4)}s` } as CSSProperties}
        >
          {marketPricesLoading && <span className="px-4 text-xs text-on-surface-variant">Loading today's Kalimati prices…</span>}
          {!marketPricesLoading && !tickerList.length && <span className="px-4 text-xs text-on-surface-variant">No Kalimati prices imported yet.</span>}
          {tickerList.map((item, index) => (
            <div key={index} className="flex items-center gap-2 px-4 border-r border-outline-variant/30">
              <span className="font-semibold text-primary">{lang === 'ne' ? marketPrices[index % Math.max(marketPrices.length, 1)]?.crop_name_ne || item.name : item.name}</span>
              <span className="text-on-surface-variant">{item.price}</span>
              <span
                className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant"
                title={item.changePercent === null ? 'No prior-day price available' : 'Daily price movement'}
              >
                {item.changePercent === null ? (
                  <span>New</span>
                ) : (
                  <>
                    <svg
                      className={item.up ? 'text-emerald-600' : 'text-red-500'}
                      width="38"
                      height="18"
                      viewBox="0 0 38 18"
                      fill="none"
                      aria-hidden="true"
                    >
                      <polyline
                        points={item.up ? '1,15 7,13 12,14 19,9 25,10 31,5 36,3' : '1,3 7,5 12,4 19,9 25,8 31,13 36,15'}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={item.up ? 'M32 3h4v4' : 'M32 15h4v-4'}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className={item.up ? 'text-emerald-700' : 'text-red-600'}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                    </span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="pt-28 pb-8">
        {/* Hero Section */}
        <section className="px-4 md:px-12 py-8 md:py-12 flex flex-col items-center justify-center text-center max-w-5xl mx-auto min-h-[calc(100vh-6rem)]">
          <div className="flex flex-col items-center gap-4 md:gap-5 fade-in-up visible w-full">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Nepal's Direct Agricultural Exchange &amp; Logistics Network
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.15] font-extrabold max-w-4xl">
              Empowering Nepal's Fields, <br />
              <span className="bg-gradient-to-r from-secondary via-emerald-600 to-primary bg-clip-text text-transparent">
                Connecting Direct Markets.
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl leading-relaxed">
              Connecting Nepalese growers directly with buyers &amp; transporters — backed by AI price forecasts, QR produce traceability, and live GPS freight tracking.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-1 justify-center">
              <button 
                onClick={() => setCurrentPage('signup')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-7 py-3 rounded-xl font-semibold text-xs shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 border-none"
              >
                <span>Get Started Now</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
              <a 
                href="#features"
                className="bg-white text-slate-800 px-6 py-3 rounded-xl font-semibold text-xs border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center gap-2 no-underline shadow-xs"
              >
                Explore Features
              </a>
            </div>
            
            {/* 4 Role Entrance Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 w-full">
              {/* Farmer Entrance */}
              <button
                onClick={() => setCurrentPage('signup')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between group min-h-[170px]"
              >
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">agriculture</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-3">Farmer</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[190px]">List harvest yields &amp; get direct floor prices</p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 w-full flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Get Started</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </div>
              </button>

              {/* Retailer Entrance */}
              <button
                onClick={() => setCurrentPage('signup')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between group min-h-[170px]"
              >
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">storefront</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-3">Retailer</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[190px]">Source bulk produce direct from growers</p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 w-full flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Browse Market</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </div>
              </button>

              {/* Cooperative Entrance */}
              <button
                onClick={() => setCurrentPage('signup')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between group min-h-[170px] relative"
              >
                <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Coming Soon
                </span>
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">groups</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-3">Cooperative</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[190px]">Aggregate member harvest pools &amp; auctions</p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 w-full flex items-center justify-center gap-1 text-xs font-bold text-amber-700 group-hover:text-amber-800">
                  <span>Preview Teaser</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </button>

              {/* Transport Entrance */}
              <button
                onClick={() => setCurrentPage('signup')}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between group min-h-[170px]"
              >
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">local_shipping</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-3">Transport</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[190px]">Accept highway cargo loads &amp; live GPS</p>
                </div>
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 w-full flex items-center justify-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>Load Board</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="px-4 md:px-12 py-10 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/90 border border-outline-variant/15 shadow-xs hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>agriculture</span>
              </div>
              <h2 className="text-2xl font-bold text-primary mt-1">10,000+</h2>
              <p className="text-xs text-on-surface-variant text-center font-semibold">Verified Nepalese Farmers</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/90 border border-outline-variant/15 shadow-xs hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              </div>
              <h2 className="text-2xl font-bold text-primary mt-1">5,000+</h2>
              <p className="text-xs text-on-surface-variant text-center font-semibold">Bulk Retailers &amp; Buyers</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/90 border border-outline-variant/15 shadow-xs hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              </div>
              <h2 className="text-2xl font-bold text-primary mt-1">1,200+</h2>
              <p className="text-xs text-on-surface-variant text-center font-semibold">Logistics Trucks Connected</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/90 border border-outline-variant/15 shadow-xs hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <h2 className="text-2xl font-bold text-primary mt-1">24/7 AI Advisor</h2>
              <p className="text-xs text-on-surface-variant text-center font-semibold">Predictive Price &amp; Soil Insights</p>
            </div>
          </div>
        </section>

        {/* Location-Wise Market Price Comparison Feature */}
        <section className="px-4 md:px-12 py-12 md:py-20 max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="text-center lg:text-left max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">Real-Time Market Data</span>
              <h2 className="text-2xl md:text-4xl font-bold text-primary mt-2 mb-3">Location-Wise Market Price Comparison</h2>
              <p className="text-sm text-on-surface-variant">Compare live wholesale produce floor prices across major Nepalese agricultural hubs.</p>
            </div>
<<<<<<< Updated upstream
            <label className="relative w-full lg:w-80 shrink-0">
              <span className="sr-only">Search market prices</span>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant">search</span>
              <input
                type="search"
                value={marketPriceSearch}
                onChange={(event) => setMarketPriceSearch(event.target.value)}
                placeholder={lang === 'ne' ? 'वस्तु वा बजार खोज्नुहोस्' : 'Search commodity or market'}
                className="w-full rounded-xl border border-outline-variant/40 bg-white px-10 py-3 text-xs text-primary outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </label>
=======
            <div className="flex w-full lg:w-auto shrink-0 flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowNepaliMarketNames((visible) => !visible)}
                aria-pressed={showNepaliMarketNames}
                className={`rounded-xl border px-4 py-3 text-xs font-bold transition-colors ${showNepaliMarketNames
                  ? 'border-secondary bg-secondary text-white'
                  : 'border-outline-variant/40 bg-white text-primary hover:border-secondary hover:text-secondary'
                  }`}
              >
                {showNepaliMarketNames ? 'Show English' : 'नेपाली नाम'}
              </button>
              <label className="relative w-full sm:w-80">
                <span className="sr-only">Search market prices</span>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-on-surface-variant">search</span>
                <input
                  type="search"
                  value={marketPriceSearch}
                  onChange={(event) => setMarketPriceSearch(event.target.value)}
                  placeholder="Search commodity or market"
                  className="w-full rounded-xl border border-outline-variant/40 bg-white px-10 py-3 text-xs text-primary outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </label>
            </div>
>>>>>>> Stashed changes
          </div>

          <div className="bg-white/90 glass-panel rounded-3xl p-6 border border-white/60 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse min-w-[900px] text-xs">
                <thead>
                  <tr className="sticky top-0 z-10 border-b border-outline-variant/30 text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container-low">
                    <th className="py-3.5 pl-4">Crop / Commodity</th>
                    <th className="py-3.5">Unit</th>
                    <th className="py-3.5">Minimum</th>
                    <th className="py-3.5">Average</th>
                    <th className="py-3.5">Previous day</th>
                    <th className="py-3.5">Change</th>
                    <th className="py-3.5">Maximum</th>
                    <th className="py-3.5">Market</th>
                    <th className="py-3.5 text-right pr-4">Price date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-sm">
                  {marketPricesLoading && (
                    <tr><td colSpan={9} className="py-8 text-center text-on-surface-variant">Loading live Kalimati prices…</td></tr>
                  )}
                  {!marketPricesLoading && !marketPrices.length && (
                    <tr><td colSpan={9} className="py-8 text-center text-on-surface-variant">No daily Kalimati snapshot is available yet.</td></tr>
                  )}
                  {!marketPricesLoading && marketPrices.length > 0 && !filteredMarketPrices.length && (
                    <tr><td colSpan={9} className="py-8 text-center text-on-surface-variant">No prices match “{marketPriceSearch}”.</td></tr>
                  )}
                  {filteredMarketPrices.map((item, index) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3.5 pl-4 font-bold text-primary flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${index % 3 === 0 ? 'bg-secondary' : index % 3 === 1 ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                        {getMarketDisplayName(item)}
                      </td>
                      <td className="py-3.5 text-xs text-on-surface-variant">{item.unit}</td>
                      <td className="py-3.5 font-semibold">NPR {item.minimum_price_npr.toLocaleString()}</td>
                      <td className="py-3.5 font-bold text-primary">NPR {item.price_npr.toLocaleString()}</td>
                      <td className="py-3.5 text-on-surface-variant">{item.previous_price_npr === null ? '—' : `NPR ${item.previous_price_npr.toLocaleString()}`}</td>
                      <td className={`py-3.5 font-bold text-xs ${item.is_up === false ? 'text-error' : 'text-secondary'}`}>
                        {item.change_percent === null ? 'New' : `${item.change_percent >= 0 ? '+' : ''}${item.change_percent.toFixed(1)}%`}
                      </td>
                      <td className="py-3.5 font-semibold">NPR {item.maximum_price_npr.toLocaleString()}</td>
                      <td className="py-3.5 text-xs text-on-surface-variant">{item.market}</td>
                      <td className="py-3.5 text-right pr-4 font-bold text-secondary text-xs">{item.price_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Profit & Net Margin Calculator */}
        <section className="px-4 md:px-12 py-12 md:py-20 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold">Interactive Earnings Calculator</span>
              <h2 className="text-2xl md:text-4xl font-bold text-primary tracking-tight">
                Calculate Your Direct Margin Boost
              </h2>
              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                Compare the live Kalimati average with the same day’s minimum published rate for the selected commodity.
              </p>

              {/* Crop Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-primary block">Select Produce Crop:</label>
                <div className="flex flex-wrap gap-2">
                  {marketPrices.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setRoiCrop(item.crop_name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${roiCrop === item.crop_name ? 'bg-secondary text-on-secondary border-secondary shadow-xs' : 'bg-white text-on-surface border-outline-variant/40 hover:border-secondary'
                        }`}
                    >
                      {getMarketDisplayName(item)}
                    </button>
                  ))}
                  {!marketPrices.length && <span className="text-xs text-on-surface-variant">Live prices will appear after the first daily import.</span>}
                </div>
              </div>

              {/* Harvest Quantity Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-primary">Harvest Volume:</span>
                  <span className="text-secondary font-mono">{roiQty.toLocaleString()} kg</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={roiQty}
                  onChange={(e) => setRoiQty(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-outline">
                  <span>100 kg</span>
                  <span>2,500 kg</span>
                  <span>5,000 kg</span>
                </div>
              </div>
            </div>

            {/* Comparison Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Traditional Broker Card */}
              <div className="p-6 rounded-3xl bg-white/80 border border-outline-variant/20 shadow-xs space-y-3">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">Kalimati Minimum Reference</span>
                <div className="space-y-1">
                  <p className="text-xs text-on-surface-variant">Minimum rate: NPR {activePriceInfo.brokerPrice} / {activePriceInfo.unit}</p>
                  <h3 className="text-2xl font-bold text-outline">रु {brokerPayout.toLocaleString()}</h3>
                </div>
                <p className="text-[11px] text-error font-medium">Reference only; sourced from today’s Kalimati range.</p>
              </div>

              {/* Anvaya Direct Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-primary via-primary-container to-primary text-on-primary shadow-xl border border-white/20 space-y-3 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-7xl font-extrabold text-white/5 select-none">+35%</div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-on-secondary">Anvaya Direct Exchange</span>
                <div className="space-y-1">
                  <p className="text-xs text-on-primary/80">Live Kalimati average: NPR {activePriceInfo.price} / {activePriceInfo.unit}</p>
                  <h3 className="text-3xl font-bold text-white">रु {anvayaPayout.toLocaleString()}</h3>
                </div>
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                  <span className="text-secondary-fixed-dim font-bold">Extra Net Profit:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-secondary text-on-secondary font-extrabold">+ रु {netExtraProfit.toLocaleString()} ({profitPercentage}%)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 md:px-12 py-12 md:py-20 max-w-7xl mx-auto" id="how-it-works">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">Simple Process</span>
            <h2 className="text-2xl md:text-4xl font-bold text-primary mt-2 mb-3">Empowering Trade in 4 Simple Steps</h2>
            <p className="text-sm text-on-surface-variant">
              Anvaya connects cultivation directly to commercial buyers with transparency, speed, and logistics support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative p-6 rounded-3xl bg-white/90 glass-panel border border-outline-variant/15 flex flex-col gap-2 shadow-xs hover:-translate-y-1 transition-all duration-300">
              <span className="absolute top-4 right-4 text-3xl font-extrabold text-secondary/20">01</span>
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined text-2xl">edit_document</span>
              </div>
              <h3 className="font-bold text-primary text-lg">Create Crop Listing</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">Farmers specify crop name, price/kg, quantity, quality grade, harvest date, and storefront location.</p>
            </div>

            <div className="relative p-6 rounded-3xl bg-white/90 glass-panel border border-outline-variant/15 flex flex-col gap-2 shadow-xs hover:-translate-y-1 transition-all duration-300">
              <span className="absolute top-4 right-4 text-3xl font-extrabold text-secondary/20">02</span>
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined text-2xl">qr_code_2</span>
              </div>
              <h3 className="font-bold text-primary text-lg">QR Code Traceability</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">System generates scannable QR code detailing pesticide status, farmer details, and harvest lab tests.</p>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="mt-2 text-left text-xs font-bold text-secondary hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
              >
                <span>Test Demo QR Scanner</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>

            <div className="relative p-6 rounded-3xl bg-white/90 glass-panel border border-outline-variant/15 flex flex-col gap-2 shadow-xs hover:-translate-y-1 transition-all duration-300">
              <span className="absolute top-4 right-4 text-3xl font-extrabold text-secondary/20">03</span>
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined text-2xl">navigation</span>
              </div>
              <h3 className="font-bold text-primary text-lg">Live GPS Freight Tracking</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">Retailers buy direct and track logistics trucks moving live along Nepalese highway routes.</p>
            </div>

            <div className="relative p-6 rounded-3xl bg-white/90 glass-panel border border-outline-variant/15 flex flex-col gap-2 shadow-xs hover:-translate-y-1 transition-all duration-300">
              <span className="absolute top-4 right-4 text-3xl font-extrabold text-secondary/20">04</span>
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined text-2xl">star</span>
              </div>
              <h3 className="font-bold text-primary text-lg">Supplier Rating &amp; Payment</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">Rapid payment settlement plus buyer rating &amp; review feedback to reward honest suppliers.</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 md:px-12 py-12 md:py-20 max-w-7xl mx-auto" id="features">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">All-In-One Ecosystem</span>
            <h2 className="text-2xl md:text-4xl font-bold text-primary mt-2 mb-3">Powerful Ecosystem Features</h2>
            <p className="text-sm text-on-surface-variant">
              Every feature rural farmers, cooperatives, retailers, and transporters require to thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-3 hover:-translate-y-1 transition-all duration-300 shadow-xs border border-outline-variant/15 bg-white/90">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
              </div>
              <h3 className="font-bold text-primary text-xl">Direct Farmer-to-Retailer Marketplace</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect directly to verified retail outlets and wholesalers. Eliminate middleman commissions for higher farm gate pricing and guaranteed direct order settlements.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-3 hover:-translate-y-1 transition-all duration-300 shadow-xs border border-outline-variant/15 bg-white/90">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>navigation</span>
              </div>
              <h3 className="font-bold text-primary text-xl">Live GPS Freight &amp; Route Tracking</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect with transportation providers, track trucks live on interactive highway maps, monitor temperature cold-chains, and receive digital proof of delivery.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-3 hover:-translate-y-1 transition-all duration-300 shadow-xs border border-outline-variant/15 bg-white/90">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <h3 className="font-bold text-primary text-xl">AI Price Forecasting &amp; Weather Agronomist</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Machine learning models forecast crop floor prices, soil moisture, and climatic shifts. Ask our 24/7 AI chatbot for instant crop health tips.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-3 hover:-translate-y-1 transition-all duration-300 shadow-xs border border-outline-variant/15 bg-white/90">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
              </div>
              <h3 className="font-bold text-primary text-xl">QR Traceability &amp; Physical Storefront Credibility</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Assign QR codes to bulk harvest lots. Display physical storefront locations so local and old-time buyers know your farm's credibility and chemical status.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-4 md:px-12 py-12 md:py-20 bg-surface-container-low border-y border-outline-variant/20" id="testimonials">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">Success Stories</span>
              <h2 className="text-2xl md:text-4xl font-bold text-primary mt-2 mb-3">Partner Stories across Nepal</h2>
              <p className="text-sm text-on-surface-variant">Read how farmers, buyers, and transporters are transforming trade with Anvaya.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between gap-4 border border-outline-variant/10 bg-white/90 shadow-xs">
                <p className="text-sm italic text-on-surface-variant leading-relaxed">
                  "Thanks to Anvaya's direct marketplace, I sold my entire cardamom harvest for 30% higher margins. The GPS transport truck picked up straight from my farm in Mustang."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">RT</div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">Ram Bahadur Tamang</h4>
                    <p className="text-xs text-on-surface-variant">Cardamom &amp; Apple Grower, Mustang</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between gap-4 border border-outline-variant/10 bg-white/90 shadow-xs">
                <p className="text-sm italic text-on-surface-variant leading-relaxed">
                  "Sourcing fresh produce used to take days of phone calls and broker markups. Now I buy direct from verified farmer co-ops and track the freight truck live on Google Maps."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">SS</div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">Shreya Shrestha</h4>
                    <p className="text-xs text-on-surface-variant">Wholesale Distributor, Kathmandu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 md:px-12 py-16 md:py-24 bg-gradient-to-r from-primary via-primary-container to-primary text-on-primary text-center flex flex-col items-center gap-4">
          <h2 className="text-2xl md:text-4xl font-bold text-secondary-fixed">Ready to Elevate Your Agricultural Trade?</h2>
          <p className="text-sm md:text-base text-on-primary/80 max-w-2xl leading-relaxed">
            Join thousands of modern Nepalese growers, retailers, cooperatives, and transporters on the smart agricultural exchange network.
          </p>
          <button
            onClick={() => setCurrentPage('signup')}
            className="mt-2 bg-secondary text-on-secondary px-9 py-4 rounded-xl font-bold text-sm shadow-xl hover:bg-secondary/90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-none"
          >
            Create Your Account Now
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-high py-8 px-4 md:px-12 border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div className="flex flex-col gap-2">
            <div className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>grass</span>
              Anvaya
            </div>
            <p className="text-sm text-on-surface-variant max-w-[20rem] leading-relaxed block whitespace-normal">
              Premium Agricultural Hub empowering rural farmers and connecting national markets across Nepal.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <h4 className="font-label-caps text-label-caps text-primary">Platform</h4>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#features">Marketplace</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">How It Works</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#testimonials">Testimonials</a>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-label-caps text-label-caps text-primary">Company</h4>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">About Us</a>
              <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-outline-variant/20 text-center font-body-sm text-body-sm text-on-surface-variant">
          © 2026 Anvaya. All rights reserved.
        </div>
      </footer>

      {/* Floating Mock AI Assistant Preview */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isAiOpen ? (
          <button
            onClick={() => setIsAiOpen(true)}
            className="w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce cursor-pointer"
            title="Ask Anvaya AI"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 rounded-2xl glass-panel border border-outline-variant/20 bg-background/95 shadow-2xl overflow-hidden flex flex-col max-h-[420px] transition-all duration-300">
            {/* Header */}
            <div className="bg-primary text-on-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <div>
                  <h4 className="text-sm font-bold text-on-primary">Anvaya AI Support</h4>
                  <p className="text-[10px] text-on-primary-container">Nepal Weather & Market Models</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                className="text-on-primary/75 hover:text-on-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Messages Body */}
            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3 min-h-[200px] text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-secondary text-on-secondary rounded-tr-none' : 'bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/10'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Voice Inquiry & Quick Actions Footer */}
            <div className="p-3 bg-surface-container-low border-t border-outline-variant/20 space-y-2">
              <button
                onClick={handleVoiceInput}
                disabled={isVoiceActive}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${isVoiceActive ? 'bg-error text-on-error animate-pulse' : 'bg-secondary text-on-secondary hover:bg-secondary/90'
                  }`}
              >
                <span className="material-symbols-outlined text-base">mic</span>
                <span>{isVoiceActive ? (lang === 'ne' ? 'सुनिरहेको छ...' : 'Listening to Voice Query...') : (lang === 'ne' ? '🎤 बोलि मार्फत सोध्नुहोस्' : '🎤 Speak Voice Inquiry')}</span>
              </button>

              <div className="flex flex-wrap gap-1.5 justify-center">
                <button
                  onClick={() => handleAiSelect('weather')}
                  className="px-2 py-1 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container transition-all text-[10px] font-semibold text-primary cursor-pointer flex items-center gap-1 border-none"
                >
                  <span className="material-symbols-outlined text-xs text-secondary">partly_cloudy_day</span>
                  <span>{lang === 'ne' ? 'मौसम पूर्वानुमान' : 'Weather Forecast'}</span>
                </button>
                <button
                  onClick={() => handleAiSelect('prices')}
                  className="px-2 py-1 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container transition-all text-[10px] font-semibold text-primary cursor-pointer flex items-center gap-1 border-none"
                >
                  <span className="material-symbols-outlined text-xs text-secondary">trending_up</span>
                  <span>{lang === 'ne' ? 'अलैंचीको मूल्य' : 'Cardamom Prices'}</span>
                </button>
                <button
                  onClick={() => handleAiSelect('soil')}
                  className="px-2 py-1 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container transition-all text-[10px] font-semibold text-primary cursor-pointer flex items-center gap-1 border-none"
                >
                  <span className="material-symbols-outlined text-xs text-secondary">eco</span>
                  <span>{lang === 'ne' ? 'माटोको गुणस्तर' : 'Soil Tips'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Traceability Modal Simulator */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-outline-variant/30">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                <h3 className="font-bold text-base text-primary">Produce Batch QR Traceability</h3>
              </div>
              <button onClick={() => setIsQrModalOpen(false)} className="border-none bg-transparent cursor-pointer text-outline hover:text-primary">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-4 bg-surface-container-low rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-secondary text-sm">ANV-CARD-2026-MUSTANG-001</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary">Verified Batch</span>
              </div>
              <p className="text-primary font-bold">Large Cardamom (Elaichi) • Grade A Export</p>
              <p className="text-on-surface-variant">Farmer Supplier: Ram Bahadur Tamang (Mustang)</p>
              <p className="text-on-surface-variant">Storefront: Marpha Highway Hub, Ward 3 (Est. 2012)</p>
              <p className="text-emerald-800 font-semibold bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                🌱 Lab Status: 0% Synthetic Pesticides Detected (EU Export Certified)
              </p>
              <p className="text-[11px] text-outline">Harvest Date: 2026-07-15 • Best Before: 2027-07-15</p>
            </div>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container cursor-pointer border-none"
            >
              Close QR Verification
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
