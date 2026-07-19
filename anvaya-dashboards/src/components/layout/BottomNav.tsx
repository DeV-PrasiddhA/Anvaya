import { NavLink } from "react-router-dom";
import { BOTTOM_NAV } from "@/data/nav";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full md:hidden rounded-t-xl z-50 pb-safe bg-surface/80 backdrop-blur-xl border-t border-white/10 shadow-top-nav flex justify-around items-center h-20 px-4">
      {BOTTOM_NAV.map((item) => {
        const isDisabled = item.href === "#";
        const baseClass =
          "flex flex-col items-center justify-center active:bg-surface-container-highest scale-110 transition-all duration-200 rounded-full px-4 py-1";
        if (isDisabled) {
          return (
            <a
              key={item.key}
              href="#"
              onClick={(e) => e.preventDefault()}
              className={`${baseClass} text-on-surface-variant opacity-60`}
              aria-disabled
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-caps text-label-caps mt-1 text-[10px]">
                {item.label}
              </span>
            </a>
          );
        }
        return (
          <NavLink
            key={item.key}
            to={item.href}
            className={({ isActive }) =>
              `${baseClass} ${
                isActive
                  ? "text-secondary font-bold bg-secondary-container/20"
                  : "text-on-surface-variant"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className="font-label-caps text-label-caps mt-1 text-[10px]">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
