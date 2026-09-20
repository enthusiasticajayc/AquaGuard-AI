import React from 'react';
import { Link } from 'react-router-dom';
import {
  Waves,
  ArrowRight,
  ShieldCheck,
  Cpu,
  MapPin,
  Globe2,
  Globe,
  Compass,
  FileCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

const workflowSteps = [
  { step: '01', title: 'Sonar Upload', desc: 'Side-Scan Sonar (SSS) imagery intake' },
  { step: '02', title: 'Preprocessing', desc: 'OpenCV CLAHE & acoustic noise reduction' },
  { step: '03', title: 'AI Detection', desc: 'YOLOv11 neural network inference' },
  { step: '04', title: 'Confidence Filtering', desc: 'Adjustable threshold & multi-class bounds' },
  { step: '05', title: 'Geo-Tagging', desc: 'WGS84 SRID 4326 GIS coordinate mapping' },
  { step: '06', title: 'Human Verification', desc: 'Expert audit queue & report export' },
];

const capabilityCards = [
  {
    icon: Cpu,
    title: 'Automated Detection',
    desc: 'High-speed acoustic imagery parsing identifying ghost nets, shipwrecks, metal debris, and seabed anomalies.'
  },
  {
    icon: ShieldCheck,
    title: 'Confidence & Risk Intelligence',
    desc: 'Multi-factor hazard ranking formula incorporating class severity, confidence metric, and spatial footprint.'
  },
  {
    icon: MapPin,
    title: 'Geo-Tagged Intelligence',
    desc: 'Precision WGS84 mapping with interactive Leaflet GIS cluster visualizer and density heatmaps.'
  },
  {
    icon: FileCheck,
    title: 'Verified Action',
    desc: 'Human-in-the-loop expert review workflow with full audit logging and multi-format exports (PDF, GeoJSON, KML).'
  }
];

const marketData = [
  { year: '2025', value: 4.66 },
  { year: '2026', value: 4.99 },
  { year: '2027', value: 5.35 },
  { year: '2028', value: 5.74 },
  { year: '2029', value: 6.15 },
  { year: '2030', value: 6.59 },
  { year: '2031', value: 7.06 },
  { year: '2032', value: 7.57 },
  { year: '2033', value: 8.05 },
];

const comparisonData = [
  { feature: 'AI Sonar Detection', aquaguard: 'YOLOv11 + OpenCV CLAHE', ghostvision: 'Basic CNN', ai4shipwrecks: 'Rule-based', ghostnetzero: 'Manual' },
  { feature: 'Multi-Hazard Detection', aquaguard: 'Yes (Nets, Wrecks, Debris, Anomalies)', ghostvision: 'Nets only', ai4shipwrecks: 'Shipwrecks only', ghostnetzero: 'Nets only' },
  { feature: 'Risk Prioritization', aquaguard: 'Multi-Factor Score (Critical->Low)', ghostvision: 'None', ai4shipwrecks: 'Binary flag', ghostnetzero: 'None' },
  { feature: 'GIS + Geo-Tagging', aquaguard: 'WGS84 SRID 4326 + Heatmaps', ghostvision: 'Static image', ai4shipwrecks: 'Basic coordinates', ghostnetzero: 'None' },
  { feature: 'Human Verification', aquaguard: 'Audit Trail + Shortcut Queue (C/R)', ghostvision: 'No', ai4shipwrecks: 'Limited', ghostnetzero: 'Manual Form' },
  { feature: 'Actionable Reporting', aquaguard: 'GeoJSON, KML, PDF, CSV, JSON', ghostvision: 'PDF only', ai4shipwrecks: 'CSV only', ghostnetzero: 'Text summary' },
  { feature: 'End-to-End Workflow', aquaguard: 'Upload -> Detect -> Verify -> Protect', ghostvision: 'Fragmented', ai4shipwrecks: 'Fragmented', ghostnetzero: 'Manual' }
];

export default function Landing({ onStartDemo }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* Explicit Dark Navy Hero Section (Dark in BOTH light and dark themes) */}
      <section className="relative overflow-hidden bg-[#0B1F33] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-navy-800 shadow-lg">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-tealAccent-500/20 border border-tealAccent-500/40 text-tealAccent-300 text-xs font-mono font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-tealAccent-400 animate-ping" />
            <span>Smart India Hackathon 2026 • Problem Statement #26057</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight text-balance">
            Autonomous Underwater Debris Detection & <span className="whitespace-nowrap text-tealAccent-300">Geo&#8209;Tagging</span>
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-mono text-tealAccent-300 font-bold tracking-wide">
            "Detect → Locate → Verify → Protect."
          </p>

          <p className="mt-6 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            AquaGuard AI harnesses YOLOv11 deep learning and OpenCV sonar preprocessing to pinpoint marine debris, ghost fishing nets, and navigation hazards off coastal waters with precision geo-spatial intelligence.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-ocean-600 via-tealAccent-600 to-tealAccent-500 hover:from-ocean-500 hover:to-tealAccent-400 text-white shadow-xl hover:shadow-tealAccent-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Control Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {onStartDemo && (
              <button
                onClick={onStartDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4 text-amber-100 animate-spin-slow" />
                <span>Guided Demo (Judge Walkthrough)</span>
              </button>
            )}

            <Link
              to="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-navy-900/90 hover:bg-navy-800 text-tealAccent-300 border border-tealAccent-500/40 shadow-md transition"
            >
              <Globe className="w-4 h-4 text-tealAccent-400" />
              <span>Explore Live GIS Map</span>
            </Link>
          </div>

          {/* Unified Accent Color Stat Strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800">
              <div className="text-2xl font-bold font-mono text-tealAccent-300">YOLOv11</div>
              <div className="text-xs text-slate-200 font-medium mt-1">Deep Sonar Architecture</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800">
              <div className="text-2xl font-bold font-mono text-tealAccent-300">SRID 4326</div>
              <div className="text-xs text-slate-200 font-medium mt-1">WGS84 GIS Standard</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800">
              <div className="text-2xl font-bold font-mono text-tealAccent-300">5 Formats</div>
              <div className="text-xs text-slate-200 font-medium mt-1">Export (PDF/GeoJSON/KML)</div>
            </div>
            <div className="p-4 rounded-xl bg-navy-950/90 border border-navy-800">
              <div className="text-2xl font-bold font-mono text-tealAccent-300">4 Classes</div>
              <div className="text-xs text-slate-200 font-medium mt-1">Hazard Classification</div>
            </div>
          </div>

        </div>
      </section>

      {/* 6-Step Workflow Strip */}
      <section className="py-12 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-ocean-700 dark:text-tealAccent-400 font-bold">Pipeline Workflow</h2>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">End-to-End Marine Intelligence Architecture</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {workflowSteps.map((step) => (
              <div key={step.step} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 relative group hover:border-tealAccent-500/50 transition">
                <div className="text-xs font-mono font-extrabold text-ocean-700 dark:text-tealAccent-400">{step.step}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{step.title}</div>
                <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-normal font-medium">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Capability Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-ocean-700 dark:text-tealAccent-400 font-bold">Core Capabilities</h2>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">What Makes AquaGuard Different</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilityCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="p-6 rounded-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-tealAccent-500/40 transition group shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-tealAccent-500/10 border border-tealAccent-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-ocean-700 dark:text-tealAccent-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{card.title}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed font-medium">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-14 bg-white dark:bg-navy-900 border-y border-slate-200 dark:border-navy-800 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-ocean-700 dark:text-tealAccent-400 font-bold">Triple Bottom Line</h2>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Quantifiable Marine Impact</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-card bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
              <div className="text-lg font-bold text-ocean-800 dark:text-tealAccent-400 mb-2">Economic Impact</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Prevents vessel hull collisions and propeller entanglements, saving millions in commercial shipping repairs and coastal port clearance operations.
              </p>
            </div>
            <div className="p-6 rounded-card bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
              <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">Environmental Impact</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Mitigates "ghost fishing" mortality on marine mammals and sea turtles by enabling precision recovery of abandoned fishing gear from fragile reefs.
              </p>
            </div>
            <div className="p-6 rounded-card bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
              <div className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-2">Social & Safety Impact</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Empowers coastal fishing communities and naval hydrographers with real-time actionable intelligence for safe ocean navigation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Market Chart Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-ocean-700 dark:text-tealAccent-400 font-bold">Market Intelligence</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Global Sonar & Underwater Detection Market</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              The global side-scan sonar and underwater anomaly detection market is projected to expand from <b className="text-slate-900 dark:text-white">US$4.66 Billion in 2025</b> to <b className="text-slate-900 dark:text-white">US$8.05 Billion by 2033</b>, expanding at a CAGR of <b className="text-slate-900 dark:text-white">7.2%</b>.
            </p>
            <div className="text-xs font-mono text-slate-700 dark:text-slate-300 italic font-medium">
              Source: Grand View Research - Marine Sonar Technology Outlook
            </div>
          </div>
          <div className="lg:col-span-2 p-6 rounded-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <defs>
                    <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#475569" fontSize={12} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} unit="B" domain={[4, 9]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0B1F33', borderColor: '#1E293B', color: '#FFF' }} />
                  <Area type="monotone" dataKey="value" stroke="#14B8A6" strokeWidth={3} fillOpacity={1} fill="url(#marketGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-ocean-700 dark:text-tealAccent-400 font-bold">Competitive Benchmark</h2>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">AquaGuard AI vs Existing Alternatives</p>
          </div>

          <div className="overflow-x-auto rounded-card border border-slate-200 dark:border-navy-800 shadow-sm">
            <table className="w-full text-xs text-left text-slate-800 dark:text-slate-200">
              <thead className="text-xs font-mono uppercase bg-slate-200 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-300 dark:border-navy-800">
                <tr>
                  <th className="p-4">Capability Dimension</th>
                  <th className="p-4 text-ocean-800 dark:text-tealAccent-300 bg-tealAccent-500/10 font-bold">AquaGuard AI</th>
                  <th className="p-4">GhostVision</th>
                  <th className="p-4">AI4Shipwrecks</th>
                  <th className="p-4">GhostNetZero</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 bg-white dark:bg-navy-900">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{row.feature}</td>
                    <td className="p-4 font-bold text-ocean-800 dark:text-tealAccent-300 bg-tealAccent-500/5">{row.aquaguard}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{row.ghostvision}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{row.ai4shipwrecks}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{row.ghostnetzero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* UN SDG Badges Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-xs font-mono uppercase tracking-widest text-ocean-700 dark:text-tealAccent-400 font-bold mb-6">Alignment with United Nations Sustainable Development Goals</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-300 font-bold text-xs flex items-center space-x-2">
            <span className="font-mono text-base font-extrabold text-blue-700 dark:text-blue-400">SDG 14</span>
            <span>Life Below Water</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2">
            <span className="font-mono text-base font-extrabold text-emerald-700 dark:text-emerald-400">SDG 13</span>
            <span>Climate Action</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-300 font-bold text-xs flex items-center space-x-2">
            <span className="font-mono text-base font-extrabold text-amber-900 dark:text-amber-300">SDG 9</span>
            <span>Industry & Innovation</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-300 font-bold text-xs flex items-center space-x-2">
            <span className="font-mono text-base font-extrabold text-purple-700 dark:text-purple-400">SDG 12</span>
            <span>Responsible Consumption</span>
          </div>
        </div>
      </section>

    </div>
  );
}
