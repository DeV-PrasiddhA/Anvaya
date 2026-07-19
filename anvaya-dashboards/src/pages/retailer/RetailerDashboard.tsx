import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  bulkOrders as initialOrders,
  commodityPrices,
  retailerStats,
  topSuppliers,
} from "@/data/retailer";
import type { BulkOrder, Commodity, OrderStatus } from "@/types";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import Badge from "@/components/ui/Badge";

const ORDERS_INITIAL = 5;

const STATUS_META: Record<
  OrderStatus,
  { label: string; tone: "success" | "warning" | "info" | "error"; icon: string }
> = {
  "in-transit": { label: "In Transit", tone: "success", icon: "local_shipping" },
  processing: { label: "Processing", tone: "warning", icon: "inventory_2" },
  delivered: { label: "Delivered", tone: "info", icon: "check_circle" },
  cancelled: { label: "Cancelled", tone: "error", icon: "cancel" },
};

const HELPER_TONE: Record<
  "positive" | "negative" | "warning" | "info",
  { icon: string; className: string }
> = {
  positive: { icon: "trending_up", className: "text-secondary" },
  negative: { icon: "trending_down", className: "text-error" },
  warning: { icon: "warning", className: "text-error" },
  info: { icon: "check_circle", className: "text-secondary" },
};

const AVAILABLE_COMMODITIES = commodityPrices.map((c) => ({
  label: c.label,
  price: c.currentNpr,
  unit: c.unit,
  changePct: c.changePct,
}));

function StatCard({
  label,
  value,
  helper,
  helperTone,
  icon,
  valueTone,
  delay,
}: {
  label: string;
  value: string;
  helper: string;
  helperTone: "positive" | "negative" | "warning" | "info";
  icon: string;
  valueTone?: "default" | "error";
  delay?: number;
}) {
  const tone = HELPER_TONE[helperTone];
  return (
    <div
      className="glass-card rounded-xl p-4 shadow-glass hover:shadow-glass-lg transition-shadow cursor-default animate-stagger"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="text-outline-variant flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        <span className="font-label-caps text-label-caps">{label}</span>
      </div>
      <div
        className={`font-headline-md text-headline-md ${
          valueTone === "error" ? "text-error" : "text-primary"
        }`}
      >
        {value}
      </div>
      <div className={`text-[12px] mt-1 flex items-center ${tone.className}`}>
        <span
          className="material-symbols-outlined text-[14px] mr-1"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {tone.icon}
        </span>
        {helper}
      </div>
    </div>
  );
}

function PriceChart({
  bars,
  highlightDay,
}: {
  bars: { day: string; value: number; isHighlight?: boolean }[];
  highlightDay: string;
}) {
  return (
    <div className="h-64 w-full bg-surface-container-lowest rounded-lg border border-surface-variant flex items-end px-4 pt-8 pb-4 gap-2 relative overflow-hidden">
      <div className="absolute inset-0 flex flex-col justify-between py-4 px-4 pointer-events-none opacity-20">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-outline-variant w-full" />
        ))}
      </div>
      {bars.map((b, i) => {
        const isActive = b.day === highlightDay;
        return (
          <div
            key={b.day}
            className={`w-full rounded-t-sm transition-all duration-700 ease-out hover:opacity-80 animate-stagger ${
              isActive ? "bg-secondary shadow-glow-green" : "bg-secondary-fixed"
            }`}
            style={{
              height: `${b.value}%`,
              animationDelay: `${i * 80}ms`,
              boxShadow: isActive ? "0 0 15px rgba(0,109,62,0.3)" : undefined,
            }}
            title={`${b.day}: ${b.value}%`}
          />
        );
      })}
    </div>
  );
}

interface EditOrderForm {
  id: string;
  commodity: string;
  volumeKg: number;
  supplier: string;
  destination: string;
}

