import { useEffect, useState } from 'react'
import SignUp, { type UserProfile } from './components/SignUp'
import Dashboard from './components/Dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'signup' | 'farmer-dashboard'>('landing');
  const [farmerName, setFarmerName] = useState('Farmer');
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Namaste! I am the Anvaya Agricultural Assistant. I can forecast weather trends, monitor soil analytics, or estimate floor prices. Select a topic below to test:' }
  ]);

  const [roiCrop, setRoiCrop] = useState<'Cardamom' | 'Tea' | 'Ginger' | 'Potato' | 'Apple'>('Cardamom');
  const [roiQty, setRoiQty] = useState<number>(500);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const getCropPriceInfo = (crop: string) => {
    switch (crop) {
      case 'Cardamom': return { price: 1250, brokerPrice: 920, unit: 'kg' };
      case 'Tea': return { price: 850, brokerPrice: 620, unit: 'kg' };
      case 'Ginger': return { price: 160, brokerPrice: 110, unit: 'kg' };
      case 'Apple': return { price: 280, brokerPrice: 190, unit: 'kg' };
      case 'Potato':
      default: return { price: 65, brokerPrice: 42, unit: 'kg' };
    }
  };

  const activePriceInfo = getCropPriceInfo(roiCrop);
  const anvayaPayout = activePriceInfo.price * roiQty;
  const brokerPayout = activePriceInfo.brokerPrice * roiQty;
  const netExtraProfit = anvayaPayout - brokerPayout;
  const profitPercentage = Math.round((netExtraProfit / brokerPayout) * 100);

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
      responseText = 'Current floor price for Large Cardamom (Jhapa Hub) is NPR 1,250/kg, up 2.4% from yesterday. Demand remains high in regional markets.';
    } else {
      responseText = 'Recommended soil enrichment for Potato farming in Pokhara: Nitrogen-rich organic humus compost. Keep moisture at 70-75% this week.';
    }

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: `Check ${topic === 'weather' ? 'Weather Forecast' : topic === 'prices' ? 'Cardamom Price' : 'Soil Health'}` },
      { sender: 'ai', text: responseText }
    ]);
  };

  const cropTickerItems = [
    { name: 'Cardamom (Elaichi)', price: 'NPR 1,250/kg', change: '+2.4%', up: true },
    { name: 'Orthodox Tea', price: 'NPR 850/kg', change: '-0.8%', up: false },
    { name: 'Mustang Apple', price: 'NPR 280/kg', change: '+4.1%', up: true },
    { name: 'Red Potato', price: 'NPR 65/kg', change: '+1.2%', up: true },
    { name: 'Ginger (Aduwa)', price: 'NPR 160/kg', change: '+5.7%', up: true },
    { name: 'Cabbage (Banda)', price: 'NPR 45/kg', change: '-3.2%', up: false },
    { name: 'Cauliflower', price: 'NPR 80/kg', change: '+0.5%', up: true }
  ];

  // Duplicate items for seamless continuous loop
  const tickerList = [...cropTickerItems, ...cropTickerItems];

  if (currentPage === 'farmer-dashboard') {
    return <Dashboard farmerName={farmerName} userProfile={userProfile} onNavigateBack={() => setCurrentPage('landing')} />;
  }

  if (currentPage === 'signup') {
    return <SignUp
      onNavigateBack={() => setCurrentPage('landing')}
      onNavigateToDashboard={(profile) => {
        setUserProfile(profile);
        setFarmerName(profile.name || 'Farmer');
        setCurrentPage('farmer-dashboard');
      }}
    />;
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
      const voiceReply = lang === 'ne'
        ? '🎙️ आवाज विश्लेषण: झापा बजारमा अलैंचीको न्यूनतम मूल्य रु १,२५० प्रति किलो छ (+२.४% वृद्धि)।'
        : '🎙️ Voice Analysis: Jhapa Market Cardamom floor price is NPR 1,250/kg (+2.4% bullish).';
      
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
        <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
          {tickerList.map((item, index) => (
            <div key={index} className="flex items-center gap-2 px-4 border-r border-outline-variant/30">
              <span className="font-semibold text-primary">{item.name}</span>
              <span className="text-on-surface-variant">{item.price}</span>
              <span className={`flex items-center text-xs font-bold gap-0.5 ${item.up ? 'text-secondary' : 'text-error'}`}>
                <span className="material-symbols-outlined text-sm">{item.up ? 'trending_up' : 'trending_down'}</span>
                <span>{item.change}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="pt-28 pb-8">
        {/* Hero Section */}
        <section className="px-4 md:px-12 py-8 md:py-20 flex flex-col lg:flex-row items-center gap-10 max-w-7xl mx-auto">
          {/* Left Hero Content */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5 fade-in-up visible">
            <div className="inline-flex items-center gap-2 bg-secondary-container/30 text-on-secondary-container px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit border border-secondary/30">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary glow-pulse"></span>
              Nepal's Direct Agricultural Exchange &amp; AI Network
            </div>

            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-5xl text-primary tracking-tight leading-tight font-bold">
              Cultivating Connectivity: <br />
              <span className="bg-gradient-to-r from-secondary via-emerald-600 to-primary bg-clip-text text-transparent">
                Empowering Nepal's Fields,
              </span> <br />
              Elevating Nepal's Markets.
            </h1>

            <p className="text-base md:text-lg text-on-surface-variant max-w-lg leading-relaxed block whitespace-normal">
              Anvaya connects rural Nepalese growers directly with commercial buyers, cooperatives, and transport providers. Eliminate middlemen with AI price forecasts, QR produce traceability, location-wise price comparison, and live GPS freight tracking.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-2">
              <button 
                onClick={() => setCurrentPage('signup')}
                className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-bold text-sm shadow-lg hover:bg-secondary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center gap-2 border-none"
              >
                <span>Get Started Now</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <a 
                href="#features"
                className="bg-surface-container-high text-primary px-7 py-4 rounded-xl font-bold text-sm border border-outline-variant/40 hover:bg-surface-container-highest hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 no-underline"
              >
                Explore Features
              </a>
            </div>

            {/* Suitable Role Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <button
                onClick={() => setCurrentPage('signup')}
                className="p-3 rounded-2xl bg-white/90 border border-outline-variant/30 text-primary text-xs font-bold hover:bg-secondary-container hover:text-on-secondary-container transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-secondary text-base">agriculture</span>
                <span>Farmer</span>
              </button>

              <button
                onClick={() => setCurrentPage('signup')}
                className="p-3 rounded-2xl bg-white/90 border border-outline-variant/30 text-primary text-xs font-bold hover:bg-secondary-container hover:text-on-secondary-container transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-secondary text-base">storefront</span>
                <span>Retailer</span>
              </button>

              <button
                onClick={() => setCurrentPage('signup')}
                className="p-3 rounded-2xl bg-white/90 border border-outline-variant/30 text-primary text-xs font-bold hover:bg-secondary-container hover:text-on-secondary-container transition-all cursor-pointer flex items-center justify-between gap-1 shadow-xs relative"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-base">groups</span>
                  <span>Cooperative</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-800 border border-amber-500/30">Soon</span>
              </button>

              <button
                onClick={() => setCurrentPage('signup')}
                className="p-3 rounded-2xl bg-white/90 border border-outline-variant/30 text-primary text-xs font-bold hover:bg-secondary-container hover:text-on-secondary-container transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-secondary text-base">local_shipping</span>
                <span>Transport</span>
              </button>
            </div>
          </div>
          
          {/* Right Hero Visual Card */}
          <div className="w-full lg:w-1/2 relative rounded-3xl overflow-hidden glass-panel p-3 border border-white/60 shadow-xl">
            <img 
              className="w-full aspect-video lg:aspect-square rounded-2xl object-cover shadow-sm hover:scale-[1.01] transition-transform duration-500" 
              src="/smart_farm_nepal.png"
              alt="Nepalese Smart Farm Telemetry Illustration"
            />
            
            {/* Top Floating Floor Price Badge */}
            <div className="absolute top-6 right-6 p-3.5 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-white/30 flex items-center gap-3 text-xs font-bold backdrop-blur-md z-10">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/25 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                <span className="material-symbols-outlined text-base font-extrabold" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Jhapa Market Hub</span>
                <span className="text-xs font-extrabold text-white">Cardamom Floor: <strong className="text-emerald-400 font-mono text-sm">NPR 1,250/kg</strong> <span className="text-[11px] text-emerald-400 font-bold ml-1">(+2.4%)</span></span>
              </div>
            </div>

            {/* Bottom Telemetry Card */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel border border-white/40 bg-white/95 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary">Mustang IoT Weather Station</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium">Soil Moisture: 72% • Rain: 12mm Expected</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary border border-secondary/30">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span> Live
              </span>
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
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold">Real-Time Market Data</span>
            <h2 className="text-2xl md:text-4xl font-bold text-primary mt-2 mb-3">Location-Wise Market Price Comparison</h2>
            <p className="text-sm text-on-surface-variant">Compare live wholesale produce floor prices across major Nepalese agricultural hubs.</p>
          </div>

          <div className="bg-white/90 glass-panel rounded-3xl p-6 border border-white/60 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container-low">
                    <th className="py-3.5 pl-4">Crop / Commodity</th>
                    <th className="py-3.5">Unit</th>
                    <th className="py-3.5">Kathmandu (Kalimati)</th>
                    <th className="py-3.5">Jhapa (Birtamod)</th>
                    <th className="py-3.5">Pokhara (Kaski)</th>
                    <th className="py-3.5">Mustang (Marpha)</th>
                    <th className="py-3.5 text-right pr-4">24h Trajectory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-sm">
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 pl-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Large Cardamom (Elaichi)
                    </td>
                    <td className="py-3.5 text-xs text-on-surface-variant">NPR / kg</td>
                    <td className="py-3.5 font-bold text-primary">NPR 1,250</td>
                    <td className="py-3.5 font-semibold">NPR 1,220</td>
                    <td className="py-3.5 font-semibold">NPR 1,240</td>
                    <td className="py-3.5 font-semibold">NPR 1,180</td>
                    <td className="py-3.5 text-right pr-4 font-bold text-secondary text-xs">+2.4% ▲</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 pl-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Orthodox High-Grown Tea
                    </td>
                    <td className="py-3.5 text-xs text-on-surface-variant">NPR / kg</td>
                    <td className="py-3.5 font-bold text-primary">NPR 850</td>
                    <td className="py-3.5 font-semibold">NPR 810</td>
                    <td className="py-3.5 font-semibold">NPR 840</td>
                    <td className="py-3.5 font-semibold">NPR 860</td>
                    <td className="py-3.5 text-right pr-4 font-bold text-error text-xs">-0.8% ▼</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 pl-4 font-bold text-primary flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Organic Ginger (Aduwa)
                    </td>
                    <td className="py-3.5 text-xs text-on-surface-variant">NPR / kg</td>
                    <td className="py-3.5 font-bold text-primary">NPR 160</td>
                    <td className="py-3.5 font-semibold">NPR 145</td>
                    <td className="py-3.5 font-semibold">NPR 155</td>
                    <td className="py-3.5 font-semibold">NPR 170</td>
                    <td className="py-3.5 text-right pr-4 font-bold text-secondary text-xs">+5.7% ▲</td>
                  </tr>
                </tbody>
              </table>
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
                Traditional commission brokers take up to 35% of harvest value. Calculate how much extra profit you keep using Anvaya's direct exchange.
              </p>

              {/* Crop Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-primary block">Select Produce Crop:</label>
                <div className="flex flex-wrap gap-2">
                  {(['Cardamom', 'Tea', 'Ginger', 'Apple', 'Potato'] as const).map((crop) => (
                    <button
                      key={crop}
                      onClick={() => setRoiCrop(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        roiCrop === crop ? 'bg-secondary text-on-secondary border-secondary shadow-xs' : 'bg-white text-on-surface border-outline-variant/40 hover:border-secondary'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
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
                <span className="text-xs font-bold text-outline uppercase tracking-wider">Traditional Broker Sale</span>
                <div className="space-y-1">
                  <p className="text-xs text-on-surface-variant">Broker Rate: NPR {activePriceInfo.brokerPrice} / kg</p>
                  <h3 className="text-2xl font-bold text-outline">रु {brokerPayout.toLocaleString()}</h3>
                </div>
                <p className="text-[11px] text-error font-medium">Includes ~30% middleman commission fee deductions.</p>
              </div>

              {/* Anvaya Direct Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-primary via-primary-container to-primary text-on-primary shadow-xl border border-white/20 space-y-3 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-7xl font-extrabold text-white/5 select-none">+35%</div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-on-secondary">Anvaya Direct Exchange</span>
                <div className="space-y-1">
                  <p className="text-xs text-on-primary/80">Direct Floor Price: NPR {activePriceInfo.price} / kg</p>
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
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                  isVoiceActive ? 'bg-error text-on-error animate-pulse' : 'bg-secondary text-on-secondary hover:bg-secondary/90'
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
