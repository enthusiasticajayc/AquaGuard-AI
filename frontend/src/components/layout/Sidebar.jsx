import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Scan,
  Eye,
  Map,
  ShieldCheck,
  FileSpreadsheet,
  BookOpen,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analyze', label: 'Analyze Sonar', icon: Scan },
  { path: '/surveys/surv-mumbai-001', label: 'Detection Viewer', icon: Eye },
  { path: '/map', label: 'GIS Control Map', icon: Map },
  { path: '/verify', label: 'Verification Queue', icon: ShieldCheck },
  { path: '/reports', label: 'Export Reports', icon: FileSpreadsheet },
  { path: '/research', label: 'Research & Data', icon: BookOpen },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 hidden md:block bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 min-h-[calc(100vh-4rem)] text-slate-900 dark:text-white transition-colors">
      <div className="p-4">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white font-extrabold mb-3 px-3">
          Control Operations
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-ocean-600 text-white shadow-md'
                      : 'hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-ocean-700 dark:text-tealAccent-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300" />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-ocean-800 dark:text-tealAccent-400 font-extrabold text-xs">
            <span className="w-2 h-2 rounded-full bg-ocean-600 dark:bg-tealAccent-400 animate-ping" />
            <span>Team Tech Galacticos</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-semibold">
            Smart India Hackathon 2026<br />
            Problem Statement: <b className="text-slate-900 dark:text-white font-extrabold">#26057</b><br />
            Theme: Disaster Management
          </p>
        </div>
      </div>
    </aside>
  );
}
