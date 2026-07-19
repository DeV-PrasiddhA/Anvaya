import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-scale">
      <div className="relative mb-6">
        <span
          className="material-symbols-outlined text-[80px] text-outline-variant/40"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          travel_explore
        </span>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-error-container rounded-full flex items-center justify-center text-error text-[14px] font-bold animate-bounce-in">
          ?
        </span>
      </div>
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-2">
        Page not found
      </h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 max-w-md">
        The page you're looking for doesn't exist yet. Pick a dashboard to
        continue.
      </p>
      <div className="flex gap-3">
        <Link
          to="/transport"
          className="btn-primary"
        >
          Transport
        </Link>
        <Link
          to="/retailer"
          className="btn-outline"
        >
          Retailer
        </Link>
      </div>
    </div>
  );
}
