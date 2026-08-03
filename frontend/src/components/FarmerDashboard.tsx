import { useState } from 'react';
import CreateListing from './CreateListing';
import type { UserProfile } from './SignUp';
import BrandLogo from './BrandLogo';

interface FarmerDashboardProps {
  farmerName?: string;
  userProfile?: UserProfile;
  onNavigateBack: () => void;
}

interface ProduceListing {
  id: number;
  crop: string;
  location: string;
  physicalStorefront: string;
  price: string;
  qty: string;
  grade: string;
  seller: string;
  sellerRating: number;
  reviewsCount: number;
  badge: string;
  harvestDate: string;
  bestBefore: string;
  pesticideStatus: string;
  qrCodeData: string;
}

export default function FarmerDashboard({ farmerName = 'Farmer', userProfile, onNavigateBack }: FarmerDashboardProps) {
  const [activeNav, setActiveNav] = useState<'dashboard' | 'marketplace' | 'intelligence' | 'logistics' | 'community'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Profile State (Editable)
  const [profileName, setProfileName] = useState((userProfile?.name && userProfile.name.trim()) ? userProfile.name.trim() : (farmerName && farmerName.trim()) ? farmerName.trim() : 'Ram Bahadur Tamang');
  const [profilePhone, setProfilePhone] = useState(userProfile?.phone || '9841234567');
  const [profileDistrict, setProfileDistrict] = useState(userProfile?.district || 'Kathmandu');
  const [profileLocation, setProfileLocation] = useState(userProfile?.localLocation || 'Ward 1, Kalimati');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const displayName = profileName;
  const userDistrict = profileDistrict;
  const userPhone = profilePhone;
  const userLocation = `${profileLocation}, ${profileDistrict}`;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(true);
    setTimeout(() => {
      setProfileSavedMsg(false);
      setIsProfileModalOpen(false);
    }, 1200);
  };

  const [selectedQrListing, setSelectedQrListing] = useState<ProduceListing | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);

  // Nav Items for Farmer
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
    { id: 'marketplace', label: 'My Crop Listings', icon: 'storefront' },
    { id: 'intelligence', label: 'AI Agronomist', icon: 'psychology' },
    { id: 'logistics', label: 'Farm Transport & Maps', icon: 'map' },
    { id: 'community', label: 'Farmer Club', icon: 'groups' },
  ];

  // AI Chat State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: `Namaste ${displayName}! I am your AI Agronomist Assistant. Ask me about crop weather forecasts, soil nutrients, market floor prices, or transport pickups!` }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Sample Farmer Produce Listings
  const farmerListings: ProduceListing[] = [
    {
      id: 1,
      crop: 'Large Cardamom (Elaichi)',
      location: userDistrict,
      physicalStorefront: `${userLocation} (Verified Storefront)`,
      price: '1,250',
      qty: '450 kg',
      grade: 'Grade A Export',
      seller: displayName,
      sellerRating: 4.9,
      reviewsCount: 38,
      badge: 'Organic Verified',
      harvestDate: '2026-07-15',
      bestBefore: '2027-07-15',
      pesticideStatus: '0% Synthetic Pesticides (Lab Certified)',
      qrCodeData: `ANV-CARD-2026-${userDistrict.toUpperCase()}-001`,
    },
    {
      id: 2,
      crop: 'Organic Ginger (Aduwa)',
      location: userDistrict,
      physicalStorefront: `${userLocation} (Verified Storefront)`,
      price: '160',
      qty: '800 kg',
      grade: 'Grade A Export',
      seller: displayName,
      sellerRating: 4.9,
      reviewsCount: 41,
      badge: 'Prime Harvest',
      harvestDate: '2026-07-12',
      bestBefore: '2026-12-12',
      pesticideStatus: 'Natural Bio-Compost Only',
      qrCodeData: `ANV-GIN-2026-${userDistrict.toUpperCase()}-002`,
    },
    {
      id: 3,
      crop: 'Mustang Sweet Apples',
      location: 'Mustang',
      physicalStorefront: 'Jomsom Highway Storefront, Mustang Ward 2',
      price: '280',
      qty: '650 kg',
      grade: 'Grade A Export',
      seller: 'Mustang Apple Orchard',
      sellerRating: 5.0,
      reviewsCount: 52,
      badge: 'Fresh Picked',
      harvestDate: '2026-07-20',
      bestBefore: '2026-11-20',
      pesticideStatus: '0% Chemical Spraying',
      qrCodeData: 'ANV-APP-2026-MUSTANG-003',
    },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const msgText = textToSend || chatInput;
    if (!msgText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: msgText };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    setTimeout(() => {
      let reply = `Based on live agronomist data for ${userDistrict}: Optimal soil moisture detected at 72%. Recommended organic nitrogen enrichment.`;
      const query = msgText.toLowerCase();
      if (query.includes('weather') || query.includes('rain')) {
        reply = `🌤️ Weather Radar (${userDistrict}): Clear skies predicted for the next 5 days. Temperature ~24°C. Optimal harvesting window.`;
      } else if (query.includes('price') || query.includes('cardamom')) {
        reply = `📈 Price Forecast: Cardamom floor price in Jhapa Hub is NPR 1,250/kg (+2.4% today). High buyer demand.`;
      }
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div className="bg-background text-on-surface font-body-sm antialiased flex flex-col min-h-screen">
      
      {/* Top App Bar */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary p-2 rounded-xl hover:bg-surface-container-high transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <BrandLogo size="md" onClick={onNavigateBack} />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30 ml-2">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>agriculture</span>
            <span>Farmer Hub</span>
          </div>
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer ${
              isOfflineMode ? 'bg-amber-500/15 text-amber-800 border-amber-500/40' : 'bg-emerald-500/15 text-emerald-800 border-emerald-500/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span>{isOfflineMode ? 'Offline Cache' : 'Live Synced'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* SMS Alerts Toggle */}
          <button
            onClick={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
              smsAlertsEnabled ? 'bg-secondary/10 text-secondary border-secondary/30' : 'bg-surface-container text-outline border-outline-variant/40'
            }`}
          >
            <span className="material-symbols-outlined text-sm">sms</span>
            <span>{smsAlertsEnabled ? 'SMS On' : 'SMS Off'}</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-xl border-none bg-transparent cursor-pointer relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel border border-white/20 bg-background/95 shadow-2xl p-4 z-50">
                <h4 className="font-bold text-sm text-primary mb-2">Farmer Alerts &amp; SMS Logs</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/15">
                    <p className="font-semibold text-primary">SMS Sent to +977 {userPhone}</p>
                    <p className="text-on-surface-variant text-[11px]">Cardamom market price forecast update dispatched.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Quick Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface-container-high/80 text-primary hover:bg-surface-container-highest hover:shadow-md transition-all duration-200 border border-outline-variant/30 cursor-pointer select-none"
            title="Account Profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary text-on-primary font-bold text-xs flex items-center justify-center shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block font-semibold text-xs text-primary">{displayName}</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 hidden md:flex flex-col bg-primary text-on-primary border-r border-white/10 shadow-xl py-6 px-4 gap-2 z-30 overflow-y-auto">
        <div
          onClick={() => setIsProfileModalOpen(true)}
          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-2 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-200 group select-none"
          title="Account Settings"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 text-secondary font-extrabold text-xs flex items-center justify-center border border-secondary/30 group-hover:scale-105 transition-transform">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-on-primary truncate group-hover:text-secondary-fixed-dim transition-colors">{displayName}</h3>
              <span className="text-[10px] text-secondary-fixed-dim font-medium">Verified Farmer</span>
            </div>
          </div>
          <p className="text-[10px] text-on-primary/60 truncate mt-2 border-t border-white/10 pt-1.5">{userLocation}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id as any)}
              className={`w-full flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all text-left border-none cursor-pointer ${
                activeNav === item.id ? 'bg-secondary-container text-on-secondary-container shadow-md' : 'text-on-primary/70 hover:text-on-primary hover:bg-primary-container/30'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Logout Feature */}
        <div className="pt-4 border-t border-white/10 mt-auto">
          <button
            onClick={onNavigateBack}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-200 hover:bg-red-500/20 transition-all border-none cursor-pointer text-left"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-surface-container-lowest pb-28 md:pb-12 min-h-screen pt-24 md:pt-24">
        
        {/* OVERVIEW TAB */}
        {activeNav === 'dashboard' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-primary via-primary-container to-primary text-on-primary shadow-xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary-fixed-dim text-xs font-semibold">🌾 Farmer Portal</span>
                <h1 className="text-2xl md:text-4xl font-bold text-white mt-2 mb-1">Namaste, {displayName}!</h1>
                <p className="text-xs md:text-sm text-on-primary/80">Manage harvest listings, monitor soil telemetry, track crop sales, and connect with logistics providers.</p>
              </div>
              <button onClick={() => setActiveNav('marketplace')} className="px-5 py-3 rounded-xl bg-secondary text-on-secondary font-bold text-sm shadow-md border-none cursor-pointer">
                + Create Crop Listing
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border border-white/60 shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Total Farm Revenue</span>
                <h3 className="text-2xl font-bold text-primary mt-1">रु 4,25,000</h3>
                <p className="text-xs font-bold text-secondary mt-2">+12.5% sales growth</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border border-white/60 shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Active Crop Listings</span>
                <h3 className="text-2xl font-bold text-primary mt-1">14 Crops</h3>
                <p className="text-xs text-on-surface-variant mt-2">All with QR code &amp; grade</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border border-white/60 shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Pending Orders</span>
                <h3 className="text-2xl font-bold text-primary mt-1">8 Dispatches</h3>
                <p className="text-xs text-amber-700 font-semibold mt-2">Logistics provider connected</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border border-white/60 shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Soil &amp; Weather IoT</span>
                <h3 className="text-2xl font-bold text-primary mt-1">72% Optimal</h3>
                <p className="text-xs text-blue-700 font-semibold mt-2">Mustang Weather Station Live</p>
              </div>
            </div>

            {/* Location Price Comparison */}
            <div className="bg-white/90 glass-panel rounded-3xl p-6 border border-white/60 shadow-sm overflow-hidden">
              <h3 className="font-bold text-lg text-primary mb-3">Regional Hub Price Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant uppercase font-semibold">
                      <th className="py-2">Crop</th>
                      <th className="py-2">Kathmandu</th>
                      <th className="py-2">Jhapa</th>
                      <th className="py-2">Pokhara</th>
                      <th className="py-2">Mustang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15 text-sm">
                    <tr><td className="py-2.5 font-bold text-primary">Cardamom</td><td>NPR 1,250</td><td>NPR 1,220</td><td>NPR 1,240</td><td>NPR 1,180</td></tr>
                    <tr><td className="py-2.5 font-bold text-primary">Ginger</td><td>NPR 160</td><td>NPR 145</td><td>NPR 155</td><td>NPR 170</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MARKETPLACE TAB */}
        {activeNav === 'marketplace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto animate-fade-in">
            <div className="lg:col-span-7">
              <CreateListing farmerName={displayName} />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-bold text-lg text-primary">My Active Produce Listings</h3>
              <div className="space-y-3">
                {farmerListings.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl glass-panel border border-white/60 bg-white/90 shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-primary">{item.crop}</h4>
                      <span className="text-xs font-bold text-secondary">NPR {item.price}/kg</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">{item.location} • {item.qty} ({item.grade})</p>
                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary">{item.badge}</span>
                      <button onClick={() => setSelectedQrListing(item)} className="px-3 py-1 rounded-xl bg-surface-container-high text-primary font-bold text-xs border border-outline-variant/30 cursor-pointer">
                        View QR Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI AGRONOMIST TAB */}
        {activeNav === 'intelligence' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <div className="p-6 rounded-3xl bg-primary text-on-primary shadow-xl">
              <h1 className="text-2xl font-bold">AI Agronomist Advisor</h1>
              <p className="text-xs text-on-primary/80">Ask questions about weather, soil nutrients, or crop floor prices.</p>
            </div>
            <div className="bg-white/90 glass-panel rounded-3xl p-6 border border-white/60 shadow-md flex flex-col h-[450px]">
              <div className="flex-1 overflow-y-auto space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs ${msg.sender === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface border'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask AI agronomist..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-white text-xs"
                />
                <button onClick={() => handleSendMessage()} className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs border-none cursor-pointer">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOGISTICS & MAPS TAB */}
        {activeNav === 'logistics' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Farm Logistics &amp; Live GPS Tracking</h1>
            <div className="p-6 rounded-3xl glass-panel border border-white/60 bg-white/90 shadow-md space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-primary">Live Highway Dispatch Map</h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary">Live GPS Signal Active</span>
              </div>
              <div className="relative w-full h-64 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs">
                <div className="text-center space-y-1">
                  <span className="material-symbols-outlined text-4xl text-amber-400 animate-bounce">local_shipping</span>
                  <p className="font-bold">Truck #BA-3-PA-1234 En Route (75% Complete)</p>
                  <p className="text-slate-400">Mustang → Pokhara Corridor • ETA 4:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMMUNITY TAB */}
        {activeNav === 'community' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Farmer Club &amp; Cooperative Network</h1>
            <div className="p-6 rounded-3xl glass-panel border bg-white/90">
              <h4 className="font-bold text-primary text-base">Mustang Apple Growers Cooperative</h4>
              <p className="text-xs text-on-surface-variant mt-1">48 Active Farmers • Marpha, Mustang</p>
            </div>
          </div>
        )}

      </main>

      {/* QR MODAL */}
      {selectedQrListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-primary">{selectedQrListing.crop} QR Traceability</h3>
              <button onClick={() => setSelectedQrListing(null)} className="border-none bg-transparent cursor-pointer"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-4 bg-surface-container-low rounded-2xl text-center space-y-2 text-xs">
              <p className="font-mono font-bold text-primary text-sm">{selectedQrListing.qrCodeData}</p>
              <p>Supplier: {selectedQrListing.seller}</p>
              <p>Storefront: {selectedQrListing.physicalStorefront}</p>
              <p className="text-secondary font-semibold">{selectedQrListing.pesticideStatus}</p>
            </div>
            <button onClick={() => setSelectedQrListing(null)} className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs border-none cursor-pointer">Close</button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 border border-outline-variant/30 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                <div>
                  <h3 className="font-bold text-lg text-primary">Manage My Account Profile</h3>
                  <p className="text-xs text-on-surface-variant">Update contact, storefront location &amp; district details</p>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="border-none bg-transparent cursor-pointer text-outline hover:text-primary">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {profileSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-900 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Profile details successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-primary mb-1">Full Name / Account Name:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-primary mb-1">Phone Number (+977):</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">Home District:</label>
                  <input
                    type="text"
                    value={profileDistrict}
                    onChange={(e) => setProfileDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-primary mb-1">Local Address / Physical Storefront:</label>
                <input
                  type="text"
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div className="p-3 bg-surface-container-low rounded-2xl text-[11px] text-on-surface-variant flex justify-between items-center">
                <span>Account Role: <strong className="text-primary">Verified Farmer</strong></span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary">Active</span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-md hover:bg-secondary/90 cursor-pointer border-none"
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="px-4 py-3 rounded-xl bg-error/10 text-error font-bold text-xs hover:bg-error/20 cursor-pointer border border-error/20"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
