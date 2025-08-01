import { LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ menuItems, activeKey, onMenuClick, userType, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem("userData");
  navigate("../login");
  setTimeout(() => {
    toast.success("Logged out");
  }, 500);
};


  return (
    <aside className="w-64 bg-white shadow-md">
      <Toaster richColors position="top-right" />
      <div className="p-5 font-bold text-center text-xl">EMS {userType}</div>
      <nav className="p-2 mt-2 space-y-5">
        {menuItems.map(({ name, icon, key }) => (
          <button
            key={key}
            onClick={() => onMenuClick(key)}
            className={`flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-green-100 transition ${activeKey === key ? 'bg-green-200 font-semibold' : ''}`}
          >
            {icon}
            {name}
          </button>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className='w-42 px-4 py-2 rounded-lg text-white font-bold cursor-pointer mx-8 absolute bottom-10 bg-red-500 flex items-center justify-center gap-2'
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}