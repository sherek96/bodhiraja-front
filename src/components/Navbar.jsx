import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // Determine the title based on the current URL path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/student': return 'Student Management';
      case '/administration': return 'Administration';
      case '/employee': return 'Employee'
      case '/guardian': return 'Guardian'
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-12 bg-white flex items-center justify-between px-6">
      <div className="w-1/3 flex justify-start">
      </div>

      {/* MIDDLE: Dynamic Page Title */}
      <div className="w-1/3 flex justify-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {getPageTitle()}
        </h2>
      </div>

      <div className="w-1/3 flex items-center justify-end space-x-3">
        <span className="text-gray-600 hidden sm:block font-medium">Admin User</span>
        <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-slate-700 transition">
          A
        </div>
      </div>
    </header>
  );
};

export default Navbar;