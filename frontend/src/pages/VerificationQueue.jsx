import React, { useEffect, useState } from 'react';
import { fetchDetections, verifyDetection, getImageUrl } from '../services/api';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { RiskBadge, ClassBadge, StatusBadge } from '../components/ui/Badge';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Keyboard
} from 'lucide-react';

export default function VerificationQueue() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [noteInput, setNoteInput] = useState('');
  const [reclassifyClass, setReclassifyClass] = useState('ghost_net_fishing_gear');

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    setLoading(true);
    const data = await fetchDetections({ status: 'all' });
    const sorted = [...data].sort((a, b) => b.risk_score - a.risk_score);
    setDetections(sorted);
    setLoading(false);
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      if (detections.length === 0) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleAction('confirm');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleAction('reject');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, detections, noteInput]);

  const currentItem = detections[currentIndex] || detections[0];

  const handleAction = async (action, newCls = null) => {
    if (!currentItem) return;
    await verifyDetection(currentItem.id, action, newCls || reclassifyClass, noteInput);
    setNoteInput('');
    if (currentIndex < detections.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    loadQueue();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-700 dark:text-slate-300 font-mono text-xs">Loading Expert Verification Queue...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-navy-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-ocean-600 dark:text-tealAccent-400" />
            <span>Expert Verification Queue</span>
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
            Prioritized human-in-the-loop hazard audit queue sorted by risk score
          </p>
        </div>

        {/* Keyboard shortcut legend */}
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-200/80 dark:bg-navy-900 text-slate-900 dark:text-white text-xs font-mono border border-slate-300 dark:border-navy-800 shadow-sm">
          <Keyboard className="w-4 h-4 text-teal-700 dark:text-tealAccent-400" />
          <span>Shortcuts: Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-navy-800 text-slate-900 dark:text-tealAccent-300 font-bold border border-slate-300 dark:border-navy-700">C</kbd> to Confirm • <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-navy-800 text-slate-900 dark:text-tealAccent-300 font-bold border border-slate-300 dark:border-navy-700">R</kbd> to Reject</span>
        </div>
      </div>

      {detections.length === 0 ? (
        <Card className="p-12 text-center text-slate-700 dark:text-slate-300">
          <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verification Queue Empty</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">All sonar detections have been reviewed by hydrographic domain experts.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Card Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card className="border-tealAccent-500/30">
              <CardHeader className="flex items-center justify-between bg-slate-100 dark:bg-navy-950">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs text-slate-900 dark:text-slate-100 font-bold">Card {currentIndex + 1} of {detections.length}</span>
                  <ClassBadge classNameKey={currentItem.class_name} />
                  <RiskBadge level={currentItem.risk_level} />
                </div>
                <StatusBadge status={currentItem.status} />
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                
                {/* Sonar Thumbnail Preview */}
                <div className="h-56 rounded-xl bg-navy-950 border border-navy-800 relative overflow-hidden flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  <img
                    src={getImageUrl(currentItem.image_path || "/samples/sample_mumbai_raw.jpg")}
                    alt="Detection Sonar Crop"
                    className="max-h-48 rounded object-cover border border-navy-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/samples/sample_mumbai_raw.jpg";
                    }}
                  />

                  <div className="absolute top-3 left-3 bg-navy-900/90 text-tealAccent-300 px-2 py-1 rounded text-[10px] font-mono font-bold border border-navy-700">
                    ID: {currentItem.id}
                  </div>
                </div>

                {/* Quantitative Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-900 dark:text-slate-100 block text-[10px] font-bold">AI Confidence</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {(currentItem.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-100 block text-[10px] font-bold">Risk Score</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {currentItem.risk_score}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-100 block text-[10px] font-bold">Latitude</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {currentItem.lat.toFixed(4)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-100 block text-[10px] font-bold">Longitude</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {currentItem.lon.toFixed(4)}°
                    </span>
                  </div>
                </div>

                {/* Expert Input Form */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1">
                      <MessageSquare className="w-3.5 h-3.5 text-ocean-600 dark:text-tealAccent-400" />
                      <span>Verification Notes & Expert Assessment</span>
                    </label>
                    <textarea
                      rows={2}
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add hydrographic expert notes (e.g. Confirmed trawl net trapped near reef)..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealAccent-500 outline-none"
                    />
                  </div>

                  {/* Reclassify Dropdown */}
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Reclassify to:</span>
                    <select
                      value={reclassifyClass}
                      onChange={(e) => setReclassifyClass(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-xs text-slate-900 dark:text-white font-semibold outline-none"
                    >
                      <option value="ghost_net_fishing_gear">Ghost Fishing Net</option>
                      <option value="shipwreck">Submerged Shipwreck</option>
                      <option value="debris_object">Man-Made Debris</option>
                      <option value="anomaly">Seabed Anomaly</option>
                    </select>
                    <button
                      onClick={() => handleAction('reclassify', reclassifyClass)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 transition"
                    >
                      Reclassify & Confirm
                    </button>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => handleAction('confirm')}
                      className="py-3 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg transition flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm Hazard (Hotkey C)</span>
                    </button>

                    <button
                      onClick={() => handleAction('reject')}
                      className="py-3 rounded-xl font-bold text-xs bg-rose-700 hover:bg-rose-600 text-white shadow-lg transition flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Detection (Hotkey R)</span>
                    </button>
                  </div>

                </div>

              </CardContent>
            </Card>

          </div>

          {/* Side Queue List & Audit Trail (1 col) */}
          <div className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-100 font-bold">
                  Priority Audit Queue ({detections.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                {detections.map((d, idx) => (
                  <div
                    key={d.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between text-xs ${
                      currentIndex === idx
                        ? 'bg-tealAccent-500/10 border-tealAccent-500/60 font-bold'
                        : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <ClassBadge classNameKey={d.class_name} />
                        <span className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{d.id}</span>
                      </div>
                      <div className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100">Risk Score: {d.risk_score}</div>
                    </div>
                    <RiskBadge level={d.risk_level} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Audit Log Timeline */}
            <Card>
              <CardHeader className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-ocean-600 dark:text-tealAccent-400" />
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-100 font-bold">
                  Verification Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="border-l-2 border-tealAccent-500 pl-3 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">Verified by Senior Hydrographer</div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Action: <b className="text-emerald-700 dark:text-emerald-400">CONFIRMED</b> • 2 mins ago</div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 italic font-medium">"Ghost net confirmed trapped near reef zone."</p>
                </div>
                <div className="border-l-2 border-slate-300 dark:border-navy-700 pl-3 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">Verified by Hydrographic Officer</div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Action: <b className="text-ocean-700 dark:text-tealAccent-400">RECLASSIFIED</b> • 15 mins ago</div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 italic font-medium">"Reclassified from Anomaly to Shipwreck Hull."</p>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
}
