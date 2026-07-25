import { useState } from 'react';

interface CreateListingProps {
  farmerName?: string;
}

const cropsOfNepal = [
  'Rice (Basmati)', 'Wheat', 'Maize / Corn', 'Large Cardamom', 'Ginger (Aduwa)',
  'Potato', 'Tomato', 'Cabbage', 'Cauliflower', 'Mustang Apple',
  'Orthodox Tea', 'Turmeric', 'Garlic', 'Onion', 'Soybean',
];

const nepalDistricts = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Sindhupalchok',
  'Chitwan', 'Makwanpur', 'Kaski', 'Syangja', 'Tanahun',
  'Jhapa', 'Morang', 'Sunsari', 'Ilam', 'Dhankuta',
  'Rupandehi', 'Kapilvastu', 'Palpa', 'Dang', 'Banke',
  'Surkhet', 'Kailali', 'Kanchanpur', 'Mustang', 'Manang',
];

const inputClass =
  'w-full rounded-xl px-4 py-3 text-sm text-on-surface border border-outline-variant/60 bg-surface-container-lowest/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all placeholder:text-on-surface-variant/60';

const labelClass = 'block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wider';

export default function CreateListing({ farmerName = 'Farmer' }: CreateListingProps) {
  const [crop, setCrop] = useState('');
  const [district, setDistrict] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [grade, setGrade] = useState('A');
  const [harvestDate, setHarvestDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 py-12 px-4 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-secondary-container/30 flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary mb-2 tracking-tight">Listing Published!</h2>
          <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
            Your <strong>{crop || 'crop'}</strong> listing is now live on the Anvaya marketplace. Verified buyers can now discover and contact you directly.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md cursor-pointer border-none"
          >
            Create Another Listing
          </button>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest transition-colors border border-outline-variant cursor-pointer"
          >
            View My Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Page Header */}
      <header className="mb-8">
        <p className="text-xs text-on-surface-variant mb-1">Good Morning, {farmerName}</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-1">Create Crop Listing</h1>
        <p className="text-sm text-on-surface-variant">List your harvest on the premium marketplace to connect with top buyers.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Details ── */}
        <section className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] space-y-5">
          <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            Basic Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Crop Name */}
            <div>
              <label className={labelClass}>Crop Name *</label>
              <div className="relative">
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className={inputClass + ' appearance-none cursor-pointer'}
                  required
                >
                  <option value="" disabled>Select Crop...</option>
                  {cropsOfNepal.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">expand_more</span>
              </div>
            </div>
            {/* District */}
            <div>
              <label className={labelClass}>District *</label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={inputClass + ' appearance-none cursor-pointer'}
                  required
                >
                  <option value="" disabled>Select District...</option>
                  {nepalDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">location_on</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing & Quantity ── */}
        <section className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] space-y-5">
          <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            Pricing &amp; Quantity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Quantity */}
            <div>
              <label className={labelClass}>Total Quantity Available *</label>
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 500"
                  className="flex-1 rounded-l-xl px-4 py-3 text-sm text-on-surface border border-outline-variant/60 border-r-0 bg-surface-container-lowest/80 focus:outline-none focus:ring-2 focus:ring-secondary focus:z-10 relative transition-all"
                  required
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="rounded-r-xl px-3 py-3 text-sm text-on-surface border border-outline-variant/60 bg-surface-container-high cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                >
                  <option value="kg">KG</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                </select>
              </div>
            </div>
            {/* Price */}
            <div>
              <label className={labelClass}>Price (NPR) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm pointer-events-none font-medium">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={inputClass + ' pl-12 pr-16'}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-outline text-xs pointer-events-none">/ {unit}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quality & Details ── */}
        <section className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] space-y-5">
          <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Quality &amp; Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Grade */}
            <div>
              <label className={labelClass}>Quality Grade</label>
              <div className="flex gap-3">
                {['A', 'B', 'C'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      grade === g
                        ? 'bg-secondary-container text-on-secondary-container border-secondary shadow-sm'
                        : 'border-outline-variant text-on-surface-variant hover:border-secondary/40 hover:bg-surface-container-low'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>
            {/* Harvest Date */}
            <div>
              <label className={labelClass}>Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the farming methods used, specific variety details, or special qualities of your produce..."
              className={inputClass + ' resize-none'}
            />
          </div>
        </section>

        {/* ── Photos ── */}
        <section className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] space-y-4">
          <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
            Photos
          </h2>
          <label className="block border-2 border-dashed border-outline-variant rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-surface-container-lowest/50 hover:bg-surface-container-low transition-colors cursor-pointer group">
            <input type="file" accept="image/*" multiple className="sr-only" />
            <div className="w-16 h-16 rounded-full bg-secondary-container/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-on-secondary-container text-3xl">add_a_photo</span>
            </div>
            <p className="font-semibold text-on-surface mb-1 text-sm">Click to upload or drag and drop</p>
            <p className="text-xs text-on-surface-variant">PNG, JPG or GIF (max 5 MB per file)</p>
          </label>
        </section>

        {/* ── Actions ── */}
        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-2 pb-8">
          <button
            type="button"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold text-primary bg-surface-container-high hover:bg-surface-variant transition-colors cursor-pointer border border-outline-variant"
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold text-secondary bg-secondary-container/30 border border-secondary hover:bg-secondary-container/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Preview Listing
          </button>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Publish Listing
          </button>
        </div>
      </form>
    </div>
  );
}
