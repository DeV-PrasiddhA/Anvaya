import type { NavItem } from "@/types";

export const PRIMARY_NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "#" },
  { key: "marketplace", label: "Marketplace", icon: "storefront", href: "#" },
  { key: "intelligence", label: "Intelligence", icon: "monitoring", href: "#" },
  { key: "logistics", label: "Logistics", icon: "local_shipping", href: "#" },
  { key: "community", label: "Community", icon: "groups", href: "#" },
];

export const SECONDARY_NAV: NavItem[] = [
  { key: "settings", label: "Settings", icon: "settings", href: "#" },
  { key: "support", label: "Support", icon: "help", href: "#" },
];

export const BOTTOM_NAV = [
  { key: "home", label: "Home", icon: "home", href: "/retailer" },
  { key: "market", label: "Market", icon: "shopping_bag", href: "#" },
  { key: "ai", label: "AI Advisor", icon: "smart_toy", href: "#" },
  { key: "logistics", label: "Logistics", icon: "package_2", href: "/transport" },
] as const;
