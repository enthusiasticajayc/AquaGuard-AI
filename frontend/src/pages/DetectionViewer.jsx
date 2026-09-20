import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSurveyById, getImageUrl } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { RiskBadge, ClassBadge, StatusBadge } from '../components/ui/Badge';
import { Tooltip } from '../components/ui/Tooltip';
import { RISK_FORMULA_EXPLANATION, CLASS_CONFIG, getClassConfig } from '../config/riskConfig';
import { Eye, MapPin, FileSpreadsheet } from 'lucide-react';

export default function DetectionViewer() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Viewer Toggles
  const [usePreprocessed, setUsePreprocessed] = useState(true);
  const [selectedDetectionId, setSelectedDetectionId] = useState(null);
  const [showBoxes, setShowBoxes] = useState(true);

  useEffect(() => {
    async function loadSurvey() {
      setLoading(true);
      try {
        const data = await fetchSurveyById(id || "surv-mumbai-001");
        setSurvey(data);
        if (data?.detections?.length > 0) {
          setSelectedDetectionId(data.detections[0].id);
        }
      } catch (err) {
        console.warn("Error loading survey details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSurvey();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-700 dark:text-slate-300 font-mono text-xs">
        Loading Sonar Detection Viewer...
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="p-8 text-center text-slate-700 dark:text-slate-300">
        Survey not found. <Link to="/dashboard" className="text-ocean-700 dark:text-tealAccent-400 underline font-semibold">Return to Dashboard</Link>
      </div>
    );
  }

  const detections = survey.detections || [];
  const rawPath = survey.image_path;
  const prepPath = survey.preprocessed_image_path || survey.image_path;
  const currentImage = usePreprocessed ? prepPath : rawPath;
  const resolvedImageSrc = getImageUrl(currentImage);


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-navy-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-ocean-700 dark:text-tealAccent-400">
            <span>Survey ID: {survey.id}</span>
            <span>•</span>
            <span>{survey.date}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            {survey.name}
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
            Equipment: <b>{survey.sonar_type}</b> | Total Detections: <b>{detections.length}</b>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          
          {/* Raw vs Preprocessed Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-navy-900 border border-slate-300 dark:border-navy-800 text-xs">
            <button
              onClick={() => setUsePreprocessed(false)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${!usePreprocessed ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-tealAccent-400 shadow' : 'text-slate-800 dark:text-slate-300 font-bold'}`}
            >
              Raw Sonar
            </button>
            <button
              onClick={() => setUsePreprocessed(true)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${usePreprocessed ? 'bg-slate-900 dark:bg-ocean-600 text-white shadow' : 'text-slate-800 dark:text-slate-300 font-bold'}`}
            >
              Preprocessed (OpenCV CLAHE)
            </button>
          </div>

          <Link
            to={`/reports`}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-ocean-600 hover:bg-ocean-700 text-white flex items-center space-x-1.5 transition shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sonar Image Canvas Viewer (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden bg-slate-900 dark:bg-navy-950 border-slate-700 dark:border-navy-800 relative">
            <CardHeader className="flex items-center justify-between py-3 px-4 bg-slate-800 dark:bg-navy-900 border-b border-slate-700 dark:border-navy-800">
              <div className="flex items-center space-x-2 text-xs font-mono text-white">
                <Eye className="w-4 h-4 text-teal-400 dark:text-tealAccent-400" />
                <span>Side-Scan Sonar Acoustic Waterfall View</span>
                {usePreprocessed && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-teal-500/30 border border-teal-400/50 text-teal-200 font-bold">
                    CLAHE + Denoised
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBoxes(!showBoxes)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${showBoxes ? 'bg-tealAccent-500/20 text-tealAccent-300 border border-tealAccent-500/40' : 'bg-navy-800 text-slate-300'}`}
                >
                  {showBoxes ? 'Hide BBoxes' : 'Show BBoxes'}
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 relative min-h-[420px] flex items-center justify-center bg-navy-950 select-none">
              
              <div className="relative inline-block max-w-full">
                <img
                  src={resolvedImageSrc}
                  alt="Sonar Scan"
                  className="max-h-[500px] w-auto rounded-lg object-contain block mx-auto border border-navy-800 shadow-md"
                  onError={(e) => {
                    console.warn("DetectionViewer img failed to load, using sample fallback:", resolvedImageSrc);
                    e.target.onerror = null;
                    e.target.src = "/samples/sample_mumbai_raw.jpg";
                  }}
                />

                {/* Sonar Scanline Waterfall Effect overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg opacity-20">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-tealAccent-400 to-transparent animate-sonar-sweep" />
                </div>

                {/* Bounding Box Overlays */}
                {showBoxes && detections.map((det) => {
                  const isSelected = selectedDetectionId === det.id;
                  const bbox = det.bbox || [0.2, 0.2, 0.15, 0.15];
                  
                  const widthPct = bbox[2] * 100;
                  const heightPct = bbox[3] * 100;
                  const leftPct = (bbox[0] - bbox[2] / 2) * 100;
                  const topPct = (bbox[1] - bbox[3] / 2) * 100;

                  const classInfo = getClassConfig(det.class_name);


                  return (
                    <div
                      key={det.id}
                      onClick={() => setSelectedDetectionId(det.id)}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        borderColor: isSelected ? '#14B8A6' : classInfo.color,
                      }}
                      className={`absolute border-2 rounded transition-all cursor-pointer group ${
                        isSelected ? 'ring-4 ring-tealAccent-500/50 bg-tealAccent-500/20 z-30 scale-105' : 'bg-black/10 hover:bg-white/10 z-20'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: classInfo.color }}
                        className="absolute bottom-full left-0 mb-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow whitespace-nowrap opacity-95 flex items-center space-x-1"
                      >
                        <span>{classInfo.label}</span>
                        <span>({(det.confidence * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}

              </div>

            </CardContent>
          </Card>
        </div>

        {/* Detections Side List (1 col) */}
        <div className="space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex items-center justify-between py-3">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">
                Detections ({detections.length})
              </CardTitle>
              <Tooltip text={RISK_FORMULA_EXPLANATION} />
            </CardHeader>
            <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-[520px]">
              {detections.map((det) => {
                const isSelected = selectedDetectionId === det.id;
                return (
                  <div
                    key={det.id}
                    onClick={() => setSelectedDetectionId(det.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-tealAccent-500/10 border-tealAccent-500/60 shadow-md ring-1 ring-tealAccent-500/40'
                        : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <ClassBadge classNameKey={det.class_name} />
                      <RiskBadge level={det.risk_level} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
                      <div>
                        <span className="text-slate-700 dark:text-slate-300 block text-[10px] font-semibold">Confidence</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {(det.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-700 dark:text-slate-300 block text-[10px] font-semibold">Risk Score</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {det.risk_score}
                        </span>
                      </div>
                    </div>

                    {/* Category & Action Callout Box */}
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-1 text-[11px] font-sans">
                      <div className="font-bold text-amber-700 dark:text-amber-400">
                        Category: {getClassConfig(det.class_name).category}
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 leading-snug">
                        <b>Recommended Action:</b> {getClassConfig(det.class_name).recommended_action}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-ocean-600 dark:text-tealAccent-400" />
                        <span>{det.lat.toFixed(4)}°, {det.lon.toFixed(4)}° (Estimated)</span>
                      </div>
                      <StatusBadge status={det.status} />
                    </div>
                  </div>
                );
              })}
            </CardContent>

          </Card>
        </div>

      </div>

    </div>
  );
}
