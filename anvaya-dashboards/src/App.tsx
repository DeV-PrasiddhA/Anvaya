import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import TransportDashboard from "./pages/transport/TransportDashboard";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/transport" replace />} />
        <Route path="/transport" element={<TransportDashboard />} />
        <Route path="/retailer" element={<RetailerDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
