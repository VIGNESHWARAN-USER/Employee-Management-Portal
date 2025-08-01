import { useEffect, useState } from 'react';
import { Home, User, FileText, CalendarCheck2, ClipboardList } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import empimg from "../../assets/admin.png";
import EmployeeProfile from '../Employee/EmployeeProfile';
import PayslipsPage from '../Employee/PayslipsPage';
import LeaveManagementPage from '../LeaveManagement/LeaveManagementPage';
import { useNavigate } from 'react-router-dom';
import PerformanceReviewPage from '../PerfomanceReview/PerformanceReviewPage';
import Sidebar from './Sidebar'; // Assuming Sidebar.jsx is in the same directory

const employeeMenu = [
  { name: 'Profile', icon: <User size={18} />, key: 'profile' },
  { name: 'Payslips', icon: <FileText size={18} />, key: 'payslips' },
  { name: 'Leaves', icon: <CalendarCheck2 size={18} />, key: 'leaves' },
  { name: 'Performance Reviews', icon: <ClipboardList size={18} />, key: 'performance' },
];

const renderEmpContent = (key) => {
  switch (key) {
    case 'profile':
      return <EmployeeProfile />;
    case 'payslips':
      return <PayslipsPage />;
    case 'leaves':
      return <LeaveManagementPage />;
    case 'performance':
      return <PerformanceReviewPage />;
    default:
      return null;
  }
};

export default function EmployeeDashboard() {
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

  const handleLogout = () => {
    navigate("../login");
    toast.success("Logged out");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        menuItems={employeeMenu}
        activeKey={activeKey}
        onMenuClick={setActiveKey}
        userType="Employee"
        onLogout={handleLogout}
      />

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