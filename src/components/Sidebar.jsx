import { NavLink } from 'react-router-dom';
import { CircleUserRound, LayoutDashboard } from 'lucide-react';
import { GraduationCap } from "lucide-react";
import { ShieldUser } from 'lucide-react';
import { IdCardLanyard } from 'lucide-react';
import { CircleUser} from 'lucide-react';

const Sidebar = () => {
  // A helper function to apply active styles using Tailwind
  const navLinkClass = ({ isActive }) => 
    ` py-2.5 px-4 rounded transition duration-200 flex items-center gap-2 ${
      isActive ? ' text-cyan-600' : 'hover:text-cyan-800 hover:bg-gray-200'
    }`;

  return (
    <aside className="w-52 bg-white text-gray-800 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center justify-center font-bold text-xl">
        Bodhiraja System
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/" className={navLinkClass}><LayoutDashboard />Dashboard</NavLink>
        <NavLink to="/employee" className={navLinkClass}><IdCardLanyard/>Employee</NavLink>
        <NavLink to="/student" className={navLinkClass}><GraduationCap />Student</NavLink>
        <NavLink to="/guardian" className={navLinkClass}><ShieldUser />Guardian</NavLink>
        <NavLink to="/users" className={navLinkClass}><CircleUser />Users</NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;