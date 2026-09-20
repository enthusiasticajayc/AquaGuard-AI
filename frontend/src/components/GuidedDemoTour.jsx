import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Upload,
  Eye,
  MapPin,
  CheckSquare,
  FileText,
  Compass,
  Zap,
  Info
} from 'lucide-react';

export const DEMO_STEPS = [
  {
    id: 'upload',
    stepNumber: 1,
    title: 'Sonar Image Ingestion & OpenCV Preprocessing',
    badge: 'Stage 1: Upload',
    path: '/analyze',
    icon: Upload,
    color: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    description: 'Upload side-scan sonar image tiles (EdgeTech / Klein format). The pipeline enhances acoustic shadows and contrast using OpenCV CLAHE before feeding frames into YOLOv11.',
    judgeNotes: 'Observe how acoustic noise is filtered and sonar contrast enhanced before AI model inference.',
    seededActionLabel: 'Run Seeded Upload Pipeline',
    sampleSurveyId: null
  },
  {
    id: 'detection',
    stepNumber: 2,
    title: 'YOLOv11 Bounding Box Detection & Analysis',
    badge: 'Stage 2: AI Detection',
    path: '/surveys/surv-mumbai-001',
    icon: Eye,
    color: 'from-teal-600 to-cyan-600',
    borderColor: 'border-tealAccent-500',
    textColor: 'text-teal-600 dark:text-tealAccent-400',
    bgColor: 'bg-teal-500/10',
    description: 'YOLOv11 neural network inspects sonar tiles to locate ghost nets, shipwrecks, scrap debris, and seabed anomalies with 92.0% precision.',
    judgeNotes: 'Toggle between Raw and Preprocessed imagery. Click bounding boxes to inspect confidence scores & acoustic shadow footprints.',
    seededActionLabel: 'Inspect Seeded Detections (Mumbai Scan)',
    sampleSurveyId: 'surv-mumbai-001'
  },
  {
    id: 'map',
    stepNumber: 3,
    title: 'WGS84 Geo-Tagging & GIS Interactive Hazard Map',
    badge: 'Stage 3: GIS Mapping',
    path: '/map',
    icon: MapPin,
    color: 'from-emerald-600 to-teal-600',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: 'Bounding box pixel offsets are converted into WGS84 GPS coordinates (SRID 4326) and plotted on Leaflet maps with color-coded risk markers.',
    judgeNotes: 'Filter hazards by risk severity (Critical, High, Medium, Low) or object class. Click map markers to view thumbnail popups.',
    seededActionLabel: 'Explore Interactive GIS Hazard Map',
    sampleSurveyId: null
  },
  {
    id: 'verification',
    stepNumber: 4,
    title: 'Human-in-the-Loop Expert Verification Queue',
    badge: 'Stage 4: Verification',
    path: '/verify',
    icon: CheckSquare,
    color: 'from-amber-600 to-orange-600',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    description: 'Marine hydrographers & naval operators review AI-flagged hazards to confirm, reject, or reclassify detections before dispatching cleanup teams.',
    judgeNotes: 'Click "Confirm Hazard" or "Reject False Positive" to see live KPI status updates reflected across the dashboard.',
    seededActionLabel: 'Open Verification Triage Queue',
    sampleSurveyId: null
  },
  {
    id: 'report',
    stepNumber: 5,
    title: 'Automated Executive Hydrographic Hazard Report Export',
    badge: 'Stage 5: Report Export',
    path: '/reports',
    icon: FileText,
    color: 'from-purple-600 to-indigo-600',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    description: 'Generate structured hydrographic hazard reports for marine authorities. Export spatial feature datasets as GeoJSON for QGIS/ArcGIS or PDF summaries.',
    judgeNotes: 'Download sample CSV, GeoJSON or printable PDF summary report generated automatically from verified sonar telemetry.',
    seededActionLabel: 'Generate & Download Reports',
    sampleSurveyId: null
  }
];

export default function GuidedDemoTour({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const step = DEMO_STEPS[currentStepIndex];

  // Auto-Play Timer
  useEffect(() => {
    let timer;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentStepIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % DEMO_STEPS.length;
          const nextStep = DEMO_STEPS[nextIndex];
          if (nextStep.path) {
            navigate(nextStep.path);
          }
          return nextIndex;
        });
      }, 6000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, navigate]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      navigate(DEMO_STEPS[nextIdx].path);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      navigate(DEMO_STEPS[prevIdx].path);
    }
  };

  const handleStepClick = (index) => {
    setCurrentStepIndex(index);
    navigate(DEMO_STEPS[index].path);
  };

  const handleNavigateStep = () => {
    navigate(step.path);
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-lg w-[calc(100vw-2rem)] sm:w-[480px] font-sans animate-fadeIn">
      <div className="bg-slate-900/95 dark:bg-navy-950/95 backdrop-blur-md text-white rounded-2xl border-2 border-tealAccent-500/80 shadow-2xl overflow-hidden text-xs">
        
        {/* Header Bar */}
        <div className="bg-slate-800/90 dark:bg-navy-900/90 px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-tealAccent-500/20 text-tealAccent-400 font-bold flex items-center space-x-1.5">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span className="text-xs tracking-wider uppercase">SIH 2026 Guided Demo</span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              100% Offline Seeded Data
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-lg transition text-xs flex items-center space-x-1 ${
                isPlaying
                  ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/50'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
              title={isPlaying ? 'Pause Auto Tour' : 'Auto Play Demo Tour (6s per step)'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
              title={isMinimized ? 'Expand Tour Card' : 'Minimize Tour Card'}
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-600/80 text-slate-300 hover:text-white transition"
              title="Close Guided Demo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          {DEMO_STEPS.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={s.id}
                onClick={() => handleStepClick(idx)}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono font-bold transition flex items-center justify-center space-x-1 border whitespace-nowrap ${
                  isActive
                    ? 'bg-tealAccent-500 text-navy-950 border-tealAccent-400 shadow'
                    : isCompleted
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{s.stepNumber}.</span>
                <span className="hidden sm:inline">{s.badge.split(': ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Content Body */}
        {!isMinimized && (
          <div className="p-4 space-y-3.5">
            {/* Step Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2.5 rounded-xl bg-slate-800 border ${step.borderColor} text-tealAccent-400 shadow-md`}>
                  <StepIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${step.textColor}`}>
                    {step.badge}
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {step.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              {step.description}
            </p>

            {/* Judge Guidance Callout Box */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-[11px] text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Judge Evaluation Focus:</span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-normal">
                {step.judgeNotes}
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-1">
              <button
                onClick={handleNavigateStep}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-ocean-600 via-teal-600 to-tealAccent-500 hover:opacity-95 text-white shadow-lg transition flex items-center justify-center space-x-2 group"
              >
                <Zap className="w-4 h-4 text-tealAccent-300 group-hover:animate-bounce" />
                <span>{step.seededActionLabel}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/90 text-xs">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-bold transition flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="font-mono text-[11px] text-slate-400">
                Step <b className="text-white">{currentStepIndex + 1}</b> of <b className="text-white">{DEMO_STEPS.length}</b>
              </span>

              <button
                onClick={handleNext}
                disabled={currentStepIndex === DEMO_STEPS.length - 1}
                className="px-3 py-1.5 rounded-lg bg-tealAccent-500 hover:bg-tealAccent-400 text-navy-950 font-bold transition flex items-center space-x-1 shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next Stage</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
