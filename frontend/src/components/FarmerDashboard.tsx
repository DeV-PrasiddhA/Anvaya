import { useState } from 'react';
import CreateListing from './CreateListing';

interface FarmerDashboardProps {
  farmerName?: string;
  onNavigateBack: () => void;
}

export default function FarmerDashboard({ farmerName = 'Farmer', onNavigateBack }: FarmerDashboardProps) {
  const [activeNav, setActiveNav] = useState('dashboard');

  const pageTitles: Record<string, string> = {
    dashboard: 'Overview',
    marketplace: 'Marketplace',
    intelligence: 'Intelligence',
    logistics: 'Logistics',
    community: 'Community',
  };
  const pageTitle = pageTitles[activeNav] ?? 'Overview';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'marketplace', label: 'Marketplace', icon: 'storefront' },
    { id: 'intelligence', label: 'Intelligence', icon: 'monitoring' },
    { id: 'logistics', label: 'Logistics', icon: 'local_shipping' },
    { id: 'community', label: 'Community', icon: 'groups' },
  ];

  const orders = [
    { id: '#ORD-992', product: 'Organic Ginger', qty: '50 kg', status: 'Completed', amount: '12,500', statusStyle: 'bg-secondary-container/30 text-on-secondary-container' },
    { id: '#ORD-993', product: 'Himalayan Apples', qty: '120 kg', status: 'Processing', amount: '28,800', statusStyle: 'bg-[#fff4e5] text-[#b26a00]' },
    { id: '#ORD-994', product: 'Red Onions', qty: '200 kg', status: 'Pending Transit', amount: '16,000', statusStyle: 'bg-[#f2f3ff] text-primary' },
  ];

  return (
    <div className="bg-background text-on-surface font-body-sm antialiased selection:bg-secondary-container selection:text-on-secondary-container flex min-h-screen">

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col bg-primary text-on-primary border-r border-white/5 shadow-xl py-6 gap-2 z-40">
        <div className="px-6 mb-8">
          <h1 className="font-headline-md text-headline-md text-secondary-fixed-dim">Anvaya</h1>
          <p className="font-body-sm text-body-sm text-on-primary/70 mt-1">Premium Agricultural Hub</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-4 rounded-xl px-4 py-3 font-body-lg text-body-lg mx-0 my-0 transition-colors text-left cursor-pointer border-none ${
                activeNav === item.id
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-primary/70 hover:text-on-primary hover:bg-primary-container/20'
              }`}
            >
              <span className="material-symbols-outlined" style={activeNav === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto px-6 pt-6 border-t border-white/10 space-y-2">
          <button className="flex items-center gap-4 text-on-primary/70 hover:text-on-primary transition-colors py-2 w-full bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </button>
          <button className="flex items-center gap-4 text-on-primary/70 hover:text-on-primary transition-colors py-2 w-full bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined">help</span>
            Support
          </button>
          <button
            onClick={onNavigateBack}
            className="mt-4 w-full py-2.5 bg-transparent border border-white/20 text-on-primary/70 hover:text-on-primary hover:border-white/40 rounded-xl font-label-caps text-label-caps transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
          <button className="mt-2 w-full py-3 bg-secondary text-on-secondary rounded-xl font-label-caps text-label-caps hover:bg-secondary/90 transition-colors shadow-sm cursor-pointer border-none">
            Upgrade Plan
          </button>
        </div>
      </aside>

      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-30 bg-surface/80 backdrop-blur-xl border-b border-white/10 shadow-sm flex justify-between items-center h-16 px-4 md:px-12 md:pl-[calc(256px+48px)] transition-all">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-primary hover:bg-surface-container-high/50 p-2 rounded-full transition-colors active:scale-95 border-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="font-headline-md text-headline-md font-bold text-primary md:hidden">Anvaya</h2>
          <h2 className="font-headline-md text-headline-md font-bold text-primary hidden md:block">{pageTitle}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-on-surface-variant hover:bg-surface-container-high/50 p-2 rounded-full transition-colors active:scale-95 relative border-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-high/50 p-2 rounded-full transition-colors active:scale-95 border-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Content Area — conditional on activeNav */}
      <main className="flex-1 mt-16 md:ml-64 p-4 md:p-12 bg-surface-container-lowest pb-28 md:pb-12">
        {activeNav === 'marketplace' ? (
          <CreateListing farmerName={farmerName} />
        ) : activeNav === 'dashboard' ? (
          <>
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Good Morning, {farmerName}</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Your Dashboard</h2>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface border border-outline-variant text-sm font-body-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Last 30 Days
                </button>
              </div>
            </div>

            {/* Analytics Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Revenue Card */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 border-t-white/60 rounded-xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative overflow-hidden hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.08)] transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Total Revenue</p>
                  <div className="p-2 bg-secondary-container/30 rounded-lg text-secondary">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-2">रु 4,25,000</h3>
                <div className="flex items-center gap-1 text-secondary font-label-caps text-label-caps">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>+12.5% vs last month</span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-16 opacity-10 pointer-events-none">
                  <svg className="w-full h-full fill-secondary" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path d="M0 40 L0 30 L20 35 L40 20 L60 25 L80 10 L100 15 L100 40 Z" />
                  </svg>
                </div>
              </div>

              {/* Active Listings */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 border-t-white/60 rounded-xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.08)] transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Active Listings</p>
                  <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-2">14</h3>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-caps text-label-caps">
                  <span>3 listings expiring soon</span>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 border-t-white/60 rounded-xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.08)] transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Pending Orders</p>
                  <div className="p-2 bg-error-container/50 rounded-lg text-error">
                    <span className="material-symbols-outlined">local_shipping</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-on-surface mb-2">8</h3>
                <div className="flex items-center gap-1 text-error font-label-caps text-label-caps">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>Needs attention today</span>
                </div>
              </div>
            </div>

            {/* Middle: Weather + Price Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              {/* Weather Widget */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] lg:col-span-1 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 pointer-events-none" />
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">Kathmandu Valley</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Today's Forecast</p>
                    </div>
                    <span className="material-symbols-outlined text-[40px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>partly_cloudy_day</span>
                  </div>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-[56px] font-bold leading-none tracking-tighter text-on-surface">24°</span>
                    <span className="font-body-lg text-body-lg text-on-surface-variant mb-2">C</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-outline-variant/30">
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Rainfall</p>
                      <p className="font-body-sm text-body-sm font-semibold">12mm expected</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Humidity</p>
                      <p className="font-body-sm text-body-sm font-semibold">65%</p>
                    </div>
                  </div>
                  <div className="mt-auto bg-secondary-container/30 p-4 rounded-xl border border-secondary/20">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                      <div>
                        <p className="font-label-caps text-label-caps text-secondary font-bold mb-1">AI Advisor</p>
                        <p className="font-body-sm text-body-sm text-on-secondary-container leading-relaxed">
                          Optimal soil moisture detected. Good time for nitrogen fertilizer application on organic ginger plots.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Trends Chart */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Market Price Trends</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Wholesale price per KG (NPR)</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <span className="inline-flex items-center gap-1.5 font-label-caps text-label-caps bg-surface-container-high px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span> Organic Ginger
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-label-caps text-label-caps bg-surface-container-high px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-outline inline-block"></span> Red Onions
                    </span>
                  </div>
                </div>
                <div className="flex-1 relative min-h-[200px] w-full mt-4">
                  <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-[11px] text-on-surface-variant text-right pr-2">
                    <span>200</span><span>150</span><span>100</span><span>50</span>
                  </div>
                  <div className="absolute left-10 right-0 top-0 bottom-8 border-l border-b border-outline-variant/40 relative">
                    <div className="absolute w-full h-full flex flex-col justify-between pointer-events-none">
                      {[0,1,2].map(i => <div key={i} className="w-full border-t border-outline-variant/10 h-0" />)}
                      <div className="w-full h-0" />
                    </div>
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,60 L16,55 L33,40 L50,45 L66,30 L83,20 L100,15" fill="none" stroke="#006d3e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      <path d="M0,80 L16,85 L33,75 L50,80 L66,70 L83,75 L100,65" fill="none" stroke="#717973" strokeDasharray="4,4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      {[[16,55],[50,45],[83,20]].map(([cx,cy]) => (
                        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="white" stroke="#006d3e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      ))}
                    </svg>
                  </div>
                  <div className="absolute left-10 right-0 bottom-0 h-8 flex justify-between items-end text-[11px] text-on-surface-variant px-1">
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] overflow-x-auto">
              <div className="flex justify-between items-center mb-6 min-w-[560px]">
                <h3 className="font-headline-md text-headline-md text-on-surface">Recent Orders</h3>
                <button className="text-primary font-label-caps text-label-caps hover:underline bg-transparent border-none cursor-pointer">View All</button>
              </div>
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-caps text-label-caps">
                    <th className="pb-3 pl-2 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Quantity</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 text-right pr-2 font-semibold">Amount (NPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 pl-2 text-on-surface-variant text-sm">{order.id}</td>
                      <td className="py-4 font-semibold text-on-surface text-sm">{order.product}</td>
                      <td className="py-4 text-sm">{order.qty}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${order.statusStyle}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2 font-semibold text-sm">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
            <span className="material-symbols-outlined text-6xl text-outline/30">construction</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">{pageTitle}</h3>
            <p className="text-sm text-on-surface-variant max-w-xs">This section is coming soon. Stay tuned for updates.</p>
          </div>
        )}
      </main>

      {/* Main Content Area — conditional on activeNav */}
      <main className="flex-1 mt-16 md:ml-64 p-4 md:p-12 bg-surface-container-lowest pb-28 md:pb-12">
        {activeNav === 'marketplace' ? (
          <CreateListing farmerName={farmerName} />
        ) : activeNav === 'dashboard' ? (
          <>
            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">Good Morning, {farmerName}</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Your Dashboard</h2>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full bg-surface-container-low text-on-surface border border-outline-variant text-sm font-body-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Last 30 Days
                </button>
              </div>
            </div>

          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
            <span className="material-symbols-outlined text-6xl text-outline/30">construction</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">{pageTitle}</h3>
            <p className="text-sm text-on-surface-variant max-w-xs">This section is coming soon. Stay tuned for updates.</p>
          </div>
        )}
      </main>
      {/* Floating Action Button — opens Create Listing */}
      <button
        onClick={() => setActiveNav('marketplace')}
        title="Create New Listing"
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-secondary text-on-secondary rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center z-40 group border-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-[28px] group-hover:rotate-90 transition-transform duration-300">add</span>
      </button>

      {/* Bottom Navigation (Mobile only) */}
      <nav className="fixed bottom-0 w-full md:hidden rounded-t-xl z-50 bg-surface/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_0_rgba(0,0,0,0.08)] flex justify-around items-center h-20 px-4">
        {[
          { id: 'dashboard', label: 'Home', icon: 'home' },
          { id: 'marketplace', label: 'Market', icon: 'shopping_bag' },
          { id: 'ai', label: 'AI Advisor', icon: 'smart_toy' },
          { id: 'logistics', label: 'Logistics', icon: 'package_2' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-colors border-none bg-transparent cursor-pointer relative ${
              activeNav === item.id ? 'text-secondary font-bold bg-secondary-container/20 scale-110' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={activeNav === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
              {item.icon}
            </span>
            <span className="font-label-caps text-[10px] mt-1 tracking-wider">{item.label}</span>
            {item.id === 'ai' && <span className="absolute top-1 right-3 w-2 h-2 bg-secondary rounded-full" />}
          </button>
        ))}
      </nav>
    </div>
  );
}
