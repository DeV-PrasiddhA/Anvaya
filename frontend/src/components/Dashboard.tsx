import type { UserProfile } from './SignUp';
import FarmerDashboard from './FarmerDashboard';
import RetailerDashboard from './RetailerDashboard';
import CooperativeDashboard from './CooperativeDashboard';
import TransportDashboard from './TransportDashboard';

interface DashboardProps {
  farmerName?: string;
  userProfile?: UserProfile;
  onNavigateBack: () => void;
}

export default function Dashboard({ farmerName = 'Farmer', userProfile, onNavigateBack }: DashboardProps) {
  const role = userProfile?.role || 'Farmer';

  switch (role) {
    case 'Retailer':
      return <RetailerDashboard userProfile={userProfile} onNavigateBack={onNavigateBack} />;
    case 'Cooperative':
      return <CooperativeDashboard userProfile={userProfile} onNavigateBack={onNavigateBack} />;
    case 'Transport Provider':
      return <TransportDashboard userProfile={userProfile} onNavigateBack={onNavigateBack} />;
    case 'Farmer':
    default:
      return <FarmerDashboard farmerName={farmerName} userProfile={userProfile} onNavigateBack={onNavigateBack} />;
  }
}
