import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Waves, Cpu, Sun, Moon, Compass, Sparkles } from 'lucide-react';

export default function Navbar({ isDarkMode, toggleDarkMode, stats, onStartDemo }) {
  const isDemo = stats?.is_mock ?? true;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-navy-900/95 backdrop-blur border-b border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-ocean-600 dark:bg-gradient-to-tr dark:from-ocean-600 dark:to-tealAccent-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                AquaGuard AI
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-ocean-500/10 dark:bg-tealAccent-500/10 border border-ocean-500/20 dark:border-tealAccent-500/20 text-ocean-700 dark:text-tealAccent-400 font-semibold">
                SIH 2026 #26057
              </span>
            </div>
          </Link>
        </div>

        {/* System Badges & Actions */}
        <div className="flex items-center space-x-3">
          
          {/* AI Mode Indicator Badge */}
          {isDemo ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-600/30 text-amber-800 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Demo Data (Mock Detector)</span>
              <span className="md:hidden">Demo</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-600/30 text-emerald-800 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">YOLOv11 Live Engine</span>
              <span className="md:hidden">YOLOv11</span>
            </div>
          )}

          {/* Guided Demo Button */}
          {onStartDemo && (
            <button
              onClick={onStartDemo}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md transition transform hover:scale-105"
            >
              <Compass className="w-3.5 h-3.5 animate-spin-slow text-amber-100" />
              <span>Guided Demo</span>
            </button>
          )}

          {/* Quick Launch Console CTA */}
          <Link
            to="/analyze"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-700 dark:bg-teal-600 hover:bg-sky-800 dark:hover:bg-teal-500 text-white border border-sky-800 dark:border-teal-500 shadow-sm transition"
          >
            <span>Launch Scan</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-tealAccent-500 border border-slate-200 dark:border-navy-700"
            title="Toggle Light/Dark Theme"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

      </div>
    </header>
  );
}

