import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  activeRoute as initialRoute,
  allRoutes,
  backhaulLoads,
  transportMetrics,
} from "@/data/transport";
import type { ActiveRoute, BackhaulLoad, TransportRoute } from "@/types";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";
import RouteMap from "@/components/RouteMap";

const BACKHAUL_INITIAL = 5;

const REQ_ICON: Record<BackhaulLoad["requirement"], string> = {
  temp: "ac_unit",
  dry: "dry",
  fragile: "precision_manufacturing",
  none: "check_circle",
};

const ROUTE_STATUS_META: Record<
  string,
  { tone: "success" | "warning" | "info" | "error"; icon: string }
> = {
  "en-route": { tone: "success", icon: "local_shipping" },
  loading: { tone: "warning", icon: "hourglass_top" },
  delivered: { tone: "info", icon: "check_circle" },
  delayed: { tone: "error", icon: "schedule" },
};

function formatNpr(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function MetricCard({
  label,
  value,
  unit,
  tone,
  delay,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "default" | "positive" | "warning";
  delay?: number;
}) {
  const valueClass =
    tone === "positive"
      ? "text-secondary"
      : tone === "warning"
        ? "text-error"
        : "text-on-surface";

  return (
    <div
      className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-secondary/40 hover:shadow-sm transition-all duration-300 animate-stagger"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="font-label-caps text-label-caps text-on-surface-variant mb-1">
        {label}
      </div>
      <div
        className={`font-headline-lg-mobile text-headline-lg-mobile ${valueClass}`}
      >
        {value}
        {unit && (
          <span className="text-body-sm font-normal text-on-surface-variant ml-1">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function BackhaulCard({
  load,
  onBid,
  bidding,
  index,
}: {
  load: BackhaulLoad;
  onBid: (load: BackhaulLoad) => void;
  bidding: boolean;
  index: number;
}) {
  return (
    <div
      className="p-3 rounded-lg border border-outline-variant/20 hover:bg-surface-container-low hover:border-secondary/30 transition-all duration-300 cursor-pointer group animate-stagger"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-body-sm text-body-sm font-semibold text-on-surface">
          {load.title}
        </div>
        <div className="font-body-sm text-body-sm text-secondary font-semibold">
          NPR {formatNpr(load.priceNpr)}
        </div>
      </div>
      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-3 flex-wrap">
        <span className="material-symbols-outlined text-[16px]">weight</span>
        {load.weightTons} Tons
        <span className="mx-1">•</span>
        <span className="material-symbols-outlined text-[16px]">
          {REQ_ICON[load.requirement]}
        </span>
        {load.requirementLabel}
        <span className="mx-1">•</span>
        <span className="text-[12px] text-on-surface-variant/70">
          {load.origin} → {load.destination}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-on-surface-variant">
          Expires in {load.expiresInHours}h
        </span>
        <button
          onClick={() => onBid(load)}
          disabled={bidding}
          className="flex-1 py-2 bg-primary-container/5 text-primary-container rounded-md font-label-caps text-label-caps group-hover:bg-primary-container group-hover:text-on-primary transition-all duration-300 border border-primary-container/20 disabled:opacity-50 active:scale-95"
        >
          {bidding ? "Submitting..." : "Bid on Load"}
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex-1 px-3 flex items-center relative">
      <div className="h-1 w-full bg-outline-variant/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className="material-symbols-outlined absolute -top-3 text-secondary transition-all duration-700 ease-out"
        style={{
          left: `calc(${pct}% - 12px)`,
          fontVariationSettings: "'FILL' 1",
        }}
      >
        location_on
      </span>
    </div>
  );
}

function RouteListItem({
  route,
  isActive,
  onSelect,
}: {
  route: TransportRoute;
  isActive: boolean;
  onSelect: (r: TransportRoute) => void;
}) {
  const meta = ROUTE_STATUS_META[route.status] ?? ROUTE_STATUS_META["en-route"];
  return (
    <button
      onClick={() => onSelect(route)}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
        isActive
          ? "border-secondary/40 bg-secondary-container/10 shadow-glow-green"
          : "border-outline-variant/20 hover:bg-surface-container-low hover:border-secondary/20"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-[13px] text-on-surface truncate">
          {route.name}
        </span>
        <Badge tone={meta.tone} icon={meta.icon}>
          {route.statusLabel}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
        {route.truckId}
        <span className="mx-1">•</span>
        {route.distanceKm} km
        <span className="mx-1">•</span>
        {route.estimatedHours}h est.
      </div>
      {route.status === "en-route" && (
        <div className="mt-2 h-1 w-full bg-outline-variant/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-500"
            style={{ width: `${route.progressPct}%` }}
          />
        </div>
      )}
    </button>
  );
}

export default function TransportDashboard() {
  const [route, setRoute] = useState<ActiveRoute>(initialRoute);
  const [tracking, setTracking] = useState(true);
  const [bidding, setBidding] = useState<string | null>(null);
  const [bidTarget, setBidTarget] = useState<BackhaulLoad | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<
    "all" | BackhaulLoad["category"]
  >("all");
  const [selectedRouteId, setSelectedRouteId] = useState<string>("RT-001");
  const [showRoutes, setShowRoutes] = useState(true);
  const [backhaulExpanded, setBackhaulExpanded] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!tracking) return;
    const id = setInterval(() => {
      setRoute((prev) => {
        const next = Math.min(95, prev.progressPct + 1);
        return { ...prev, progressPct: next };
      });
    }, 4000);
    return () => clearInterval(id);
  }, [tracking]);

  const filteredLoads = useMemo(() => {
    if (filterCategory === "all") return backhaulLoads;
    return backhaulLoads.filter((l) => l.category === filterCategory);
  }, [filterCategory]);

  const visibleLoads = useMemo(
    () => (backhaulExpanded ? filteredLoads : filteredLoads.slice(0, BACKHAUL_INITIAL)),
    [filteredLoads, backhaulExpanded]
  );
  const hasMoreLoads = filteredLoads.length > BACKHAUL_INITIAL;

  const handleRouteSelect = useCallback((r: TransportRoute) => {
    setSelectedRouteId(r.id);
    setRoute((prev) => ({
      ...prev,
      truckId: r.truckId,
      origin: r.origin,
      destination: r.destination,
      eta: `${r.estimatedHours}h`,
      departedAt: r.departedAt,
      arrivesAt: r.arrivesAt,
      progressPct: r.progressPct,
      status: r.status,
      statusLabel: r.statusLabel,
    }));
  }, []);

  const openBid = useCallback((load: BackhaulLoad) => {
    setBidTarget(load);
    setBidAmount(String(load.priceNpr));
  }, []);

  const submitBid = useCallback(() => {
    if (!bidTarget) return;
    setBidding(bidTarget.id);
    setTimeout(() => {
      setBidding(null);
      setBidTarget(null);
      toast.show(
        `Bid of NPR ${formatNpr(Number(bidAmount))} submitted for ${bidTarget.title}`,
        "success"
      );
    }, 700);
  }, [bidTarget, bidAmount, toast]);

  const activeRoutes = allRoutes.filter((r) => r.status === "en-route");
  const completedRoutes = allRoutes.filter((r) => r.status === "delivered");

  return (
    <>
      <header className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background">
            Logistics Overview
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {activeRoutes.length} active routes • {completedRoutes.length} delivered today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTracking((t) => !t)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
              tracking
                ? "bg-secondary-container/30 text-secondary border-secondary/20"
                : "bg-surface-container-low text-on-surface-variant border-outline-variant/30"
            }`}
            aria-pressed={tracking}
          >
            <span
              className={`w-2 h-2 rounded-full ${tracking ? "bg-secondary animate-pulse-soft" : "bg-outline"}`}
            />
            <span className="font-body-sm text-body-sm font-semibold">
              {tracking ? "Fleet Active" : "Tracking Paused"}
            </span>
          </button>
          <Link
            to="/retailer"
            className="text-on-surface-variant hover:text-primary font-body-sm text-body-sm underline-offset-4 hover:underline transition-colors"
          >
            Switch to Retailer →
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Fleet Routes Panel */}
        {showRoutes && (
          <section className="md:col-span-3 glass-panel rounded-xl p-4 flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Fleet Routes
              </h3>
              <button
                onClick={() => setShowRoutes(false)}
                className="p-1 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors md:hidden"
                aria-label="Close routes"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 scrollbar-thin max-h-[500px]">
              {allRoutes.map((r) => (
                <RouteListItem
                  key={r.id}
                  route={r}
                  isActive={selectedRouteId === r.id}
                  onSelect={handleRouteSelect}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active Route Map — compact */}
        <section className={`${showRoutes ? "md:col-span-6" : "md:col-span-8"} glass-panel rounded-xl p-4 relative overflow-hidden flex flex-col animate-fade-in-scale`}>
          <div className="flex justify-between items-center mb-3 z-10">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Truck {route.truckId}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {route.origin} → {route.destination} • ETA {route.eta}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!showRoutes && (
                <button
                  onClick={() => setShowRoutes(true)}
                  className="btn-outline text-[12px] py-1 px-2"
                >
                  <span className="material-symbols-outlined text-[16px] mr-1">list</span>
                  Routes
                </button>
              )}
              <Badge tone="success" icon="local_shipping">
                {route.statusLabel}
              </Badge>
            </div>
          </div>

          {/* Compact map — no huge empty space */}
          <div className="flex-1 min-h-[180px] md:min-h-[220px] bg-gradient-to-b from-[#d4e4c8] to-[#a4d0b8] rounded-lg border border-outline-variant/30 relative overflow-hidden">
            <RouteMap
              progressPct={route.progressPct}
              live={tracking}
              origin={route.origin}
              destination={route.destination}
            />

            <div className="absolute top-3 right-3 glass-inset rounded-full px-2.5 py-0.5 flex items-center gap-1.5 z-10">
              <span
                className={`w-1.5 h-1.5 rounded-full ${tracking ? "bg-secondary animate-pulse-soft" : "bg-outline"}`}
              />
              <span className="font-label-caps text-label-caps text-on-surface text-[10px]">
                {tracking ? "LIVE" : "PAUSED"}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 glass-inset rounded-lg p-3 flex justify-between items-center z-10">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">
                  DEPARTED
                </span>
                <span className="font-body-sm text-body-sm font-semibold">
                  {route.departedAt}
                </span>
              </div>
              <ProgressBar pct={route.progressPct} />
              <div className="flex flex-col text-right">
                <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">
                  ETA
                </span>
                <span className="font-body-sm text-body-sm font-semibold text-secondary">
                  {route.arrivesAt}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 z-10">
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200 text-[12px] font-semibold active:scale-95">
              <span className="material-symbols-outlined text-[16px]">
                support_agent
              </span>
              Driver
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200 text-[12px] font-semibold active:scale-95">
              <span className="material-symbols-outlined text-[16px]">
                report_problem
              </span>
              Issue
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200 text-[12px] font-semibold active:scale-95">
              <span className="material-symbols-outlined text-[16px]">
                open_in_new
              </span>
              Maps
            </button>
          </div>
        </section>

        {/* Backhaul Loads — top 5 + expand */}
        <section className={`${showRoutes ? "md:col-span-3" : "md:col-span-4"} glass-panel rounded-xl p-4 flex flex-col animate-slide-in-right`}>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sync_alt
            </span>
            Backhaul Loads
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
            {filteredLoads.length} available from {route.destination}
          </p>

          <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-thin">
            {(["all", "produce", "fertilizer", "dry"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => { setFilterCategory(cat); setBackhaulExpanded(false); }}
                className={`px-3 py-1 rounded-full text-[12px] font-bold capitalize whitespace-nowrap transition-all duration-200 ${
                  filterCategory === cat
                    ? "bg-secondary text-on-secondary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {visibleLoads.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-sm">
                No loads in this category.
              </div>
            ) : (
              visibleLoads.map((load, i) => (
                <BackhaulCard
                  key={load.id}
                  load={load}
                  onBid={openBid}
                  bidding={bidding === load.id}
                  index={i}
                />
              ))
            )}
          </div>

          {hasMoreLoads && (
            <button
              onClick={() => setBackhaulExpanded((v) => !v)}
              className="mt-3 w-full py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200 font-label-caps text-label-caps text-[12px] flex items-center justify-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">
                {backhaulExpanded ? "expand_less" : "expand_more"}
              </span>
              {backhaulExpanded
                ? "Show Less"
                : `Show More (${filteredLoads.length - BACKHAUL_INITIAL} more)`}
            </button>
          )}
        </section>

        {/* Performance Metrics */}
        <section className="md:col-span-12 glass-panel rounded-xl p-6 animate-stagger stagger-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Performance Metrics (This Month)
            </h3>
            <select
              className="bg-surface-container rounded-lg border-none text-body-sm text-primary focus:ring-secondary cursor-pointer px-3 py-1.5"
              defaultValue="month"
            >
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="quarter">This quarter</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {transportMetrics.map((m, i) => (
              <MetricCard
                key={m.label}
                label={m.label}
                value={m.value}
                unit={m.unit}
                tone={m.tone}
                delay={i * 80}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Bid Modal */}
      <Modal
        open={!!bidTarget}
        onClose={() => setBidTarget(null)}
        title={`Bid: ${bidTarget?.title ?? ""}`}
        size="md"
      >
        {bidTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-surface-container-low">
                <div className="font-label-caps text-label-caps text-on-surface-variant mb-1">
                  Asking
                </div>
                <div className="font-headline-md text-headline-md text-on-surface">
                  NPR {formatNpr(bidTarget.priceNpr)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low">
                <div className="font-label-caps text-label-caps text-on-surface-variant mb-1">
                  Volume
                </div>
                <div className="font-headline-md text-headline-md text-on-surface">
                  {bidTarget.weightTons} Tons
                </div>
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
                Your bid (NPR)
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="input-field"
              />
              <p className="text-[12px] text-on-surface-variant mt-2">
                Route: {bidTarget.origin} → {bidTarget.destination}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBidTarget(null)}
                className="btn-outline flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={submitBid}
                disabled={bidding !== null || !bidAmount}
                className="btn-primary flex-1 py-2.5 disabled:opacity-50"
              >
                {bidding ? "Submitting..." : "Submit Bid"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {toast.message && <Toast message={toast.message} tone={toast.tone} />}
    </>
  );
}
