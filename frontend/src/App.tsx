import { useEffect, useState } from 'react'
import SignUp from './components/SignUp'

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'signup'>('landing');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Namaste! I am the Anvaya Agricultural Assistant. I can forecast weather trends, monitor soil analytics, or estimate floor prices. Select a topic below to test:' }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

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

  if (currentPage === 'signup') {
    return <SignUp onNavigateBack={() => setCurrentPage('landing')} />;
  }

  return (
    <div className="bg-background text-on-surface font-body-sm min-h-screen overflow-x-hidden selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b border-white/10 px-4 md:px-12 h-16 flex items-center justify-between">
        <div className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>grass</span>
          <span className="tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Anvaya</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <a className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200" href="#features">Features</a>
          <a className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200" href="#how-it-works">How it Works</a>
          <a className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors duration-200" href="#testimonials">Testimonials</a>
        </nav>
        <button 
          onClick={() => setCurrentPage('signup')}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-label-caps hover:bg-primary-container transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
        >
          Get Started
        </button>
      </header>

      {/* Live Market Ticker */}
      <div className="fixed top-16 w-full z-40 bg-surface-container border-b border-outline-variant/20 py-2 overflow-hidden select-none">
        <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
          {tickerList.map((item, index) => (
            <div key={index} className="flex items-center gap-2 px-4 border-r border-outline-variant/30">
              <span className="font-semibold text-primary">{item.name}</span>
              <span className="text-on-surface-variant">{item.price}</span>
              <span className={`flex items-center text-xs font-bold ${item.up ? 'text-secondary' : 'text-error'}`}>
                {item.up ? '▲' : '▼'} {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="pt-28 pb-8">
        {/* Hero Section */}
        <section className="px-4 md:px-12 py-8 md:py-24 flex flex-col lg:flex-row items-center gap-8 max-w-7xl mx-auto">
          <div className="w-full lg:w-1/2 flex flex-col gap-4 fade-in-up visible">
            <div className="inline-flex items-center gap-2 bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary glow-pulse"></span>
              Live Agricultural Network Active
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary tracking-tight leading-tight">
              Cultivating Connectivity: <br />
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Empowering Nepal's Fields,</span> <br />
              Elevating Nepal's Markets.
            </h1>
            <p className="text-base md:text-lg text-on-surface-variant max-w-lg leading-relaxed block whitespace-normal">
              Anvaya is a state-of-the-art agricultural ecosystem that unites rural Nepalese growers with major commercial buyers. Leveraging real-time AI forecasts, direct-to-retail logistics, and transparent pricing, we eliminate middlemen to deliver fresher produce and higher margins.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button 
                onClick={() => setCurrentPage('signup')}
                className="bg-secondary text-on-secondary px-7 py-3.5 rounded-xl font-label-caps text-label-caps shadow-md hover:bg-on-secondary-container hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                Join the Future of Agriculture
              </button>
              <button className="bg-surface-container-high text-on-surface px-7 py-3.5 rounded-xl font-label-caps text-label-caps border border-outline-variant hover:bg-surface-container-highest hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative rounded-2xl overflow-hidden glass-panel p-2.5 fade-in-up visible" style={{ transitionDelay: '0.2s' }}>
            <img 
              className="w-full aspect-video lg:aspect-square rounded-2xl object-cover shadow-sm hover:scale-[1.02] transition-transform duration-700" 
              src="/smart_farm_nepal.png"
              alt="Premium illustration of a modern Nepalese terraced farm. The scene features lush green fields integrated with subtle, glowing golden digital nodes, data overlays, and connectivity symbols."
            />
            {/* Overlay Dashboard Telemetry Card */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-panel border border-white/20 bg-background/90 shadow-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary">Mustang IoT Hub</h4>
                  <p className="text-xs text-on-surface-variant">Soil Moisture: 72% (Optimal)</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                  Connected
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 md:px-12 py-8 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 fade-in-up visible">
              <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mt-2">10k+ Farmers</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center">Digitized, trained & empowered nationwide</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 fade-in-up visible" style={{ transitionDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mt-2">5k+ Retailers</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center">Sourcing bulk fresh produce weekly</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 fade-in-up visible" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary mt-2">24/7 AI Guidance</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center">Predictive soil, price, and weather insights</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 md:px-12 py-8 md:py-24 max-w-7xl mx-auto" id="how-it-works">
          <div className="text-center max-w-2xl mx-auto mb-16 fade-in-up visible">
            <h2 className="font-headline-md text-headline-md text-primary mb-3">Empowering Trade in 4 Simple Steps</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Anvaya connects local cultivation directly to national commercial markets with transparency and speed.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col gap-2 shadow-sm hover:border-secondary-container transition-all duration-300 fade-in-up visible">
              <span className="absolute top-4 right-4 text-4xl font-extrabold text-secondary/15">01</span>
              <div className="w-10 h-10 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined">edit_document</span>
              </div>
              <h3 className="font-bold text-primary text-lg">List & Verify</h3>
              <p className="text-sm text-on-surface-variant">Farmers post their upcoming crop yields and specify quality parameters easily on our portal.</p>
            </div>
            
            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col gap-2 shadow-sm hover:border-secondary-container transition-all duration-300 fade-in-up visible" style={{ transitionDelay: '0.1s' }}>
              <span className="absolute top-4 right-4 text-4xl font-extrabold text-secondary/15">02</span>
              <div className="w-10 h-10 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined">insights</span>
              </div>
              <h3 className="font-bold text-primary text-lg">AI Pricing Forecast</h3>
              <p className="text-sm text-on-surface-variant">Our intelligence model scans current markets to calculate a fair and guaranteed floor price suggestion.</p>
            </div>
            
            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col gap-2 shadow-sm hover:border-secondary-container transition-all duration-300 fade-in-up visible" style={{ transitionDelay: '0.2s' }}>
              <span className="absolute top-4 right-4 text-4xl font-extrabold text-secondary/15">03</span>
              <div className="w-10 h-10 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <h3 className="font-bold text-primary text-lg">Smart Dispatch</h3>
              <p className="text-sm text-on-surface-variant">Buyers book listings, triggering our regional logistics agents to arrange direct-from-farm loading.</p>
            </div>
            
            {/* Step 4 */}
            <div className="relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col gap-2 shadow-sm hover:border-secondary-container transition-all duration-300 fade-in-up visible" style={{ transitionDelay: '0.3s' }}>
              <span className="absolute top-4 right-4 text-4xl font-extrabold text-secondary/15">04</span>
              <div className="w-10 h-10 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary mb-2">
                <span className="material-symbols-outlined">currency_exchange</span>
              </div>
              <h3 className="font-bold text-primary text-lg">Fast Settlement</h3>
              <p className="text-sm text-on-surface-variant">Shipments are completed rapidly, and funds settle instantly in the grower's digital vault.</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 md:px-12 py-8 md:py-24 max-w-7xl mx-auto" id="features">
          <div className="text-center max-w-2xl mx-auto mb-16 fade-in-up visible">
            <h2 className="font-headline-md text-headline-md text-primary mb-3">Powerful Ecosystem Features</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Every tool rural cooperatives and wholesale buyers require to thrive in the modern trade landscape.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md border border-outline-variant/15 fade-in-up visible">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">Direct Marketplace</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant block whitespace-normal">
                Bypass layers of commission brokers. Connect directly to verified retail outlets and wholesalers for reliable contracts, guaranteed payments, and significantly higher farm gate pricing.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md border border-outline-variant/15 fade-in-up visible" style={{ transitionDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">Price Intelligence</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant block whitespace-normal">
                Acquire instant visibility into spot prices across major city hubs like Kathmandu, Pokhara, and Biratnagar. Leverage minimal charts, historical trendlines, and regional price spreads.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md border border-outline-variant/15 fade-in-up visible" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">AI Forecast</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant block whitespace-normal">
                Unlock advanced machine learning predictions for harvest yields, climatic shifts, and crop disease anomalies. Access clear, actionable tips tailored to your specific micro-climate.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-md border border-outline-variant/15 fade-in-up visible" style={{ transitionDelay: '0.3s' }}>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">Smart Logistics</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant block whitespace-normal">
                Coordinate transit via our dynamic logistics routing platform. Track trucks, monitor temperature controls, and keep transit durations short to prevent post-harvest spoilage.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-4 md:px-12 py-8 md:py-24 bg-surface-container-low border-y border-outline-variant/20" id="testimonials">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 fade-in-up visible">
              <h2 className="font-headline-md text-headline-md text-primary mb-3">Partner Stories</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Read how farmers and businesses are transforming their trade with Anvaya.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Testimonial 1 */}
              <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between gap-4 border border-outline-variant/10 shadow-sm fade-in-up visible">
                <p className="font-body-lg text-body-lg italic text-on-surface-variant leading-relaxed block whitespace-normal">
                  "Thanks to Anvaya's direct marketplace, I sold my entire potato crop for 30% higher margins than previous seasons. The logistics team came straight to my farm in Pokhara. The transparency is life-changing."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold">
                    RT
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">Ram Bahadur Tamang</h4>
                    <p className="text-xs text-on-surface-variant">Potato Grower, Pokhara</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between gap-4 border border-outline-variant/10 shadow-sm fade-in-up visible" style={{ transitionDelay: '0.1s' }}>
                <p className="font-body-lg text-body-lg italic text-on-surface-variant leading-relaxed block whitespace-normal">
                  "Sourcing fresh produce in bulk used to take days of phone calls and broker negotiations. Now, I order verified quality directly from the fields in under five minutes. Logistics tracking tells me exactly when delivery arrives."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold">
                    SS
                  </div>
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
        <section className="px-4 md:px-12 py-8 md:py-24 bg-primary text-on-primary text-center flex flex-col items-center gap-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-secondary-fixed fade-in-up visible">
            Ready to Connect Your Fields?
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary/80 max-w-2xl fade-in-up visible block whitespace-normal" style={{ transitionDelay: '0.1s' }}>
            Join thousands of modern Nepalese growers and commercial distributors on the smart agricultural exchange network.
          </p>
          <button 
            onClick={() => setCurrentPage('signup')}
            className="mt-2 bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-xl font-label-caps text-label-caps shadow-lg hover:bg-secondary-container hover:scale-105 active:scale-95 transition-all duration-200 fade-in-up visible cursor-pointer" 
            style={{ transitionDelay: '0.2s' }}
          >
            Get Started For Free
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

            {/* Quick Actions Footer */}
            <div className="p-3 bg-surface-container-low border-t border-outline-variant/20 flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => handleAiSelect('weather')}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container transition-all text-[11px] font-semibold text-primary cursor-pointer"
              >
                🌤 Weather Forecast
              </button>
              <button 
                onClick={() => handleAiSelect('prices')}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container transition-all text-[11px] font-semibold text-primary cursor-pointer"
              >
                📈 Cardamom Prices
              </button>
              <button 
                onClick={() => handleAiSelect('soil')}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container-highest hover:bg-secondary-container hover:text-on-secondary-container transition-all text-[11px] font-semibold text-primary cursor-pointer"
              >
                🌱 Soil Health Tips
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
