import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children || <HelpCircle className="w-4 h-4 text-slate-400 hover:text-tealAccent-500 cursor-help transition-colors" />}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-navy-900 text-white text-xs rounded-xl shadow-xl border border-navy-700 z-50 pointer-events-none transition-all animate-fadeIn">
          <div className="whitespace-pre-line leading-relaxed font-sans">{text}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy-900" />
        </div>
      )}
    </div>
  );
}