function CommodityLookup({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AVAILABLE_COMMODITIES;
    return AVAILABLE_COMMODITIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.price.toString().includes(q)
    );
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? "Search available goods..."}
          className="input-field pl-10"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); onChange(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant/40 rounded-lg shadow-glass-xl z-50 max-h-56 overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-on-surface-variant text-sm">
              No goods found
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  onChange(c.label);
                  setQuery(c.label);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors flex items-center justify-between border-b border-outline-variant/10 last:border-0 ${
                  value === c.label ? "bg-secondary-container/10" : ""
                }`}
              >
                <div>
                  <div className="font-semibold text-sm text-on-surface">
                    {c.label}
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    NPR {c.price} {c.unit}
                    <span
                      className={`ml-2 ${
                        c.changePct >= 0 ? "text-secondary" : "text-error"
                      }`}
                    >
                      {c.changePct >= 0 ? "+" : ""}
                      {c.changePct}%
                    </span>
                  </div>
                </div>
                {value === c.label && (
                  <span
                    className="material-symbols-outlined text-secondary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SupplierLookup({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topSuppliers;
    return topSuppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.commodity.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search suppliers..."
          className="input-field pl-10"
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant/40 rounded-lg shadow-glass-xl z-50 max-h-56 overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-on-surface-variant text-sm">
              No suppliers found
            </div>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onChange(s.name);
                  setQuery(s.name);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors flex items-center justify-between border-b border-outline-variant/10 last:border-0 ${
                  value === s.name ? "bg-secondary-container/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary text-[11px] font-bold">
                    {s.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-on-surface">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      {s.location} • {s.commodity} • ★ {s.rating}
                    </div>
                  </div>
                </div>
                {value === s.name && (
                  <span
                    className="material-symbols-outlined text-secondary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ActionDropdown({
  order,
  onEdit,
  onCancel,
  onDelete,
}: {
  order: BulkOrder;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-all active:scale-90"
        aria-label={`Actions for order ${order.id}`}
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-surface-container-lowest border border-outline-variant/40 rounded-lg shadow-glass-xl z-50 py-1 animate-slide-down">
          {!isCancelled && !isDelivered && (
            <>
              <button
                onClick={() => { onEdit(); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors flex items-center gap-2 text-sm text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  edit
                </span>
                Edit Order
              </button>
              <button
                onClick={() => { onCancel(); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors flex items-center gap-2 text-sm text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px] text-primary-container">
                  block
                </span>
                Cancel Order
              </button>
              <div className="border-t border-outline-variant/20 my-1" />
            </>
          )}
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 hover:bg-error-container/20 transition-colors flex items-center gap-2 text-sm text-error"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete Order
          </button>
        </div>
      )}
    </div>
  );
}

export default function RetailerDashboard() {
  const [orders, setOrders] = useState<BulkOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selectedCommodity, setSelectedCommodity] =
    useState<Commodity>("rice-premium");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [orderCommodity, setOrderCommodity] = useState("");
  const [orderVolume, setOrderVolume] = useState("500");
  const [orderSupplier, setOrderSupplier] = useState("");
  const [orderDestination, setOrderDestination] = useState("Kathmandu");
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const toast = useToast();

  const [editTarget, setEditTarget] = useState<EditOrderForm | null>(null);
  const [editCommodity, setEditCommodity] = useState("");
  const [editVolume, setEditVolume] = useState("");
  const [editSupplier, setEditSupplier] = useState("");
  const [editDestination, setEditDestination] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<BulkOrder | null>(null);

  const activeCommodity = useMemo(
    () =>
      commodityPrices.find((c) => c.commodity === selectedCommodity) ??
      commodityPrices[0],
    [selectedCommodity]
  );

  const highlightDay =
    activeCommodity.bars.find((b) => b.isHighlight)?.day ??
    activeCommodity.bars[0]?.day ??
    "Mon";

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesQ =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.supplier.toLowerCase().includes(q) ||
        o.commodity.toLowerCase().includes(q) ||
        o.destination.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const visibleOrders = useMemo(
    () => (ordersExpanded ? filteredOrders : filteredOrders.slice(0, ORDERS_INITIAL)),
    [filteredOrders, ordersExpanded]
  );
  const hasMoreOrders = filteredOrders.length > ORDERS_INITIAL;

  const totalFilteredNpr = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.totalNpr, 0),
    [filteredOrders]
  );

  const destinations = [
    "Kathmandu", "Pokhara", "Chitwan", "Bharatpur", "Biratnagar",
    "Nepalgunj", "Butwal", "Dharan", "Janakpur", "Lalitpur", "Bhaktapur",
  ];

  const selectedCommodityPrice = useMemo(() => {
    const found = AVAILABLE_COMMODITIES.find((c) => c.label === orderCommodity);
    return found ? found.price : 175;
  }, [orderCommodity]);

  const createOrder = useCallback(() => {
    if (!orderCommodity || !orderSupplier) {
      toast.show("Please select a commodity and supplier", "error");
      return;
    }
    const next: BulkOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: orderSupplier,
      supplierInitials: orderSupplier
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      commodity: orderCommodity,
      volumeKg: Number(orderVolume) || 0,
      status: "processing",
      orderDate: new Date().toISOString().slice(0, 10),
      totalNpr: (Number(orderVolume) || 0) * selectedCommodityPrice,
      destination: orderDestination,
    };
    setOrders((prev) => [next, ...prev]);
    setShowNewOrder(false);
    setOrderCommodity("");
    setOrderVolume("500");
    setOrderSupplier("");
    setOrderDestination("Kathmandu");
    toast.show(`Order ${next.id} created — processing`, "success");
  }, [orderSupplier, orderCommodity, orderVolume, orderDestination, selectedCommodityPrice, toast]);

  const openEdit = useCallback((order: BulkOrder) => {
    setEditTarget({
      id: order.id,
      commodity: order.commodity,
      volumeKg: order.volumeKg,
      supplier: order.supplier,
      destination: order.destination,
    });
    setEditCommodity(order.commodity);
    setEditVolume(String(order.volumeKg));
    setEditSupplier(order.supplier);
    setEditDestination(order.destination);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editTarget) return;
    const price = AVAILABLE_COMMODITIES.find((c) => c.label === editCommodity)?.price ?? 175;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === editTarget.id
          ? {
              ...o,
              commodity: editCommodity,
              volumeKg: Number(editVolume) || 0,
              supplier: editSupplier,
              supplierInitials: editSupplier
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              destination: editDestination,
              totalNpr: (Number(editVolume) || 0) * price,
            }
          : o
      )
    );
    setEditTarget(null);
    toast.show(`Order ${editTarget.id} updated successfully`, "success");
  }, [editTarget, editCommodity, editVolume, editSupplier, editDestination, toast]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    const deleted = deleteTarget;
    setDeleteTarget(null);
    toast.show(`Order ${deleted.id} has been deleted`, "warning");
  }, [deleteTarget, toast]);

  const cancelOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "cancelled" as const } : o
        )
      );
      toast.show(`Order ${orderId} has been cancelled`, "warning");
    },
    [toast]
  );

  return (
    <>
      <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4 animate-fade-in">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary">
            Retailer Overview
          </h2>
          <p className="text-on-surface-variant mt-2">
            Welcome back. Here's your supply chain at a glance.
          </p>
        </div>
        <div className="flex gap-sm">
          <div className="relative glass-card rounded-full px-4 py-2 flex items-center shadow-sm">
            <span className="material-symbols-outlined text-outline mr-2">
              search
            </span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOrdersExpanded(false); }}
              className="bg-transparent border-none outline-none text-body-sm focus:ring-0 w-32 md:w-48 placeholder-outline-variant"
              placeholder="Search orders..."
              type="text"
              aria-label="Search orders"
            />
          </div>
          <button
            onClick={() => setShowNewOrder(true)}
            className="btn-primary flex items-center gap-sm shadow-sm hover:shadow-md"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add
            </span>
            New Order
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Quick Stats */}
        <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {retailerStats.map((s, i) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              helper={s.helper}
              helperTone={s.helperTone}
              icon={s.icon}
              valueTone={i === 1 ? "error" : "default"}
              delay={i * 80}
            />
          ))}
        </div>

        {/* Market Trends Chart */}
        <div className="md:col-span-8 glass-card rounded-xl p-6 shadow-glass-lg animate-stagger stagger-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">
                Wholesale Price Intelligence
              </h3>
              <p className="text-[12px] text-on-surface-variant mt-1">
                {activeCommodity.label} • NPR {activeCommodity.currentNpr}{" "}
                {activeCommodity.unit} •{" "}
                <span
                  className={
                    activeCommodity.changePct >= 0
                      ? "text-secondary"
                      : "text-error"
                  }
                >
                  {activeCommodity.changePct >= 0 ? "+" : ""}
                  {activeCommodity.changePct}%
                </span>
              </p>
            </div>
            <select
              value={selectedCommodity}
              onChange={(e) =>
                setSelectedCommodity(e.target.value as Commodity)
              }
              className="bg-surface-container rounded-lg border-none text-body-sm focus:ring-secondary text-primary cursor-pointer px-3 py-1.5"
            >
              {commodityPrices.map((c) => (
                <option key={c.commodity} value={c.commodity}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <PriceChart bars={activeCommodity.bars} highlightDay={highlightDay} />
          <div className="flex justify-between text-label-caps font-label-caps text-outline mt-2 px-2">
            {activeCommodity.bars.map((b) => (
              <span key={b.day}>{b.day}</span>
            ))}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 shadow-glass-lg animate-stagger stagger-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-primary">
              Top Rated Farmers
            </h3>
          </div>
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {topSuppliers.slice(0, 5).map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container transition-all duration-200 cursor-pointer border border-transparent hover:border-secondary/30 group animate-stagger"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold text-sm group-hover:bg-secondary-container/30 transition-colors">
                    {s.initials}
                  </div>
                  <div>
                    <div className="font-bold text-primary text-sm">
                      {s.name}
                    </div>
                    <div className="text-[12px] text-outline">
                      {s.location} • {s.commodity}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-secondary">
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-bold text-[14px]">
                    {s.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Orders — top 5 + expand */}
        <div className="md:col-span-12 glass-card rounded-xl p-6 shadow-glass-lg overflow-hidden animate-stagger stagger-7">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">
                Recent Bulk Orders
              </h3>
              <p className="text-[12px] text-on-surface-variant mt-1">
                {filteredOrders.length} orders • Total NPR{" "}
                {new Intl.NumberFormat("en-IN").format(totalFilteredNpr)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "in-transit", label: "In Transit" },
                  { key: "processing", label: "Processing" },
                  { key: "delivered", label: "Delivered" },
                  { key: "cancelled", label: "Cancelled" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setStatusFilter(opt.key); setOrdersExpanded(false); }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200 ${
                    statusFilter === opt.key
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="text-outline-variant font-label-caps text-label-caps border-b border-surface-variant">
                  <th className="pb-3 pl-2">Order ID</th>
                  <th className="pb-3">Supplier</th>
                  <th className="pb-3">Commodity</th>
                  <th className="pb-3">Volume</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface">
                {visibleOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[36px] block mx-auto mb-2 text-outline-variant">
                        inbox
                      </span>
                      No orders match your filters.
                    </td>
                  </tr>
                ) : (
                  visibleOrders.map((o, i) => {
                    const meta = STATUS_META[o.status];
                    const isCancelled = o.status === "cancelled";
                    return (
                      <tr
                        key={o.id}
                        className={`border-b border-surface-variant/50 hover:bg-surface-container-low transition-all duration-200 group animate-stagger ${isCancelled ? "opacity-60" : ""}`}
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <td className="py-4 pl-2 font-bold text-primary">
                          #{o.id}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-surface-variant flex items-center justify-center text-primary text-[11px] font-bold group-hover:bg-secondary-container/30 transition-colors">
                              {o.supplierInitials}
                            </div>
                            {o.supplier}
                          </div>
                        </td>
                        <td className="py-4">{o.commodity}</td>
                        <td className="py-4 font-semibold">{o.volumeKg} kg</td>
                        <td className="py-4 text-on-surface-variant">{o.destination}</td>
                        <td className="py-4">
                          <Badge tone={meta.tone} icon={meta.icon}>
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <ActionDropdown
                            order={o}
                            onEdit={() => openEdit(o)}
                            onCancel={() => cancelOrder(o.id)}
                            onDelete={() => setDeleteTarget(o)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {hasMoreOrders && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setOrdersExpanded((v) => !v)}
                className="py-2 px-6 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all duration-200 font-label-caps text-label-caps text-[12px] flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {ordersExpanded ? "expand_less" : "expand_more"}
                </span>
                {ordersExpanded
                  ? "Show Less"
                  : `Show More (${filteredOrders.length - ORDERS_INITIAL} more orders)`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Order Modal — with commodity lookup */}
      <Modal
        open={showNewOrder}
        onClose={() => setShowNewOrder(false)}
        title="Create Bulk Order"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Supplier
            </label>
            <SupplierLookup value={orderSupplier} onChange={setOrderSupplier} />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Commodity
            </label>
            <CommodityLookup
              value={orderCommodity}
              onChange={setOrderCommodity}
              placeholder="Search available goods..."
            />
            {orderCommodity && (
              <p className="text-[12px] text-on-surface-variant mt-2">
                Market price: NPR {selectedCommodityPrice} per kg
                {AVAILABLE_COMMODITIES.find((c) => c.label === orderCommodity) && (
                  <span
                    className={`ml-2 ${
                      (AVAILABLE_COMMODITIES.find((c) => c.label === orderCommodity)?.changePct ?? 0) >= 0
                        ? "text-secondary"
                        : "text-error"
                    }`}
                  >
                    {((AVAILABLE_COMMODITIES.find((c) => c.label === orderCommodity)?.changePct ?? 0) >= 0) ? "+" : ""}
                    {AVAILABLE_COMMODITIES.find((c) => c.label === orderCommodity)?.changePct}%
                  </span>
                )}
              </p>
            )}
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Volume (kg)
            </label>
            <input
              type="number"
              value={orderVolume}
              onChange={(e) => setOrderVolume(e.target.value)}
              min={1}
              className="input-field"
            />
            {orderCommodity && (
              <p className="text-[12px] text-on-surface-variant mt-2">
                Estimated total: NPR{" "}
                {new Intl.NumberFormat("en-IN").format(
                  (Number(orderVolume) || 0) * selectedCommodityPrice
                )}
              </p>
            )}
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Destination
            </label>
            <select
              value={orderDestination}
              onChange={(e) => setOrderDestination(e.target.value)}
              className="input-field"
            >
              {destinations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowNewOrder(false)}
              className="btn-outline flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={createOrder}
              disabled={!orderCommodity || !orderSupplier}
              className="btn-primary flex-1 py-2.5 disabled:opacity-40"
            >
              Create Order
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Order Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit Order ${editTarget?.id ?? ""}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Supplier
            </label>
            <SupplierLookup value={editSupplier} onChange={setEditSupplier} />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Commodity
            </label>
            <CommodityLookup
              value={editCommodity}
              onChange={setEditCommodity}
              placeholder="Search available goods..."
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Volume (kg)
            </label>
            <input
              type="number"
              value={editVolume}
              onChange={(e) => setEditVolume(e.target.value)}
              min={1}
              className="input-field"
            />
            <p className="text-[12px] text-on-surface-variant mt-2">
              Updated total: NPR{" "}
              {new Intl.NumberFormat("en-IN").format(
                (Number(editVolume) || 0) *
                  (AVAILABLE_COMMODITIES.find((c) => c.label === editCommodity)?.price ?? 175)
              )}
            </p>
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">
              Destination
            </label>
            <select
              value={editDestination}
              onChange={(e) => setEditDestination(e.target.value)}
              className="input-field"
            >
              {destinations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setEditTarget(null)}
              className="btn-outline flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="btn-primary flex-1 py-2.5"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Order"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-error-container/20 border border-error/20">
              <span className="material-symbols-outlined text-error text-[24px] mt-0.5">
                warning
              </span>
              <div>
                <p className="font-semibold text-on-surface text-sm">
                  Are you sure you want to delete order #{deleteTarget.id}?
                </p>
                <p className="text-[12px] text-on-surface-variant mt-1">
                  {deleteTarget.commodity} • {deleteTarget.volumeKg} kg from{" "}
                  {deleteTarget.supplier}. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-outline flex-1 py-2.5"
              >
                Keep Order
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg bg-error text-on-error hover:bg-error/90 font-label-caps text-label-caps active:scale-95 transition-all duration-200"
              >
                Delete Order
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="mt-6 text-center text-[12px] text-on-surface-variant animate-fade-in">
        <Link
          to="/transport"
          className="hover:text-primary underline-offset-4 hover:underline transition-colors"
        >
          ← Switch to Transportation Dashboard
        </Link>
      </div>

      {toast.message && <Toast message={toast.message} tone={toast.tone} />}
    </>
  );
}
