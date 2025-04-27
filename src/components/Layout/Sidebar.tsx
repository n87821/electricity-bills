
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Settings, ChartBar, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { settings } = useAppContext();

  const NavItem = ({ to, Icon, label }: { to: string, Icon: React.ElementType, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200
          ${isActive 
            ? 'bg-primary/10 text-primary' 
            : 'text-gray-700 hover:bg-gray-200'}`
        }
      >
        <Icon size={20} />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div className={`bg-white shadow-md flex flex-col border-l border-gray-200 h-screen sticky top-0 transition-all duration-300 overflow-hidden ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            {settings.logo && (
              <img 
                src={settings.logo} 
                alt="شعار الشركة" 
                className="h-8 w-8 object-contain"
              />
            )}
            <div className="text-xl font-bold text-primary">عياش جروب</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2 px-2">
        <NavItem to="/" Icon={Home} label="الرئيسية" />
        <NavItem to="/customers" Icon={Users} label="العملاء" />
        <NavItem to="/bills" Icon={FileText} label="الفواتير" />
        <NavItem to="/dashboard" Icon={ChartBar} label="لوحة المعلومات" />
        <NavItem to="/settings" Icon={Settings} label="الإعدادات" />
      </div>
    </div>
  );
};

export default Sidebar;
