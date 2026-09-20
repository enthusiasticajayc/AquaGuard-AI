import React, { useEffect, useState } from 'react';
import { fetchResearchMetrics } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BookOpen, ExternalLink, Cpu, ShieldCheck, BarChart3, FileText, AlertCircle, Info } from 'lucide-react';

const researchItems = [
  {
    type: 'PAPER',
    title: 'DRISHTI: AI-Powered Marine Debris Detection from Side-Scan Sonar',
    authors: 'Rehan Fazal et al. (Tech Galacticos)',
    year: '2026',
    journal: 'Smart India Hackathon 2026 (Problem Statement 26057)',
    desc: 'Demonstrates contrast-limited adaptive histogram equalization (CLAHE) combined with YOLOv11 for high-recall ghost net, mine cylinder, pipeline, and shipwreck detection in side-scan sonar imagery.',
    link: 'https://github.com/Rehan9599/Sonar-Drishti'
  },
  {
    type: 'DATASET',
    title: 'DRISHTI-SSS Side-Scan Sonar Benchmark (5,205 Annotated Tiles)',
    authors: 'NOAA, Zenodo, SubPipe & Kaggle MILCO Repositories',
    year: '2026',
    journal: 'HuggingFace Open Science Dataset (rehan9599/drishti-sss)',
    desc: 'Curated benchmark of 5,205 annotated side-scan sonar image tiles (3,875 train / 630 val / 700 test) featuring abandoned fishing nets, shipwrecks, naval mines, subsea pipelines, and seabed anomalies.',
    link: 'https://huggingface.co/datasets/rehan9599/drishti-sss'
  }
];

