import { NavLink, useLocation } from "react-router-dom";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/data/nav";
import type { NavItem } from "@/types";

function renderLink(item: NavItem, isActive: boolean) {
  const isDisabled = item.href === "#";
  const className = `nav-link ${isActive ? "nav-link-active" : "nav-link-inactive"}`;

  if (isDisabled) {
    return (
      <a
        key={item.key}
        className={`${className} opacity-60 cursor-not-allowed`}
        onClick={(e) => e.preventDefault()}
        href="#"
        aria-disabled
      >
        <span
          className="material-symbols-outlined"
          style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {item.icon}
        </span>
        {item.label}
      </a>
    );
  }
  return (
    <NavLink
      key={item.key}
      to={item.href}
      className={({ isActive: navActive }) =>
        `${className} ${navActive ? "nav-link-active" : "nav-link-inactive"}`
      }
    >
      <span
        className="material-symbols-outlined"
        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {item.icon}
      </span>
      {item.label}
    </NavLink>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const activeKey =
    location.pathname.startsWith("/retailer")
      ? "dashboard"
      : location.pathname.startsWith("/transport")
        ? "dashboard"
        : "dashboard";

  return (
    <nav className="fixed left-0 top-0 h-full w-64 hidden md:flex flex-col bg-primary border-r border-white/5 shadow-xl py-6 gap-sm z-50">
      <div className="px-lg pb-6 border-b border-white/10 mb-2">
        <h1 className="font-headline-md text-headline-md text-secondary-fixed tracking-tight">
          Anvaya
        </h1>
        <p className="font-body-sm text-body-sm text-on-primary/70 mt-1">
          Agricultural Marketplace
        </p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1 scrollbar-thin">
        {PRIMARY_NAV.map((item) => renderLink(item, item.key === activeKey))}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-1">
        {SECONDARY_NAV.map((item) => renderLink(item, false))}
        <div className="mx-4 mt-4">
          <button className="w-full bg-secondary-fixed text-on-secondary-fixed rounded-lg py-2 font-body-sm text-body-sm hover:bg-secondary-fixed/90 transition-all duration-200 active:scale-95">
            Upgrade Plan
          </button>
        </div>
      </div>
    </nav>
  );
}
