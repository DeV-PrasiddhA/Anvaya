import { useEffect, useRef, useState } from 'react';
import type { UserProfile } from './SignUp';
import BrandLogo from './BrandLogo';
import { updateCurrentUserLocation } from '../api';

interface TransportDashboardProps {
  userProfile?: UserProfile;
  onNavigateBack: () => void;
}

export default function TransportDashboard({ userProfile, onNavigateBack }: TransportDashboardProps) {
  const [activeNav, setActiveNav] = useState<'dashboard' | 'marketplace' | 'intelligence' | 'logistics' | 'community'>('dashboard');

  // Profile State (Editable)
  const [profileName, setProfileName] = useState(userProfile?.name || 'Himalayan Logistics Express');
  const [profilePhone, setProfilePhone] = useState(userProfile?.phone || '9801234567');
  const [profileDistrict, setProfileDistrict] = useState(userProfile?.district || 'Kathmandu');
  const [profileLocation, setProfileLocation] = useState(userProfile?.localLocation || 'Naikap, Kathmandu Highway Hub');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);
  const [acceptedNotice, setAcceptedNotice] = useState(false);
  const [isGpsSharing, setIsGpsSharing] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('GPS sharing is off.');
  const [lastGpsUpdate, setLastGpsUpdate] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<{ at: number; latitude: number; longitude: number } | null>(null);

  const displayName = profileName;
  const userLocation = `${profileLocation}, ${profileDistrict}`;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg(true);
    setTimeout(() => {
      setProfileSavedMsg(false);
      setIsProfileModalOpen(false);
    }, 1200);
  };

  const stopGpsSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsGpsSharing(false);
    setGpsStatus('GPS sharing is off.');
  };

  const startGpsSharing = () => {
    if (!navigator.geolocation) {
      setGpsStatus('This browser does not support GPS. Use the provider mobile device.');
      return;
    }

    setGpsStatus('Waiting for a verified GPS fix…');
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const inNepal = latitude >= 26.347 && latitude <= 30.447 && longitude >= 80.058 && longitude <= 88.201;
        if (!inNepal) {
          setGpsStatus('The GPS fix is outside Nepal and was not uploaded.');
          return;
        }

        const now = Date.now();
        const previous = lastSentRef.current;
        const elapsed = previous ? now - previous.at : Infinity;
        if (previous && elapsed < 15000) return;

        try {
          await updateCurrentUserLocation({ latitude, longitude, locationAccuracyM: accuracy });
          lastSentRef.current = { at: now, latitude, longitude };
          setIsGpsSharing(true);
          setLastGpsUpdate(new Date());
          setGpsStatus(`GPS location sent. Accuracy about ${Math.round(accuracy)}m.`);
        } catch (error) {
          setGpsStatus(error instanceof Error ? error.message : 'Could not upload the GPS location.');
        }
      },
      (error) => {
        setGpsStatus(error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Enable it to share truck GPS.'
          : 'GPS signal unavailable. Move outdoors and try again.');
        setIsGpsSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );

    watchIdRef.current = watchId;
    setIsGpsSharing(true);
  };

  useEffect(() => () => stopGpsSharing(), []);

  const navItems = [
    { id: 'dashboard', label: 'Operations Overview', icon: 'dashboard' },
    { id: 'marketplace', label: 'Freight Load Board', icon: 'local_shipping' },
    { id: 'intelligence', label: 'Route & Fuel Intelligence', icon: 'alt_route' },
    { id: 'logistics', label: 'Fleet Dispatch & GPS', icon: 'navigation' },
    { id: 'community', label: 'Transport Union', icon: 'badge' },
  ];

  return (
    <div className="bg-background text-on-surface font-body-sm flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" onClick={onNavigateBack} />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-800 border border-blue-500/30 ml-2">
            <span className="material-symbols-outlined text-sm">local_shipping</span>
            <span>Transport Provider Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 font-extrabold text-xs flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-on-primary truncate group-hover:text-secondary-fixed-dim transition-colors">{displayName}</h3>
              <span className="text-[10px] text-secondary-fixed-dim font-medium">8 Freight Vehicles</span>
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

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-surface-container-lowest pb-28 md:pb-12 min-h-screen pt-24 md:pt-24">
        
        {/* OVERVIEW */}
        {activeNav === 'dashboard' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-primary via-primary-container to-primary text-on-primary shadow-xl">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold">🚚 Logistics &amp; Freight Portal</span>
              <h1 className="text-2xl md:text-4xl font-bold text-white mt-2 mb-1">Namaste, {displayName}!</h1>
              <p className="text-xs md:text-sm text-on-primary/80">Coordinate fleet logistics, pick up fresh farm produce, and manage backhaul freight contracts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Active Fleet Status</span>
                <h3 className="text-2xl font-bold text-primary mt-1">8 Vehicles</h3>
                <p className="text-xs text-blue-700 font-semibold mt-2">6 on highway, 2 available</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Total Freight Earnings</span>
                <h3 className="text-2xl font-bold text-primary mt-1">रु 2,15,000</h3>
                <p className="text-xs font-bold text-secondary mt-2">+14.3% highway mileage</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Completed Trips</span>
                <h3 className="text-2xl font-bold text-primary mt-1">94 Trips</h3>
                <p className="text-xs text-on-surface-variant mt-2">99.2% on-time delivery</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Open Backhaul Cargo</span>
                <h3 className="text-2xl font-bold text-primary mt-1">12 Cargoes</h3>
                <p className="text-xs text-amber-700 font-semibold mt-2">Return load requests available</p>
              </div>
            </div>
          </div>
        )}

        {/* FREIGHT LOAD BOARD */}
        {activeNav === 'marketplace' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Available Cargo Freight Load Board</h1>

            {acceptedNotice && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-900 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Freight load accepted. Open Fleet Dispatch &amp; GPS to share the provider’s current location.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl glass-panel border bg-white/90 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-900 border border-blue-500/30">Prithvi Highway Corridor</span>
                  <span className="font-extrabold text-secondary text-sm">NPR 18/kg (रु 27,000)</span>
                </div>
                <h4 className="font-bold text-lg text-primary">Mustang Apple Orchard → Kathmandu Hub</h4>
                <p className="text-xs text-on-surface-variant">Cargo: 1.5 Tons Himalayan Apples • Pickup: Marpha, Mustang</p>
                <div className="pt-2 border-t flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-semibold">Shipper: Mustang Co-op</span>
                  <button
                    onClick={() => { setAcceptedNotice(true); setTimeout(() => setAcceptedNotice(false), 4000); }}
                    className="px-5 py-2.5 bg-secondary text-on-secondary rounded-xl font-bold border-none cursor-pointer hover:bg-secondary/90 shadow-xs"
                  >
                    Accept Freight Job
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-3xl glass-panel border bg-white/90 space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-900 border border-amber-500/30">BP Highway Corridor</span>
                  <span className="font-extrabold text-secondary text-sm">NPR 24/kg (रु 36,000)</span>
                </div>
                <h4 className="font-bold text-lg text-primary">Ilam Tea Gardens → Pokhara Wholesale</h4>
                <p className="text-xs text-on-surface-variant">Cargo: 1.5 Tons Orthodox Tea • Pickup: Kanyam, Ilam</p>
                <div className="pt-2 border-t flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-semibold">Shipper: Ilam Estate</span>
                  <button
                    onClick={() => { setAcceptedNotice(true); setTimeout(() => setAcceptedNotice(false), 4000); }}
                    className="px-5 py-2.5 bg-secondary text-on-secondary rounded-xl font-bold border-none cursor-pointer hover:bg-secondary/90 shadow-xs"
                  >
                    Accept Freight Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROUTE INTELLIGENCE */}
        {activeNav === 'intelligence' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Highway Route &amp; Traffic Radar</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl glass-panel border bg-white/90 space-y-2">
                <h4 className="font-bold text-primary text-base">Prithvi Highway Corridor</h4>
                <p className="text-xs text-on-surface-variant">Traffic: Normal • Weather: Dry harvesting sky • Clear corridor through Mugling.</p>
              </div>
              <div className="p-6 rounded-3xl glass-panel border bg-white/90 space-y-2">
                <h4 className="font-bold text-primary text-base">BP Highway Corridor</h4>
                <p className="text-xs text-on-surface-variant">Traffic: Minor maintenance near Sindhuli • Recommended travel window: 05:00 AM - 06:00 PM.</p>
              </div>
            </div>
          </div>
        )}

        {/* FLEET GPS DISPATCH */}
        {activeNav === 'logistics' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Transport GPS location sharing</h1>
            <div className="p-6 rounded-3xl glass-panel border bg-white/90 shadow-md space-y-5">
              <div className="flex flex-wrap justify-between items-start gap-3 border-b pb-4">
                <div>
                  <h4 className="font-bold text-base text-primary">Share this provider’s current location</h4>
                  <p className="text-xs text-on-surface-variant mt-1">The map shows your truck marker as live only after a successful GPS upload.</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isGpsSharing ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-700 border border-slate-300'}`}>
                  {isGpsSharing ? 'GPS sharing on' : 'GPS sharing off'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-on-surface-variant">Account</p>
                  <p className="font-bold text-primary text-sm">{displayName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant">Vehicle / license</p>
                  <p className="font-bold text-primary text-sm">{userProfile?.extraField2 || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant">Last successful upload</p>
                  <p className="font-bold text-primary text-sm">{lastGpsUpdate ? lastGpsUpdate.toLocaleTimeString() : 'None this session'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={isGpsSharing ? stopGpsSharing : startGpsSharing}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold border-none cursor-pointer ${isGpsSharing ? 'bg-red-600 text-white' : 'bg-secondary text-on-secondary'}`}
                >
                  {isGpsSharing ? 'Stop GPS sharing' : 'Start GPS sharing'}
                </button>
                <p className="text-xs text-on-surface-variant">{gpsStatus}</p>
              </div>
            </div>
          </div>
        )}

        {/* TRANSPORT UNION */}
        {activeNav === 'community' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Nepalese Transport Operators Union</h1>
            <div className="p-6 rounded-3xl glass-panel border bg-white/90">
              <p className="text-xs text-on-surface-variant">Verified highway driver network and safety updates.</p>
            </div>
          </div>
        )}

      </main>

      {/* EDIT PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 border border-outline-variant/30 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                <div>
                  <h3 className="font-bold text-lg text-primary">Manage Transport Provider Account</h3>
                  <p className="text-xs text-on-surface-variant">Update operator name, contact &amp; highway fleet hub</p>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="border-none bg-transparent cursor-pointer text-outline hover:text-primary">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {profileSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-900 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Transport operator profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-primary mb-1">Company / Operator Name:</label>
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
                  <label className="block font-bold text-primary mb-1">Fleet Base District:</label>
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
                <label className="block font-bold text-primary mb-1">Highway Depot Address:</label>
                <input
                  type="text"
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div className="p-3 bg-surface-container-low rounded-2xl text-[11px] text-on-surface-variant flex justify-between items-center">
                <span>Account Role: <strong className="text-primary">Verified Logistics Operator</strong></span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-800">8 Fleet Units</span>
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
