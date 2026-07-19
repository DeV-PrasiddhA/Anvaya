// Shared types for the Anvaya dashboards

export type NavKey =
  | "dashboard"
  | "marketplace"
  | "intelligence"
  | "logistics"
  | "community"
  | "settings"
  | "support";

export interface NavItem {
  key: NavKey;
  label: string;
  icon: string;
  href: string;
}

// ---------- Transportation Dashboard ----------

export type RouteStatus = "en-route" | "loading" | "delivered" | "delayed";

export interface ActiveRoute {
  truckId: string;
  origin: string;
  destination: string;
  eta: string;
  departedAt: string;
  arrivesAt: string;
  progressPct: number;
  status: RouteStatus;
  statusLabel: string;
  mapImageUrl: string;
  mapAlt: string;
}

export type BackhaulCategory = "produce" | "dry" | "fertilizer" | "livestock";

export interface BackhaulLoad {
  id: string;
  title: string;
  priceNpr: number;
  weightTons: number;
  requirement: "temp" | "dry" | "fragile" | "none";
  requirementLabel: string;
  origin: string;
  destination: string;
  category: BackhaulCategory;
  expiresInHours: number;
}

export interface TransportMetric {
  label: string;
  value: string;
  unit?: string;
  tone?: "default" | "positive" | "warning";
  helper?: string;
}

export interface TransportRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedHours: number;
  truckId: string;
  status: RouteStatus;
  statusLabel: string;
  progressPct: number;
  departedAt: string;
  arrivesAt: string;
}

// ---------- Retailer Dashboard ----------

export type OrderStatus = "in-transit" | "processing" | "delivered" | "cancelled";

export interface BulkOrder {
  id: string;
  supplier: string;
  supplierInitials: string;
  commodity: string;
  volumeKg: number;
  status: OrderStatus;
  orderDate: string;
  totalNpr: number;
  destination: string;
}

export interface RetailerStat {
  label: string;
  value: string;
  helper: string;
  helperTone: "positive" | "negative" | "warning" | "info";
  icon: string;
  trend?: "up" | "down" | "flat";
}

export interface TopSupplier {
  id: string;
  name: string;
  initials: string;
  location: string;
  commodity: string;
  rating: number;
  completedOrders: number;
}

export type Commodity =
  | "rice-premium"
  | "wheat"
  | "maize"
  | "tomato"
  | "potato"
  | "onion"
  | "lentils-masoor"
  | "soybean"
  | "mustard-seed"
  | "ginger"
  | "garlic"
  | "cauliflower"
  | "apple"
  | "cardamom"
  | "tea";

export interface PriceBar {
  day: string;
  value: number;
  isHighlight?: boolean;
}

export interface CommodityPrice {
  commodity: Commodity;
  label: string;
  currentNpr: number;
  changePct: number;
  unit: string;
  bars: PriceBar[];
}
