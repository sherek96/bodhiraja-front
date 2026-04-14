import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read the user data that we will save during login (See Step 3)
  const username = localStorage.getItem("username") || "Unknown User";
  const displayName = localStorage.getItem("display_name") || username;
  const role = localStorage.getItem("user_role") || "USER";

  // Determine the title based on the current URL path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/student': return 'Student Management';
      case '/employee': return 'Employee Directory';
      case '/guardian': return 'Guardian Records';
      case '/users': return 'System Users';
      case '/academic': return 'Academic Management';
      case '/finance': return 'Financial Ledger';
      case '/attendance': return 'Daily Attendance';
      default: return 'Dashboard';
    }
  };

  // The Logout Function
  const handleLogout = () => {
    // 1. Destroy all saved data
    localStorage.removeItem("pirivena_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");
    localStorage.removeItem("display_name");
    
    // 2. Kick them back to the login screen
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_20px_0_rgba(31,38,135,0.05)] flex items-center justify-between px-8 z-10">
      
      {/* LEFT: Placeholder for alignment */}
      <div className="w-1/3 flex justify-start">
        {role === 'ADMIN' && (
          <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-indigo-100/80 text-indigo-700 rounded-lg border border-indigo-200">
            <ShieldAlert size={14} /> System Admin
          </span>
        )}
      </div>

      {/* MIDDLE: Dynamic Page Title (Gradient Text) */}
      <div className="w-1/3 flex justify-center">
        <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* RIGHT: User Profile & Logout */}
      <div className="w-1/3 flex items-center justify-end gap-5">
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 leading-tight">{displayName}</p>
            <p className="text-xs font-medium text-gray-500 capitalize">{role.toLowerCase()}</p>
          </div>
          
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md border border-white/20">
            {/* Grab the first letter of the display name */}
            <span className="font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300/60"></div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-medium text-sm group"
          title="Sign Out"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">Sign Out</span>
        </button>

      </div>
    </header>
  );
};

export default Navbar;