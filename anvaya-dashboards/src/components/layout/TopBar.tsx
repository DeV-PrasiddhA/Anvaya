import { Link, useLocation } from "react-router-dom";

export default function TopBar() {
  const location = useLocation();
  const isRetailer = location.pathname.startsWith("/retailer");
  return (
    <header className="fixed top-0 w-full z-50 md:hidden bg-surface/80 backdrop-blur-xl shadow-sm border-b border-white/10 flex justify-between items-center h-16 px-margin-mobile pt-safe">
      <Link
        to={isRetailer ? "/retailer" : "/transport"}
        className="font-headline-md text-headline-md font-bold text-primary tracking-tight"
      >
        Anvaya
      </Link>
      <div className="flex gap-4 items-center">
        <button
          className="text-on-surface-variant hover:bg-surface-container-high/50 p-2 rounded-full transition-all duration-200 active:scale-90"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          className="text-on-surface-variant hover:bg-surface-container-high/50 p-2 rounded-full transition-all duration-200 active:scale-90"
          aria-label="Account"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
