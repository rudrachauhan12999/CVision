import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  LogOut,
  User,
  Bell,
  Menu,
  X,
  PlusCircle,
  Brain
} from 'lucide-react';

interface NavbarProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#09090B]/60 backdrop-blur-xl border-b border-white/10 text-white px-4 lg:px-6 py-3 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center space-x-3">
          {currentUser && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                CVision
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PLATFORM
              </span>
            </div>
          </Link>
        </div>

        {/* Right Section: Actions & User Dropdown */}
        {currentUser ? (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/analyze"
              className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>New Match Analysis</span>
            </Link>

            <Link
              to="/jobs"
              className="hidden md:flex items-center space-x-1 text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <PlusCircle className="w-4 h-4 text-slate-400" />
              <span>Post Job</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-slate-800 transition"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-white border-2 border-indigo-400/40 text-sm shadow-inner">
                  {(userProfile?.fullName || userProfile?.displayName || 'Recruiter').charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-slate-100 leading-tight">
                    {userProfile?.fullName || userProfile?.displayName || 'Recruiter'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {userProfile?.company ? userProfile.company : (userProfile?.role ? userProfile.role.replace('_', ' ') : 'Recruiter')}
                  </p>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-sm">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white">{userProfile?.fullName || userProfile?.displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    {userProfile?.company && (
                      <p className="text-[11px] text-indigo-400 mt-0.5">{userProfile.company}</p>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile & Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white font-medium text-sm px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-md shadow-indigo-600/30"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
