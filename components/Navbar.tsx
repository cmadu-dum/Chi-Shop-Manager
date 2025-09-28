
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PlusCircleIcon, BarChartIcon } from './icons';

const Navbar: React.FC = () => {
  const linkClasses = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClasses = "bg-slate-200 text-slate-900";
  const inactiveLinkClasses = "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900";

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-900">Shop Manager</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink to="/" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
              <HomeIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Home</span>
            </NavLink>
            <NavLink to="/add" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
              <PlusCircleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Add Entry</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
              <BarChartIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Reports</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
