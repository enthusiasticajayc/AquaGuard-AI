import React from 'react';
import { Waves, Shield, Anchor, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-navy-950 border-t border-slate-800 dark:border-navy-800 text-slate-300 dark:text-slate-300 text-xs py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-tealAccent-500/20 border border-tealAccent-500/30 flex items-center justify-center">
            <Waves className="w-4 h-4 text-tealAccent-400" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">AquaGuard AI</div>
            <div className="text-slate-300 text-[11px]">Side-Scan Sonar Debris & Hazard Geo-Tagging System</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[11px] text-slate-300">
          <span className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-tealAccent-400" />
            <span>SIH 2026 PS 26057</span>
          </span>
          <span className="flex items-center space-x-1">
            <Anchor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Team: Tech Galacticos</span>
          </span>
          <span className="flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>WGS84 SRID 4326 GIS</span>
          </span>
        </div>

        <div className="text-center md:text-right text-[11px] text-slate-300">
          &copy; 2026 AquaGuard AI. Built for Smart India Hackathon.
        </div>
      </div>
    </footer>
  );
}
