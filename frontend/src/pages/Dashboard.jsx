import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats, fetchSurveys, fetchDetections, fetchResearchMetrics } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { RiskBadge, ClassBadge, StatusBadge } from '../components/ui/Badge';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton';
import {
  Activity,
  AlertTriangle,
  FileCheck2,
  Layers,
  MapPin,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Compass,
  Sparkles,
  Play,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from 'recharts';

export default function Dashboard({ onStartDemo }) {
  const [stats, setStats] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const sData = await fetchStats();
      const detData = await fetchDetections({ min_confidence: 0.0 });
      const mData = await fetchResearchMetrics();
      setStats(sData);
      setMetrics(mData);
      if (Array.isArray(detData)) {
        setRecentDetections(detData.slice(0, 5));
      } else {
        setRecentDetections([]);
      }
    } catch (err) {
      console.warn("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const chartData = stats?.class_counts ? [
    { name: 'Mine-like Objects', count: stats.class_counts.mine_cylinder || 0, color: '#DC2626' },
    { name: 'Ghost Nets', count: (stats.class_counts.ghost_net || stats.class_counts.ghost_net_fishing_gear || 0), color: '#EF4444' },
    { name: 'Pipelines', count: stats.class_counts.submarine_pipeline || 0, color: '#8B5CF6' },
    { name: 'Shipwrecks', count: stats.class_counts.shipwreck || 0, color: '#F97316' },
  ] : [];


  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-navy-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operations Control Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Real-time side-scan sonar survey metrics and hazard analytics
            </p>
            {metrics && metrics.exists !== false && (
              <span className="inline-flex items-center text-[10px] font-mono text-teal-800 dark:text-tealAccent-300 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                {metrics.profile || 'Model'} model ({[
                  metrics.model_name,
                  metrics.imgsz ? `${metrics.imgsz}px` : null,
                  metrics.epochs !== undefined ? `${metrics.epochs} epochs` : null,
                  metrics.fraction !== undefined ? `${(metrics.fraction * 100).toFixed(0)}% of training data` : null
                ].filter(Boolean).join(', ')})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {onStartDemo && (
            <button
              onClick={onStartDemo}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg transition transform hover:scale-105"
            >
              <Compass className="w-4 h-4 text-amber-100 animate-spin-slow" />
              <span>Guided Demo (SIH 2026 Walkthrough)</span>
            </button>
          )}

          <Link
            to="/analyze"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-ocean-600 hover:bg-ocean-700 text-white shadow transition"
          >
            <span className="text-white font-bold">+ Process New Survey</span>
          </Link>
        </div>
      </div>

      {/* SIH 2026 Judge Banner Card */}
      {onStartDemo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-slate-900 to-navy-950 text-white border-2 border-tealAccent-500/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-tealAccent-500/20 text-tealAccent-300 border border-tealAccent-500/40 uppercase tracking-wider">
                SIH 2026 Judge Evaluation Mode
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                100% Offline Compatible
              </span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Experience full end-to-end pipeline in 5 guided steps</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Walk through <b>Upload</b> (OpenCV CLAHE) → <b>Detection</b> (YOLOv11 Bounding Boxes) → <b>GIS Map</b> (WGS84 lat/long) → <b>Verification</b> (Human-in-the-Loop) → <b>Report Export</b> (PDF/CSV/GeoJSON).
            </p>
          </div>
          <button
            onClick={onStartDemo}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-tealAccent-500 hover:bg-tealAccent-400 text-navy-950 shadow-lg transition flex items-center space-x-2 shrink-0 group transform hover:scale-105"
          >
            <Play className="w-4 h-4 text-navy-950 fill-current group-hover:scale-110 transition-transform" />
            <span>Launch Guided Demo Tour</span>
          </button>
        </div>
      )}

      {/* Offline Alert Banner */}
      {stats?.is_offline && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 font-medium text-xs shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <b>Backend Connection Unreachable:</b> Displaying offline demo telemetry. Click retry to reconnect to FastAPI services.
            </span>
          </div>
          <button
            onClick={loadData}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition flex items-center space-x-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}


      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="hover:border-tealAccent-500/50 transition">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Surveys Processed</p>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {stats?.surveys_processed ?? 0}
              </p>
              <span className="inline-flex items-center text-[11px] text-ocean-700 dark:text-tealAccent-400 font-medium mt-1">
                <TrendingUp className="w-3 h-3 mr-1" /> Active Indian Coastline Scans
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center text-ocean-700 dark:text-ocean-400">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-tealAccent-500/50 transition">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Detections</p>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {stats?.total_detections ?? 0}
              </p>
              <span className="inline-flex items-center text-[11px] text-slate-700 dark:text-slate-300 font-medium mt-1">
                Geo-tagged SRID 4326 Points
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-tealAccent-500/10 border border-tealAccent-500/20 flex items-center justify-center text-tealAccent-700 dark:text-tealAccent-400">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-500/50 transition">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pending Verification</p>
              <p className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
                {stats?.pending_verifications ?? 0}
              </p>
              <span className="inline-flex items-center text-[11px] text-amber-800 dark:text-amber-400 font-medium mt-1">
                Awaiting Expert Audit
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-rose-500/50 transition">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">High-Risk Hazards</p>
              <p className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-400 mt-1">
                {stats?.high_risk_hazards ?? 0}
              </p>
              <span className="inline-flex items-center text-[11px] text-rose-800 dark:text-rose-400 font-medium mt-1">
                Critical & High Severity
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Charts & Recent Activity Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
        
        {/* Detections by Class Chart */}
        <Card className="xl:col-span-2 min-w-0">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Hazard Distribution by Object Class</CardTitle>
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">YOLOv11 Classes</span>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0B1F33', borderColor: '#1E293B', color: '#FFF' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Compact Map Preview Card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-ocean-600 dark:text-tealAccent-400" />
              <span>GIS Hazard Map Preview</span>
            </CardTitle>
            <Link to="/map" className="text-xs font-semibold text-ocean-700 dark:text-tealAccent-400 hover:underline flex items-center">
              Full Map <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-44 rounded-lg bg-navy-950 border border-navy-800 relative overflow-hidden flex flex-col justify-between p-4">
              <div className="absolute inset-0 bg-[radial-gradient(#0E7490_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs font-mono text-tealAccent-400 bg-tealAccent-500/10 px-2 py-0.5 rounded border border-tealAccent-500/20 font-semibold">
                  Arabian Sea & Bay of Bengal
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="relative z-10 space-y-1">
                <div className="text-xs font-semibold text-white">Active Geo-Tagged Coordinates</div>
                <div className="text-[11px] font-mono text-slate-300">18.9220° N, 72.8347° E (Mumbai)</div>
                <div className="text-[11px] font-mono text-slate-300">17.6868° N, 83.2185° E (Vizag)</div>
              </div>
            </div>
            <Link
              to="/map"
              className="w-full py-2 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 flex items-center justify-center space-x-1.5 transition"
            >
              <span>Launch Interactive Control Map</span>
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Priority Hazard Detections</CardTitle>
          <Link to="/verify" className="text-xs font-semibold text-ocean-700 dark:text-tealAccent-400 hover:underline flex items-center">
            Verification Queue <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-navy-800">
                <tr>
                  <th className="p-3.5">Detection ID</th>
                  <th className="p-3.5">Hazard Class</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">Coordinates</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
                {recentDetections.map((det) => (
                  <tr key={det.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition">
                    <td className="p-3.5 font-mono text-slate-900 dark:text-slate-200 font-medium">{det.id}</td>
                    <td className="p-3.5"><ClassBadge classNameKey={det.class_name} /></td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">{(det.confidence * 100).toFixed(1)}%</td>
                    <td className="p-3.5"><RiskBadge level={det.risk_level} /></td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{det.lat.toFixed(4)}°, {det.lon.toFixed(4)}°</td>
                    <td className="p-3.5"><StatusBadge status={det.status} /></td>
                    <td className="p-3.5 text-right">
                      <Link
                        to="/verify"
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-ocean-600 hover:bg-ocean-700 text-white border border-ocean-700 transition shadow-sm"
                      >
                        Audit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
