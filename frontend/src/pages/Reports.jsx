import React, { useEffect, useState } from 'react';
import { fetchSurveys, fetchSurveyById, getReportDownloadUrl } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import {
  FileSpreadsheet,
  FileText,
  Globe,
  FileCode,
  FileDown,
  Printer
} from 'lucide-react';

export default function Reports() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await fetchSurveys();
      setSurveys(list);
      if (list.length > 0) {
        setSelectedSurveyId(list[0].id);
        const full = await fetchSurveyById(list[0].id);
        setActiveSurvey(full);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSurveyChange = async (e) => {
    const id = e.target.value;
    setSelectedSurveyId(id);
    setLoading(true);
    const full = await fetchSurveyById(id);
    setActiveSurvey(full);
    setLoading(false);
  };

  const handleDownload = (format) => {
    if (!selectedSurveyId) return;
    const url = getReportDownloadUrl(selectedSurveyId, format);
    window.open(url, '_blank');
  };

  const detections = activeSurvey?.detections || [];

  const criticalCount = detections.filter(d => d.risk_level === 'Critical').length;
  const highCount = detections.filter(d => d.risk_level === 'High').length;
  const medCount = detections.filter(d => d.risk_level === 'Medium').length;
  const lowCount = detections.filter(d => d.risk_level === 'Low').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-navy-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-ocean-600 dark:text-tealAccent-400" />
            <span>Structured Multi-Format Report Generator</span>
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
            Export verified hydrographic hazard surveys for marine cleanup authorities and naval hydrographers
          </p>
        </div>

        {/* Survey Picker Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-slate-900 dark:text-slate-100">Select Survey:</label>
          <select
            value={selectedSurveyId}
            onChange={handleSurveyChange}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-tealAccent-500"
          >
            {surveys.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.date})</option>
            ))}
          </select>
        </div>
      </div>

      {activeSurvey && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Summary Preview & Multi-Format Exporters (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 5 Export Format Action Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-100 font-bold">
                  Export Options (5 Supported GIS & Document Formats)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                <button
                  onClick={() => handleDownload('pdf')}
                  className="p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-900 dark:text-rose-300 flex flex-col items-center justify-center space-y-2 group transition"
                >
                  <FileText className="w-6 h-6 text-rose-700 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs text-rose-950 dark:text-rose-200">PDF Document</span>
                  <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold">Printable Report</span>
                </button>

                <button
                  onClick={() => handleDownload('geojson')}
                  className="p-4 rounded-xl bg-tealAccent-500/10 hover:bg-tealAccent-500/20 border border-tealAccent-500/30 text-tealAccent-900 dark:text-tealAccent-300 flex flex-col items-center justify-center space-y-2 group transition"
                >
                  <Globe className="w-6 h-6 text-tealAccent-700 dark:text-tealAccent-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs text-tealAccent-950 dark:text-tealAccent-200">GeoJSON Format</span>
                  <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold">WGS84 SRID 4326</span>
                </button>

                <button
                  onClick={() => handleDownload('kml')}
                  className="p-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex flex-col items-center justify-center space-y-2 group transition"
                >
                  <FileCode className="w-6 h-6 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs text-amber-950 dark:text-amber-200">KML Format</span>
                  <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold">Google Earth / QGIS</span>
                </button>

                <button
                  onClick={() => handleDownload('csv')}
                  className="p-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 flex flex-col items-center justify-center space-y-2 group transition"
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200">CSV Table</span>
                  <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold">Excel / Spreadsheet</span>
                </button>

                <button
                  onClick={() => handleDownload('json')}
                  className="p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-900 dark:text-blue-300 flex flex-col items-center justify-center space-y-2 group transition"
                >
                  <FileDown className="w-6 h-6 text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs text-blue-950 dark:text-blue-200">JSON Raw API</span>
                  <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold">Developer Payload</span>
                </button>

              </CardContent>
            </Card>

            {/* Document Print Preview Container */}
            <Card className="p-6 bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 font-sans space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    AquaGuard AI - Hydrographic Survey Summary Report
                  </h2>
                  <p className="text-xs text-ocean-700 dark:text-tealAccent-400 font-mono font-bold mt-0.5">
                    Official Marine Debris & Navigation Hazard Audit
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono p-3 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-900 dark:text-slate-100 min-w-0">
                <div className="min-w-0"><span className="text-slate-700 dark:text-slate-300 block text-[10px] font-bold">Survey Name</span><b className="text-slate-900 dark:text-white break-words block">{activeSurvey.name}</b></div>
                <div className="min-w-0"><span className="text-slate-700 dark:text-slate-300 block text-[10px] font-bold">Date</span><b className="text-slate-900 dark:text-white block">{activeSurvey.date}</b></div>
                <div className="min-w-0"><span className="text-slate-700 dark:text-slate-300 block text-[10px] font-bold">Sonar Model</span><b className="text-slate-900 dark:text-white break-words block">{activeSurvey.sonar_type}</b></div>
                <div className="min-w-0"><span className="text-slate-700 dark:text-slate-300 block text-[10px] font-bold">Total Detections</span><b className="text-slate-900 dark:text-white block">{detections.length}</b></div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-navy-900 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-300 dark:border-navy-800">
                    <tr>
                      <th className="p-2.5">Class</th>
                      <th className="p-2.5">Confidence</th>
                      <th className="p-2.5">Risk Score</th>
                      <th className="p-2.5">Latitude</th>
                      <th className="p-2.5">Longitude</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
                    {detections.map(d => (
                      <tr key={d.id}>
                        <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">{d.class_name.replace('_', ' ')}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">{(d.confidence * 100).toFixed(1)}%</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">{d.risk_score}</td>
                        <td className="p-2.5 font-mono text-slate-800 dark:text-slate-200">{d.lat.toFixed(4)}°</td>
                        <td className="p-2.5 font-mono text-slate-800 dark:text-slate-200">{d.lon.toFixed(4)}°</td>
                        <td className="p-2.5"><StatusBadge status={d.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </Card>

          </div>

          {/* Side Hazard Breakdown Card (1 col) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-100 font-bold">
                  Risk Level Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-red-900 dark:text-red-400">Critical Risk (≥0.75)</span>
                  <span className="font-mono text-base font-extrabold text-red-900 dark:text-red-400">{criticalCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-orange-900 dark:text-orange-400">High Risk (≥0.60)</span>
                  <span className="font-mono text-base font-extrabold text-orange-900 dark:text-orange-400">{highCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-950 dark:text-amber-400">Medium Risk (≥0.40)</span>
                  <span className="font-mono text-base font-extrabold text-amber-950 dark:text-amber-400">{medCount}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-400">Low Risk (&lt;0.40)</span>
                  <span className="font-mono text-base font-extrabold text-emerald-900 dark:text-emerald-400">{lowCount}</span>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      )}

    </div>
  );
}
