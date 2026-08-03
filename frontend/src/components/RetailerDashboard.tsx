import { useState } from 'react';
import type { UserProfile } from './SignUp';
import BrandLogo from './BrandLogo';

interface RetailerDashboardProps {
  userProfile?: UserProfile;
  onNavigateBack: () => void;
}

export default function RetailerDashboard({ userProfile, onNavigateBack }: RetailerDashboardProps) {
  const [activeNav, setActiveNav] = useState<'dashboard' | 'marketplace' | 'intelligence' | 'logistics' | 'community'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourcingFilter, setSourcingFilter] = useState('All');

  // Profile State (Editable)
  const [profileName, setProfileName] = useState(userProfile?.name || 'Kathmandu Produce Hub');
  const [profilePhone, setProfilePhone] = useState(userProfile?.phone || '9851098765');
  const [profileDistrict, setProfileDistrict] = useState(userProfile?.district || 'Kathmandu');
  const [profileLocation, setProfileLocation] = useState(userProfile?.localLocation || 'Baneshwor, Kathmandu');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Direct Sourcing Order State
  const [selectedOrderListing, setSelectedOrderListing] = useState<any | null>(null);
  const [orderQty, setOrderQty] = useState('100');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(false);

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

  const navItems = [
    { id: 'dashboard', label: 'Procurement Overview', icon: 'dashboard' },
    { id: 'marketplace', label: 'Bulk Sourcing Market', icon: 'shopping_bag' },
    { id: 'intelligence', label: 'Price & Demand Radar', icon: 'monitoring' },
    { id: 'logistics', label: 'GPS Freight Tracker', icon: 'location_on' },
    { id: 'community', label: 'Supplier Directory', icon: 'verified' },
  ];

  const produceListings = [
    { id: 1, crop: 'Large Cardamom (Elaichi)', location: 'Mustang', price: '1,250', qty: '450 kg', grade: 'Grade A Export', seller: 'Ram Bahadur Tamang', rating: 4.9, badge: 'Organic Verified' },
    { id: 2, crop: 'Orthodox High-Grown Tea', location: 'Ilam', price: '850', qty: '1,200 kg', grade: 'Grade A+', seller: 'Ilam Tea Producer Co-op', rating: 4.8, badge: 'Export Certified' },
    { id: 3, crop: 'Fresh Red Potatoes', location: 'Pokhara', price: '65', qty: '3,000 kg', grade: 'Grade B Bulk', seller: 'Syangja Growers Group', rating: 4.7, badge: 'Bulk Stock' },
  ];

  return (
    <div className="bg-background text-on-surface font-body-sm flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-primary p-2 border-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <BrandLogo size="md" onClick={onNavigateBack} />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 ml-2">
            <span className="material-symbols-outlined text-sm">storefront</span>
            <span>Retailer Hub</span>
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
            <div className="w-8 h-8 rounded-xl bg-secondary/20 text-secondary font-extrabold text-xs flex items-center justify-center border border-secondary/30 group-hover:scale-105 transition-transform">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-bold text-on-primary truncate group-hover:text-secondary-fixed-dim transition-colors">{displayName}</h3>
              <span className="text-[10px] text-secondary-fixed-dim font-medium">Verified Retailer</span>
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
              <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary-fixed-dim text-xs font-semibold">🏪 Retail Procurement Portal</span>
              <h1 className="text-2xl md:text-4xl font-bold text-white mt-2 mb-1">Namaste, {displayName}!</h1>
              <p className="text-xs md:text-sm text-on-primary/80">Source direct high-grade produce from local growers with price transparency and live GPS tracking.</p>
            </div>

            {/* Inventory Shortage Alert */}
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700">warning</span>
                <span><strong>Shortage Alert:</strong> Red Potato stock low (15% remaining). Re-order now.</span>
              </div>
              <button onClick={() => setActiveNav('marketplace')} className="px-3 py-1.5 bg-amber-700 text-white rounded-xl font-bold border-none cursor-pointer">
                Re-order Bulk Stock
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Procurement Spend</span>
                <h3 className="text-2xl font-bold text-primary mt-1">रु 12,80,000</h3>
                <p className="text-xs font-bold text-secondary mt-2">+18.2% direct farmer buys</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Supplier Trust Rating</span>
                <h3 className="text-2xl font-bold text-primary mt-1">★ 4.9 / 5.0</h3>
                <p className="text-xs text-on-surface-variant mt-2">24 Verified farmer suppliers</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">GPS Inbound Freight</span>
                <h3 className="text-2xl font-bold text-primary mt-1">12.5 Tons</h3>
                <p className="text-xs text-blue-700 font-semibold mt-2">Track truck location live</p>
              </div>
              <div className="bg-white/90 glass-panel rounded-2xl p-5 border shadow-xs">
                <span className="text-xs font-semibold text-on-surface-variant">Direct Margin Savings</span>
                <h3 className="text-2xl font-bold text-primary mt-1">18.5% Saved</h3>
                <p className="text-xs text-amber-700 font-semibold mt-2">No middleman fees</p>
              </div>
            </div>
          </div>
        )}

        {/* MARKETPLACE */}
        {activeNav === 'marketplace' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">Bulk Produce Sourcing Market</h1>
              <div className="flex gap-2">
                <button onClick={() => setSourcingFilter('All')} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${sourcingFilter === 'All' ? 'bg-secondary text-on-secondary border-secondary' : 'bg-surface text-on-surface border-outline-variant/40'}`}>All Offerings</button>
                <button onClick={() => setSourcingFilter('Grade A')} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${sourcingFilter === 'Grade A' ? 'bg-secondary text-on-secondary border-secondary' : 'bg-surface text-on-surface border-outline-variant/40'}`}>Grade A Export</button>
              </div>
            </div>

            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search produce or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-9 rounded-xl border border-outline-variant/60 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-base">search</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {produceListings
                .filter((item) => (sourcingFilter === 'All' || item.grade.includes(sourcingFilter)) && (item.crop.toLowerCase().includes(searchQuery.toLowerCase()) || item.location.toLowerCase().includes(searchQuery.toLowerCase())))
                .map((item) => (
                <div key={item.id} className="p-5 rounded-3xl glass-panel border bg-white/90 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary">{item.badge}</span>
                    <span className="text-xs text-on-surface-variant font-semibold">{item.location}</span>
                  </div>
                  <h4 className="font-bold text-lg text-primary">{item.crop}</h4>
                  <p className="text-xs text-on-surface-variant">Supplier: {item.seller} • ★ {item.rating}</p>
                  <div className="pt-2 border-t flex justify-between items-center text-xs">
                    <span className="text-secondary font-bold text-sm">NPR {item.price}/kg</span>
                    <button 
                      onClick={() => { setSelectedOrderListing(item); setOrderQty('100'); setOrderSuccessMsg(false); }}
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold border-none cursor-pointer hover:bg-primary-container transition-all"
                    >
                      Buy Direct Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GPS FREIGHT LOGISTICS */}
        {activeNav === 'logistics' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Live GPS Freight Tracker</h1>
            <div className="p-6 rounded-3xl glass-panel border bg-white/90 space-y-4">
              <h3 className="font-bold text-base text-primary">Inbound Cold-Chain Delivery #BA-3-PA-1234</h3>
              <div className="h-64 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs text-center">
                <div>
                  <span className="material-symbols-outlined text-4xl text-amber-400 animate-bounce">navigation</span>
                  <p className="font-bold text-sm mt-1">Truck En Route on Prithvi Highway (75% Complete)</p>
                  <p className="text-slate-400">ETA: Today 4:30 PM (Driver: Pasang Sherpa)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEMAND RADAR */}
        {activeNav === 'intelligence' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Wholesale Price &amp; Demand Radar</h1>
            <div className="p-6 rounded-3xl glass-panel border bg-white/90">
              <p className="text-xs text-on-surface-variant">Cardamom floor prices forecasted +3.8% bullish next week.</p>
            </div>
          </div>
        )}

        {/* SUPPLIER DIRECTORY */}
        {activeNav === 'community' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-primary">Verified Farmer Supplier Directory</h1>
            <div className="p-6 rounded-3xl glass-panel border bg-white/90">
              <h4 className="font-bold text-primary">Mustang Apple Growers Co-op</h4>
              <p className="text-xs text-on-surface-variant">★ 4.9 Rating • 48 Active Farmers</p>
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
                  <h3 className="font-bold text-lg text-primary">Manage Retailer Account</h3>
                  <p className="text-xs text-on-surface-variant">Update store name, contact &amp; procurement location</p>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="border-none bg-transparent cursor-pointer text-outline hover:text-primary">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {profileSavedMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-900 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Retailer profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-primary mb-1">Store / Business Name:</label>
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
                  <label className="block font-bold text-primary mb-1">City / District:</label>
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
                <label className="block font-bold text-primary mb-1">Physical Storefront Location:</label>
                <input
                  type="text"
                  value={profileLocation}
                  onChange={(e) => setProfileLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-secondary"
                  required
                />
              </div>

              <div className="p-3 bg-surface-container-low rounded-2xl text-[11px] text-on-surface-variant flex justify-between items-center">
                <span>Account Role: <strong className="text-primary">Verified Bulk Retailer</strong></span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary">Verified</span>
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

      {/* DIRECT SOURCING ORDER MODAL */}
      {selectedOrderListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 border border-outline-variant/30 relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart_checkout</span>
                <div>
                  <h3 className="font-bold text-lg text-primary">Place Direct Sourcing Order</h3>
                  <p className="text-xs text-on-surface-variant">Connecting directly with grower {selectedOrderListing.seller}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrderListing(null)} className="border-none bg-transparent cursor-pointer text-outline hover:text-primary">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {orderSuccessMsg ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <h4 className="font-bold text-base">Direct Purchase Order Placed!</h4>
                <p className="text-xs leading-relaxed">
                  Order for <strong>{orderQty} kg</strong> of <strong>{selectedOrderListing.crop}</strong> has been dispatched to {selectedOrderListing.seller}. A GPS freight truck will be assigned shortly.
                </p>
                <button
                  onClick={() => setSelectedOrderListing(null)}
                  className="px-6 py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold shadow-md cursor-pointer border-none"
                >
                  Close &amp; Track Order
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-surface-container-low rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-primary text-sm">{selectedOrderListing.crop}</p>
                    <p className="text-[11px] text-on-surface-variant">Location: {selectedOrderListing.location} • Grade: {selectedOrderListing.grade}</p>
                  </div>
                  <span className="font-bold text-secondary text-base">NPR {selectedOrderListing.price}/kg</span>
                </div>

                <div>
                  <label className="block font-bold text-primary mb-1">Order Quantity (kg):</label>
                  <input
                    type="number"
                    value={orderQty}
                    onChange={(e) => setOrderQty(e.target.value)}
                    min="10"
                    max="10000"
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                    <span>Subtotal Produce Cost:</span>
                    <span>NPR {(parseInt(selectedOrderListing.price.replace(/,/g, '')) * (parseInt(orderQty) || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                    <span>Middleman Commission Fee:</span>
                    <span className="text-secondary font-bold">NPR 0 (Direct 0%)</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm font-extrabold text-primary">
                    <span>Total Direct Order NPR:</span>
                    <span className="text-secondary font-mono">रु {(parseInt(selectedOrderListing.price.replace(/,/g, '')) * (parseInt(orderQty) || 0)).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setOrderSuccessMsg(true)}
                  className="w-full py-3.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-lg hover:bg-secondary/90 cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Confirm &amp; Dispatch Purchase Order</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
