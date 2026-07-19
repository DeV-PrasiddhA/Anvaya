import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function AppShell() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar />
      <TopBar />
      <main
        key={location.pathname}
        className="md:ml-64 pt-20 pb-28 md:pt-10 md:pb-10 px-margin-mobile md:px-margin-desktop max-w-[1600px] mx-auto min-h-screen"
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
