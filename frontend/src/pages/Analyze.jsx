import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSurvey } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Tooltip } from '../components/ui/Tooltip';
import { RISK_FORMULA_EXPLANATION } from '../config/riskConfig';
import {
  UploadCloud,
  FileImage,
  Sliders,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Play,
  Sparkles,
  MapPin
} from 'lucide-react';

const steps = [
  { title: 'Preprocess', desc: 'Applying OpenCV Lee Speckle Filter & CLAHE contrast enhancement' },
  { title: 'Detect', desc: 'Executing YOLOv11 deep learning neural network on sonar tiles' },
  { title: 'Filter', desc: 'Calculating risk severity scores & applying confidence thresholding' },
  { title: 'Geo-tag', desc: 'Mapping bounding box pixel coordinates to SRID 4326 GPS bounds' }
];

export default function Analyze() {
  const navigate = useNavigate();
  
  // Form State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [surveyName, setSurveyName] = useState('Offshore Sonar Scan - Arabian Sea');
  const [surveyDate, setSurveyDate] = useState(new Date().toISOString().split('T')[0]);
  const [sonarType, setSonarType] = useState('EdgeTech 4200 Dual-Frequency SSS');
  const [startLat, setStartLat] = useState('18.9220');
  const [startLon, setStartLon] = useState('72.8347');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.50);
  const [alreadyPreprocessed, setAlreadyPreprocessed] = useState(false);
  
  // Stepper State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Preprocess, 2: Detect, 3: Filter, 4: Geo-tag, 5: Complete
  const [errorMsg, setErrorMsg] = useState(null);

  const checkDatasetFilename = (filename) => {
    if (!filename) return false;
    const fn = filename.toLowerCase();
    return fn.startsWith('synth_') || fn.startsWith('pipe_') || fn.startsWith('wrecka_') || fn.startsWith('wreckr_') || fn.startsWith('mine_') || fn.startsWith('bg_') || fn.includes('drishti');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      if (checkDatasetFilename(selected.name)) {
        setAlreadyPreprocessed(true);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      if (checkDatasetFilename(selected.name)) {
        setAlreadyPreprocessed(true);
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setErrorMsg(null);
    setIsProcessing(true);
    setCurrentStep(1); // Preprocess active

    let timer2, timer3, timer4;

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        const dummyBlob = new Blob(["sample sonar image"], { type: "image/jpeg" });
        formData.append('file', dummyBlob, "sample_sonar.jpg");
      }
      formData.append('name', surveyName);
      formData.append('date', surveyDate);
      formData.append('sonar_type', sonarType);
      formData.append('start_lat', startLat);
      formData.append('start_lon', startLon);
      formData.append('confidence_threshold', confidenceThreshold.toString());
      formData.append('already_preprocessed', alreadyPreprocessed ? 'true' : 'false');

      // Trigger backend request
      const createPromise = createSurvey(formData);

      // Smooth step transitions while backend processes
      timer2 = setTimeout(() => setCurrentStep(2), 250); // Step 2: Detect
      timer3 = setTimeout(() => setCurrentStep(3), 500); // Step 3: Filter
      timer4 = setTimeout(() => setCurrentStep(4), 750); // Step 4: Geo-tag

      // Wait for backend to complete full pipeline
      const result = await createPromise;

      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      // All pipeline steps complete - set step to 5 so all 4 steps show green checkmarks!
      setCurrentStep(5);
      setIsProcessing(false);

      setTimeout(() => {
        navigate(`/surveys/${result.id}`);
      }, 400);

    } catch (err) {
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      console.error("Survey creation error:", err);
      setErrorMsg("Failed to process survey imagery. Please check file format and connection.");
      setIsProcessing(false);
      setCurrentStep(0);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sonar Image Intake & AI Pipeline
        </h1>
        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
          Upload Side-Scan Sonar (SSS) imagery for automated OpenCV preprocessing and YOLOv11 hazard detection
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* File Upload Zone */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <UploadCloud className="w-4 h-4 text-ocean-600 dark:text-tealAccent-400" />
                <span>Side-Scan Sonar (SSS) Image Dropzone</span>
              </CardTitle>
              <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold">PNG, JPG, TIFF (Max 50MB)</span>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-navy-700 hover:border-tealAccent-500/70 rounded-xl p-8 text-center bg-slate-50 dark:bg-navy-950/50 transition flex flex-col items-center justify-center min-h-[220px]"
              >
                {previewUrl ? (
                  <div className="space-y-3 w-full">
                    <img
                      src={previewUrl}
                      alt="Sonar Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain block border border-slate-300 dark:border-navy-800 shadow"
                    />
                    <div className="text-xs font-mono text-ocean-700 dark:text-tealAccent-400 font-bold">
                      {file ? file.name : "Sample Sonar Waterfall Matrix"} Loaded
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-tealAccent-500/10 border border-tealAccent-500/20 flex items-center justify-center mx-auto text-ocean-600 dark:text-tealAccent-400">
                      <FileImage className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Drag & Drop Side-Scan Sonar Image Here
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">or click to browse local hydrographic survey files</p>
                    </div>
                    <label className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-700 text-white cursor-pointer transition border border-slate-700 dark:border-navy-700">
                      <span>Browse Sonar Files</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stepper Display */}
          {currentStep > 0 && (
            <Card className="border-tealAccent-500/30 bg-navy-900 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Sparkles className="w-4 h-4 text-tealAccent-400" />
                  <span>Pipeline Execution Stepper</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((st, idx) => {
                  const stepNum = idx + 1;
                  const isDone = currentStep > stepNum;
                  const isCurrent = currentStep === stepNum;

                  return (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="w-5 h-5 text-tealAccent-400 animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-navy-700 flex items-center justify-center text-[10px] text-slate-300 font-mono font-bold">
                            {stepNum}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-bold ${isCurrent ? 'text-tealAccent-400' : isDone ? 'text-emerald-400' : 'text-slate-200'}`}>
                          Step {stepNum}: {st.title}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5 font-medium">{st.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

        </div>

        {/* Survey Metadata Controls */}
        <div className="space-y-6">
          
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Survey Metadata Intake</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Survey Name
                </label>
                <input
                  type="text"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealAccent-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Survey Date
                </label>
                <input
                  type="date"
                  value={surveyDate}
                  onChange={(e) => setSurveyDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealAccent-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Sonar Equipment Model
                </label>
                <select
                  value={sonarType}
                  onChange={(e) => setSonarType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-tealAccent-500 outline-none"
                >
                  <option value="EdgeTech 4200 Dual-Frequency SSS">EdgeTech 4200 Dual-Frequency SSS</option>
                  <option value="Klein 4900 Multi-Beam Sonar">Klein 4900 Multi-Beam Sonar</option>
                  <option value="DeepVision Side-Scan Sonar 680kHz">DeepVision Side-Scan Sonar 680kHz</option>
                  <option value="Standard High-Res SSS Waterfall">Standard High-Res SSS Waterfall</option>
                </select>
              </div>

              {/* Start Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-ocean-600 dark:text-tealAccent-400" />
                    <span>Start Lat (°N)</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={startLat}
                    onChange={(e) => setStartLat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-ocean-600 dark:text-tealAccent-400" />
                    <span>Start Lon (°E)</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={startLon}
                    onChange={(e) => setStartLon(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Confidence Threshold Slider */}
              <div className="pt-2 border-t border-slate-200 dark:border-navy-800">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1">
                    <Sliders className="w-3.5 h-3.5 text-ocean-600 dark:text-tealAccent-400" />
                    <span>Confidence Threshold</span>
                  </label>
                  <span className="font-mono font-bold text-ocean-700 dark:text-tealAccent-400">
                    {(confidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-ocean-600"
                />
                <div className="flex justify-between text-[10px] text-slate-800 dark:text-slate-200 font-mono font-bold mt-1">
                  <span>10% (High Recall)</span>
                  <Tooltip text={RISK_FORMULA_EXPLANATION} />
                  <span>95% (High Precision)</span>
                </div>
              </div>

              {/* Already Preprocessed Dataset Tile Checkbox (Requirement 2) */}
              <div className="pt-3 border-t border-slate-200 dark:border-navy-800 space-y-1">
                <label className="flex items-start space-x-2 font-bold text-slate-900 dark:text-slate-100 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="already-preprocessed-checkbox"
                    checked={alreadyPreprocessed}
                    onChange={(e) => setAlreadyPreprocessed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-ocean-600 rounded border-slate-300 dark:border-navy-700 focus:ring-tealAccent-500"
                  />
                  <span>Image is already a preprocessed dataset tile</span>
                </label>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal pl-6">
                  Skips OpenCV CLAHE + Lee despeckle filter to prevent double-processing on DRISHTI dataset tiles.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-300 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl font-bold text-xs bg-ocean-600 hover:bg-ocean-700 text-white shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Process Sonar Imagery</span>
                  </>
                )}
              </button>

            </CardContent>
          </Card>

        </div>

      </form>

    </div>
  );
}
