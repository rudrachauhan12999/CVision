import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Sparkles,
  BarChart3,
  User,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Job Openings', path: '/jobs', icon: Briefcase },
    { label: 'Resume Repository', path: '/resumes', icon: FileText },
    { label: 'AI Match Analysis', path: '/analyze', icon: Sparkles, highlight: true },
    { label: 'Reports & Exports', path: '/reports', icon: BarChart3 },
    { label: 'Profile & Team', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-[61px] left-0 h-[calc(100vh-61px)] w-64 bg-[#111827]/70 backdrop-blur-xl border-r border-white/10 text-slate-300 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recruitment Platform
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                          : 'bg-slate-800 text-white font-semibold border-l-4 border-indigo-500'
                        : item.highlight
                        ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 ${item.highlight ? 'text-indigo-400' : ''}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-xl p-3.5 text-xs">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Firebase Connected</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Real-time Firestore sync & secure Firebase Auth active.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
