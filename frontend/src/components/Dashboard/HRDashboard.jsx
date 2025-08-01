import { useState } from 'react';
import { Home, User, Calendar, Wallet, ClipboardList, FileText } from 'lucide-react';
import { Toaster } from 'sonner';
import adminimg from "../../assets/admin.png";
import OnboardingAndExit from '../EmployeeManagement/OnboardingAndExit';
import SalaryPayroll from '../Salary/SalaryPayroll';
import SalarySetup from '../Salary/SalarySetup';
import ManagerLeaveApprovalPage from '../LeaveManagement/ManagerLeaveApprovalPage';
import AdminReviewDashboard from '../PerfomanceReview/AdminReviewDashboard';
import EmployeeProfile from '../Employee/EmployeeProfile';
import Sidebar from './Sidebar'; // Assuming Sidebar.jsx is in the same directory
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { name: 'Profile', icon: <User size={18} />, key: 'profile' },
  { name: 'Onboarding / Exit', icon: <ClipboardList size={18} />, key: 'onboarding' },
  { name: 'Salary Setup', icon: <Wallet size={18} />, key: 'salary' },
  { name: 'Payslips', icon: <FileText size={18} />, key: 'payslips' },
  { name: 'Performance Reviews', icon: <ClipboardList size={18} />, key: 'performance' },
  { name: 'Manage Leave Requests', icon: <Calendar size={18} />, key: 'leaves' },
];

const renderContent = (key, onNavigate) => {
  switch (key) {
    case 'profile':
      return <EmployeeProfile />;
    case 'leaves':
      return <ManagerLeaveApprovalPage />;
    case 'salary':
      return <SalarySetup />;
    case 'payroll':
      return <SalaryPayroll />;
    case 'performance':
      return <AdminReviewDashboard />;
    case 'onboarding':
      return <OnboardingAndExit onNavigate={onNavigate} />;
    default:
      return null;
  }
};

export default function HRDashboard() {
  const navigate = useNavigate();
  useEffect(()=>{
    const userData = JSON.parse(localStorage.getItem("userData"))
    if(userData == null)
    {
        navigate("../login");
    }
  }, [])
  const [activeKey, setActiveKey] = useState('profile');
  const name = JSON.parse(localStorage.getItem("userData"))?.firstName + " " + JSON.parse(localStorage.getItem("userData"))?.lastName;
  const handleMenuClick = (key) => {
    setActiveKey(key);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        menuItems={menuItems}
        activeKey={activeKey}
        onMenuClick={handleMenuClick}
        userType="HR"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold capitalize">{activeKey.replace('-', ' ')}</h1>
          <div className="text-lg font-bold flex gap-3 text-gray-600"><img src={adminimg} className='w-8 h-8' />{name}</div>
        </header>
        <section className="p-4 h-[680px]">{renderContent(activeKey, handleMenuClick)}</section>
      </main>
    </div>
  );
}