import { useState } from 'react';
import { Home, Users, Calendar, Wallet, ClipboardList, FileText, Settings } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import adminimg from "../../assets/admin.png";
import ManageEmployee from '../EmployeeManagement/ManageEmployee';
import OnboardingAndExit from '../EmployeeManagement/OnboardingAndExit';
import SalaryPayroll from '../Salary/SalaryPayroll';
import SalarySetup from '../Salary/SalarySetup';
import ManagerLeaveApprovalPage from '../LeaveManagement/ManagerLeaveApprovalPage';

const menuItems = [
  { name: 'Dashboard', icon: <Home size={18} />, key: 'dashboard' },
  { name: 'Onboarding / Exit', icon: <ClipboardList size={18} />, key: 'onboarding' },
  { name: 'Salary Setup', icon: <Wallet size={18} />, key: 'salary' },
  { name: 'Performance Reviews', icon: <ClipboardList size={18} />, key: 'performance' },
  { name: 'Manage Leave Requests', icon: <Calendar size={18} />, key: 'leaves' },
];
    const name = JSON.parse(localStorage.getItem("userData"))?.firstName+" "+JSON.parse(localStorage.getItem("userData"))?.lastName;
    const pic  = JSON.parse(localStorage.getItem("userData")).profilePic;
const renderContent = (key, onNavigate) => {
  switch (key) {
    case 'dashboard':
      return <div className="p-4">Welcome to Admin Dashboard 👋</div>;
    case 'employees':
      return <ManageEmployee/>;
    case 'leaves':
      return <ManagerLeaveApprovalPage/>;
    case 'salary':
      return <SalarySetup/>;
    case 'payroll':
      return <SalaryPayroll/>;
    case 'performance':
      return <div className="p-4">Performance Reviews</div>;
    case 'onboarding':
      return <OnboardingAndExit onNavigate = {onNavigate}/>;
    default:
      return null;
  }
};
export default function ManagerDashboard() {
  const [activeKey, setActiveKey] = useState('dashboard');

  const handleMenuClick = (key) => {
    setActiveKey(key);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster richColors position="top-right" />

      
      <aside className="w-64 bg-white shadow-md">
        <div className="p-5 font-bold text-center text-xl">EMS Portal</div>
        <nav className="p-2 mt-2 space-y-5">
          {menuItems.map(({ name, icon, key }) => (
            <button
              key={key}
              onClick={() => handleMenuClick(key)}
              className={`flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-green-100 transition ${activeKey === key ? 'bg-green-200 font-semibold' : ''}`}
            >
              {icon}
              {name}
            </button>
          ))}
        </nav>
        <button className='w-42 px-4 py-2 rounded-lg text-white font-bold cursor-pointer mx-8 absolute bottom-10 bg-red-500 items-center'>Logout</button>
      </aside>

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
