import React, { useState } from 'react';

interface SignUpProps {
  onNavigateBack: () => void;
}

type Role = 'Farmer' | 'Retailer' | 'Cooperative' | 'Transport Provider';
type Phase = 'select-role' | 'fill-form' | 'success';

export default function SignUp({ onNavigateBack }: SignUpProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [phase, setPhase] = useState<Phase>('select-role');

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: 'Kathmandu',
    extraField1: '', // Tailored based on role (e.g. crop type, store name, vehicle capacity)
    extraField2: '', // (e.g. volume, member count, license plate)
  });

  const [formError, setFormError] = useState('');

  const roles = [
    {
      id: 'Farmer' as Role,
      title: 'Farmer',
      icon: 'agriculture',
      description: 'Access real-time market prices, connect directly with buyers, and receive AI-driven crop advisory.',
      placeholder1: 'Primary Crop (e.g. Cardamom, Potato)',
      placeholder2: 'Land Size (in Ropani / Bigha)',
    },
    {
      id: 'Retailer' as Role,
      title: 'Retailer',
      icon: 'storefront',
      description: 'Source quality produce directly from farmers, track logistics, and analyze wholesale market trends.',
      placeholder1: 'Store Name / Business Name',
      placeholder2: 'Primary Sourcing Volume (Monthly)',
    },
    {
      id: 'Cooperative' as Role,
      title: 'Cooperative',
      icon: 'groups',
      description: 'Manage member farmers, bulk negotiate prices, and streamline regional logistics planning.',
      placeholder1: 'Registered Cooperative Name',
      placeholder2: 'Number of Active Member Farmers',
    },
    {
      id: 'Transport Provider' as Role,
      title: 'Transport Provider',
      icon: 'local_shipping',
      description: 'Optimize route planning, find backhaul loads, and connect with farmers needing logistics support.',
      placeholder1: 'Vehicle Type (e.g., Mini Truck, Cold Chain)',
      placeholder2: 'Vehicle Number (e.g., BA 3 PA 1234)',
    },
  ];

  const handleRoleClick = (roleId: Role) => {
    setSelectedRole(roleId);
    setFormData({
      name: '',
      phone: '',
      district: 'Kathmandu',
      extraField1: '',
      extraField2: '',
    });
    setFormError('');
    setPhase('fill-form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.extraField1) {
      setFormError('Please fill in all required fields.');
      return;
    }
    // Simple validation for phone
    if (!/^\d{10}$/.test(formData.phone)) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setFormError('');
    setPhase('success');
  };

  const currentRoleConfig = roles.find((r) => r.id === selectedRole);

  const districtsOfNepal = [
    'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Mustang', 'Jhapa', 'Morang', 
    'Sunsari', 'Kaski', 'Chitwan', 'Rupandehi', 'Ilam', 'Dhankuta', 'Dolkha'
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative overflow-x-hidden font-body-sm">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-fixed opacity-30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-fixed opacity-20 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content Canvas */}
      <main className="flex-grow z-10 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop w-full max-w-7xl mx-auto min-h-screen">
        {/* Brand Header */}
        <div className="absolute top-6 left-6 md:left-12 z-20">
          <button
            onClick={onNavigateBack}
            className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 hover:opacity-85 transition-opacity focus:outline-none cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>grass</span>
            <span className="tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Anvaya</span>
          </button>
        </div>

        {phase === 'select-role' && (
          <div className="flex flex-col items-center justify-center w-full py-12">
            {/* Header Section */}
            <div className="text-center mb-xl w-full max-w-3xl animate-fade-in">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-sm font-bold tracking-tight">
                Choose your role
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
                Select how you'll interact with the Anvaya ecosystem. You can add additional roles later from your dashboard.
              </p>
            </div>

            {/* Role Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter md:gap-lg w-full max-w-4xl px-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                  className="role-card glass-panel rounded-xl p-lg flex flex-col items-start text-left cursor-pointer border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] bg-surface/80 group focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 w-full"
                >
                  <div className="icon-container w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-md text-primary">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {role.icon}
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-primary mb-xs font-semibold">{role.title}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">{role.description}</p>
                </button>
              ))}
            </div>

            {/* Return to Login */}
            <div className="mt-xl text-center">
              <button
                onClick={onNavigateBack}
                className="font-body-sm text-body-sm text-primary hover:text-secondary transition-colors underline decoration-primary/30 hover:decoration-secondary focus:outline-none cursor-pointer border-none bg-transparent"
              >
                Already have an account? Log in
              </button>
            </div>
          </div>
        )}

        {phase === 'fill-form' && currentRoleConfig && (
          <div className="w-full max-w-lg p-6 md:p-8 rounded-2xl glass-panel border border-white/20 bg-background/90 shadow-2xl relative">
            <button
              onClick={() => setPhase('select-role')}
              className="absolute top-4 left-4 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 text-sm font-semibold cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span> Back
            </button>

            <div className="text-center mt-6 mb-8">
              <div className="inline-flex w-12 h-12 rounded-full bg-secondary-container/30 text-secondary items-center justify-center mb-2">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {currentRoleConfig.icon}
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Register as {currentRoleConfig.title}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Enter your details to construct your smart profile
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                  Full Name / Contact Person *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ram Bahadur Tamang"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                  Phone Number (Nepal Mobile) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9841XXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                  District *
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                >
                  {districtsOfNepal.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                  {currentRoleConfig.placeholder1.split(' (')[0]} *
                </label>
                <input
                  type="text"
                  name="extraField1"
                  value={formData.extraField1}
                  onChange={handleInputChange}
                  placeholder={currentRoleConfig.placeholder1}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                  {currentRoleConfig.placeholder2.split(' (')[0]} (Optional)
                </label>
                <input
                  type="text"
                  name="extraField2"
                  value={formData.extraField2}
                  onChange={handleInputChange}
                  placeholder={currentRoleConfig.placeholder2}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-secondary text-on-secondary py-3 rounded-xl font-label-caps text-label-caps shadow-md hover:bg-on-secondary-container hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none"
              >
                Create Account
              </button>
            </form>
          </div>
        )}

        {phase === 'success' && currentRoleConfig && (
          <div className="w-full max-w-md p-8 rounded-2xl glass-panel border border-white/20 bg-background/95 shadow-2xl text-center relative overflow-hidden">
            {/* Top Confetti Blobs */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-secondary via-secondary-fixed to-primary"></div>
            
            <div className="w-20 h-20 bg-secondary-container/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-6 scale-110 shadow-inner">
              <span className="material-symbols-outlined text-5xl animate-bounce">check_circle</span>
            </div>

            <h2 className="font-headline-lg-mobile md:font-headline-lg text-primary font-bold tracking-tight mb-2">
              Registration Successful!
            </h2>
            
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-left my-6 text-sm flex flex-col gap-2">
              <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                <span className="text-on-surface-variant">Profile Role:</span>
                <span className="font-semibold text-primary">{currentRoleConfig.title}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                <span className="text-on-surface-variant">Account Holder:</span>
                <span className="font-semibold text-primary">{formData.name}</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                <span className="text-on-surface-variant">District:</span>
                <span className="font-semibold text-primary">{formData.district}</span>
              </div>
              <div className="flex justify-between pb-0.5">
                <span className="text-on-surface-variant">Verified Phone:</span>
                <span className="font-semibold text-primary">+977 {formData.phone}</span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto mb-8">
              Welcome to the Anvaya family. Your dashboard has been provisioned. Let's start empowering fields and elevating markets together.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onNavigateBack}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-caps text-label-caps shadow-md hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setPhase('select-role')}
                className="w-full bg-surface-container-high text-on-surface py-3 rounded-xl font-label-caps text-label-caps border border-outline-variant hover:bg-surface-container-highest hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer border-none"
              >
                Create Another Profile
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