export default function Research() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      const data = await fetchResearchMetrics();
      setMetrics(data);
      setLoading(false);
    }
    loadMetrics();
  }, []);

  const hasMetrics = metrics && metrics.exists !== false && metrics.precision !== undefined;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-navy-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-ocean-600 dark:text-tealAccent-400" />
          <span>DRISHTI-SSS Benchmark & YOLOv11 Model Performance</span>
        </h1>
        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-medium">
          Official metrics, license, citations, and evaluation results evaluated on the 700-image TEST split.
        </p>
      </div>

      {/* Model Evaluation Card (Pending Panel vs Real Metrics) */}
      <Card className="border-tealAccent-500/40 shadow-lg overflow-hidden">
        <CardHeader className="bg-slate-100 dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2 font-bold">
            <Cpu className="w-4 h-4 text-ocean-600 dark:text-tealAccent-400" />
            <span>YOLOv11 Model Evaluation</span>
          </CardTitle>
          {hasMetrics ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-teal-800 dark:text-tealAccent-300 font-bold bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/30">
                {metrics.profile || 'Model'} model ({[
                  metrics.model_name,
                  metrics.imgsz ? `${metrics.imgsz}px` : null,
                  metrics.epochs !== undefined ? `${metrics.epochs} epochs` : null,
                  metrics.fraction !== undefined ? `${(metrics.fraction * 100).toFixed(0)}% of training data` : null
                ].filter(Boolean).join(', ')})
              </span>
              <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                Evaluated on {metrics.test_images_count || 700} TEST Images
              </span>
              <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-navy-800 px-2.5 py-1 rounded border border-slate-300 dark:border-navy-700">
                {metrics.training_date || '2026-09-20'}
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-teal-800 dark:text-tealAccent-300 font-bold bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/30">
              Evaluation pending
            </span>
          )}
        </CardHeader>
        <CardContent className="p-5 space-y-6">
          
          {!hasMetrics ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-teal-500/30 space-y-6">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-navy-800">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-ocean-600 dark:text-tealAccent-400" />
                      <span>YOLOv11 Model Evaluation</span>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Model evaluation lifecycle tracking and DRISHTI-SSS benchmark dataset facts
                    </p>
                  </div>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-800 dark:text-tealAccent-300 border border-teal-500/30">
                    <Info className="w-3.5 h-3.5 text-teal-600 dark:text-tealAccent-400" />
                    <span>Evaluation in progress</span>
                  </span>
                </div>

                {/* 4-Step Tracker Bar */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    Model Evaluation Progress Tracker
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-900 dark:text-emerald-300 text-[11px]">Step 1: Dataset Audit</div>
                        <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-semibold">Completed (5,205 tiles)</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-start space-x-2.5">
                      <Cpu className="w-4 h-4 text-teal-600 dark:text-tealAccent-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-teal-900 dark:text-tealAccent-300 text-[11px]">Step 2: CPU-Lite Training</div>
                        <div className="text-[10px] text-teal-700/80 dark:text-tealAccent-300/80 font-semibold">Completed / In Progress</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 flex items-start space-x-2.5 opacity-80">
                      <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-300 text-[11px]">Step 3: Test Evaluation</div>
                        <div className="text-[10px] text-slate-700 dark:text-slate-400">Pending Execution</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 flex items-start space-x-2.5 opacity-80">
                      <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-300 text-[11px]">Step 4: Results Published</div>
                        <div className="text-[10px] text-slate-700 dark:text-slate-400">Pending Execution</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Real Dataset Facts Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-700 dark:text-slate-300 block">Total Benchmark Tiles</span>
                    <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">5,205 Tiles</p>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold block mt-0.5">3,875 Train / 630 Val / 700 Test</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-700 dark:text-slate-300 block">Target Hazard Classes</span>
                    <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">4 Active Classes</p>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold block mt-0.5">Pipeline, Shipwreck, Net, Mine</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-700 dark:text-slate-300 block">Tile Resolution Standard</span>
                    <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">640x640 Tile Standard</p>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold block mt-0.5">Overlapping Multi-Scale Swaths</span>
                  </div>
                </div>

                {/* Class Distribution Table */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    DRISHTI-SSS Dataset Class Instance Distribution
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-navy-900 text-slate-900 dark:text-slate-100 font-mono font-bold border-b border-slate-200 dark:border-navy-800">
                        <tr>
                          <th className="p-2.5">Target Object Class</th>
                          <th className="p-2.5">Train Split</th>
                          <th className="p-2.5">Val Split</th>
                          <th className="p-2.5">Test Split</th>
                          <th className="p-2.5">Total Instances</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-navy-800 font-mono">
                        <tr className="hover:bg-slate-100/50 dark:hover:bg-navy-800/40">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white font-sans">Submarine Pipeline</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">1,000</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">147</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">174</td>
                          <td className="p-2.5 font-bold text-teal-700 dark:text-tealAccent-400">1,321</td>
                        </tr>
                        <tr className="hover:bg-slate-100/50 dark:hover:bg-navy-800/40">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white font-sans">Submerged Shipwreck</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">1,554</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">544</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">525</td>
                          <td className="p-2.5 font-bold text-teal-700 dark:text-tealAccent-400">2,623</td>
                        </tr>
                        <tr className="hover:bg-slate-100/50 dark:hover:bg-navy-800/40">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white font-sans">Ghost Fishing Net</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">900</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">120</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">120</td>
                          <td className="p-2.5 font-bold text-teal-700 dark:text-tealAccent-400">1,140</td>
                        </tr>
                        <tr className="hover:bg-slate-100/50 dark:hover:bg-navy-800/40">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white font-sans">Mine-like object (unverified)</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">843</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">93</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">82</td>
                          <td className="p-2.5 font-bold text-teal-700 dark:text-tealAccent-400">1,018</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* One line explanation */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-950 dark:text-blue-200 text-xs font-medium">
                  Evaluation runs on the held-out 700-image test split. Results appear here automatically when available.
                </div>

                {/* Collapsed Developer Notes Section (Only in DEV) */}
                {import.meta.env.DEV && (
                  <details className="pt-2 border-t border-slate-200 dark:border-navy-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <summary className="cursor-pointer font-bold hover:text-slate-800 dark:hover:text-slate-200 select-none">
                      Developer notes (Local Training & Evaluation Commands)
                    </summary>
                    <div className="mt-2 p-3 rounded-lg bg-slate-900 text-slate-200 space-y-1">
                      <div><code className="text-tealAccent-400">python backend/ml/train.py --profile cpu --epochs 12</code></div>
                      <div><code className="text-tealAccent-400">python backend/ml/evaluate.py</code></div>
                    </div>
                  </details>
                )}

              </div>
            </div>
          ) : (
            <>
              {/* 4 Main Benchmark Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-tealAccent-500/10 border border-tealAccent-500/30 text-center">
                  <span className="text-[11px] font-mono font-bold text-tealAccent-800 dark:text-tealAccent-300 uppercase block">Precision</span>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                    {(metrics.precision * 100).toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 block mt-1 font-semibold">True Positives / Total Positives</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                  <span className="text-[11px] font-mono font-bold text-blue-800 dark:text-blue-300 uppercase block">Recall</span>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                    {(metrics.recall * 100).toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 block mt-1 font-semibold">True Positives / Actual Hazards</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
                  <span className="text-[11px] font-mono font-bold text-purple-800 dark:text-purple-300 uppercase block">mAP @ 0.50</span>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                    {(metrics.map50 * 100).toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 block mt-1 font-semibold">Mean Average Precision (IoU 0.50)</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 uppercase block">mAP @ 0.50-0.95</span>
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                    {(metrics.map50_95 * 100).toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 block mt-1 font-semibold">Strict Multi-IoU Benchmark</span>
                </div>
              </div>

              {/* Per-Class AP50 Breakdown Table (Excluding crab_pot) */}
              {metrics.per_class_ap50 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    DRISHTI-SSS Target Class Average Precision (AP@50)
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-navy-800">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 dark:bg-navy-900 text-slate-900 dark:text-slate-100 font-mono font-bold border-b border-slate-200 dark:border-navy-800">
                        <tr>
                          <th className="p-3">Target Object Class</th>
                          <th className="p-3">AP @ 0.50</th>
                          <th className="p-3">Severity Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
                        {Object.entries(metrics.per_class_ap50)
                          .filter(([cls]) => cls !== 'crab_pot' && cls !== 'person')
                          .map(([cls, val]) => (
                            <tr key={cls} className="hover:bg-slate-50 dark:hover:bg-navy-800/40">
                              <td className="p-3 font-semibold text-slate-900 dark:text-white capitalize">
                                {cls === 'mine_cylinder' ? 'Mine-like object (unverified)' : cls.replace(/_/g, ' ')}
                              </td>
                              <td className="p-3 font-mono font-bold text-teal-700 dark:text-tealAccent-400">{(val * 100).toFixed(1)}%</td>
                              <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                                {cls === 'mine_cylinder' ? '1.00 (Critical)' : cls === 'ghost_net' ? '0.95 (High)' : cls === 'submarine_pipeline' ? '0.85 (High)' : '0.80'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Confusion Matrix Display */}
              <div className="pt-2 border-t border-slate-200 dark:border-navy-800 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  YOLOv11 Model Confusion Matrix (Test Split Evaluation)
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-center">
                  <img
                    src="/model/confusion_matrix.png"
                    alt="YOLOv11 Model Confusion Matrix"
                    className="max-h-80 object-contain rounded-lg border border-slate-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </>
          )}

        </CardContent>
      </Card>

      {/* Honest Data Notes Box (Requirement 5) */}
      <Card className="border-blue-500/40 bg-blue-500/5 shadow-md">
        <CardHeader className="bg-slate-100 dark:bg-navy-900 py-3.5 border-b border-slate-200 dark:border-navy-800">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2 font-bold">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>DRISHTI-SSS Data Notes & Experimental Scope</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-2.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
          <ul className="list-disc pl-5 space-y-1.5 font-medium">
            <li>
              <b>Ghost Net Synthetic Generation:</b> All <code className="font-mono text-teal-600 dark:text-tealAccent-400">ghost_net</code> target examples in DRISHTI-SSS are 100% synthetic acoustic generations created via procedural modeling because no public field side-scan sonar ghost-net dataset currently exists.
            </li>
            <li>
              <b>Upstream Dataset Provenance:</b> Sonar tiles are assembled from four open source hydrographic datasets: <b>SubPipe / SubPipeMini2</b> (OceanScan-MST, CC-BY-4.0), <b>AI4Shipwrecks</b> (UM Robotics / NOAA, CC-BY-4.0), <b>Roboflow Side-Scan Sonar</b> (CC-BY-4.0), and <b>Sonar Imaging Mine Detection</b> (MILCO, CC-BY-SA-4.0).
            </li>
            <li>
              <b>Evaluation Boundary:</b> Performance metrics are computed on a held-out test split of the DRISHTI-SSS dataset and may not directly reflect detection performance on uncalibrated sonar hardware or novel survey regions.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Dataset License & Citation Section */}
      <Card className="border-navy-700 shadow-md">
        <CardHeader className="bg-slate-100 dark:bg-navy-900 py-3.5">
          <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Dataset License & Academic Citation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs">
            <b>License:</b> Creative Commons Attribution-ShareAlike 4.0 International (<b>CC-BY-SA-4.0</b>).
            Attribution credited to SubPipeMini2, AI4Shipwrecks, Roboflow SSS, and Kaggle MILCO.
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase block">BibTeX Citation:</span>
            <pre className="p-4 rounded-xl bg-slate-950 text-tealAccent-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
{`@software{drishti2026,
  title  = {DRISHTI: AI-Powered Marine Debris Detection from Side-Scan Sonar},
  author = {Fazal, Rehan and others},
  year   = {2026},
  note   = {Smart India Hackathon 2026, Problem Statement 26057},
  url    = {https://github.com/Rehan9599/Sonar-Drishti}
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
