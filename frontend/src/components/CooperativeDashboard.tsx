import { useState } from 'react';
import type { UserProfile } from './SignUp';
import BrandLogo from './BrandLogo';

interface CooperativeDashboardProps {
  userProfile?: UserProfile;
  onNavigateBack: () => void;
}

export default function CooperativeDashboard({ userProfile, onNavigateBack }: CooperativeDashboardProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const displayName = userProfile?.name || 'Cooperative Manager';

  return (
    <div className="bg-background text-on-surface font-body-sm flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" onClick={onNavigateBack} />
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-900 border border-amber-500/30 ml-2">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Cooperative Hub (Coming Soon)</span>
          </div>
        </div>

        <button
          onClick={onNavigateBack}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold border-none cursor-pointer text-primary"
        >
          ← Back to Home
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto p-4 md:p-8 pt-24 md:pt-28 pb-16 w-full flex flex-col justify-center items-center text-center">
        
        {/* Teaser Hero Card */}
        <div className="w-full p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary via-primary-container to-primary text-on-primary shadow-2xl border border-white/20 space-y-6 relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-200 text-xs font-extrabold border border-amber-500/40">
            <span className="material-symbols-outlined text-sm">groups</span>
            <span>Cooperative Network • Coming Soon</span>
          </div>

          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>diversity_3</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Cooperative Bulk Storage &amp; Auctions
            </h1>
            <p className="text-sm md:text-base text-on-primary/80 leading-relaxed">
              We are currently building advanced tools tailored for Nepalese Agricultural Cooperatives — enabling small farm yield aggregation, regional cold-storage management, wholesale bulk pool auctions, and automated member payouts.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setIsSubscribed(true)}
              className="px-8 py-3.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-lg hover:bg-secondary/90 transition-all cursor-pointer border-none flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">notifications_active</span>
              <span>{isSubscribed ? '✓ Notification Enabled' : 'Notify Me On Release'}</span>
            </button>
            
            <button
              onClick={onNavigateBack}
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer border border-white/20"
            >
              Return to Homepage
            </button>
          </div>

          {isSubscribed && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold animate-fade-in max-w-md mx-auto">
              Namaste {displayName}! You will be notified immediately when Cooperative Hub onboarding launches.
            </div>
          )}
        </div>

        {/* Feature Teasers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-left">
          
          <div className="p-6 rounded-3xl bg-white/90 glass-panel border border-outline-variant/20 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">warehouse</span>
            </div>
            <h3 className="font-bold text-primary text-base">Bulk Storage Aggregation</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pool small harvest outputs from hundreds of member farmers into single, uniform 10-ton to 50-ton wholesale batches.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 glass-panel border border-outline-variant/20 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">gavel</span>
            </div>
            <h3 className="font-bold text-primary text-base">Regional Bulk Auctions</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Run transparent wholesale price auctions directly with national distributor networks to secure higher floor margins.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 glass-panel border border-outline-variant/20 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <h3 className="font-bold text-primary text-base">Automated Member Payouts</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Seamlessly track individual member contributions and distribute auction proceeds back to smallholders fairly.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}
