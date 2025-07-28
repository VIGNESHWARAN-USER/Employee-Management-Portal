import { useState } from 'react';
import { Home, User, FileText, CalendarCheck2, LogOut, ClipboardList } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import empimg from "../../assets/admin.png";
import EmployeeProfile from '../Employee/EmployeeProfile';
import PayslipsPage from '../Employee/PayslipsPage';
import LeaveManagementPage from '../LeaveManagement/LeaveManagementPage';
import { useNavigate } from 'react-router-dom';
import PerformanceReviewPage from '../PerfomanceReview/PerformanceReviewPage';

const employeeMenu = [
  { name: 'Dashboard', icon: <Home size={18} />, key: 'dashboard' },
  { name: 'Profile', icon: <User size={18} />, key: 'profile' },
  { name: 'Payslips', icon: <FileText size={18} />, key: 'payslips' },
  { name: 'Leaves', icon: <CalendarCheck2 size={18} />, key: 'leaves' },
  { name: 'Performance Reviews', icon: <ClipboardList size={18} />, key: 'performance' },
];

const renderEmpContent = (key) => {
  switch (key) {
    case 'dashboard':
      return <div className="p-4">Welcome to Your Dashboard ✨</div>;
    case 'profile':
      return <EmployeeProfile/>;
    case 'payslips':
      return <PayslipsPage/>;
    case 'leaves':
      return <LeaveManagementPage/>;
    case 'performance':
      return <PerformanceReviewPage/>;
    default:
      return null;
  }
};

export default function EmployeeDashboard() {
  const [activeKey, setActiveKey] = useState('dashboard');
  const navigate = useNavigate();
  const name = JSON.parse(localStorage.getItem("userData"))?.firstName+" "+JSON.parse(localStorage.getItem("userData"))?.lastName;
  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className="w-60 bg-white shadow-md">
        <div className="p-5 font-bold text-center text-lg">EMS Employee</div>
        <nav className="p-3 space-y-4">
          {employeeMenu.map(({ name, icon, key }) => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={`flex items-center gap-2 w-full p-2 text-left rounded-lg hover:bg-green-100 transition ${
                activeKey === key ? 'bg-green-200 font-semibold' : ''
              }`}
            >
              {icon}
              {name}
            </button>
          ))}
        </nav>

        <button
          className="w-42 px-4 py-2 rounded-lg text-white font-bold cursor-pointer mx-8 absolute bottom-10 bg-red-500"
          onClick={() => {navigate("../login");toast.success("Logged out")}}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold capitalize">{activeKey}</h1>
          <div className="flex items-center gap-3 text-gray-700">
            <img src={empimg} alt="Employee" className="w-8 h-8 rounded-full" />
            <span className="font-bold">{name}</span>
          </div>
        </header>

        <section className="p-4 h-[680px]">{renderEmpContent(activeKey)}</section>
      </main>
    </div>
  );
}
