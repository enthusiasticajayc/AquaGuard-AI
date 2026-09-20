import React, { useEffect, useState } from 'react';
import { fetchDetections, verifyDetection, getImageUrl } from '../services/api';

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from '../components/ui/Card';
import { RiskBadge, ClassBadge, StatusBadge } from '../components/ui/Badge';
import { RISK_LEVELS, getClassConfig } from '../config/riskConfig';
import {
  Flame,
  MapPin
} from 'lucide-react';

function createRiskIcon(riskLevel) {
  const color = RISK_LEVELS[riskLevel]?.color || '#F59E0B';
  const svg = `<svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.26801 0 0 6.26801 0 14C0 24.5 14 34 14 34C14 34 28 24.5 28 14C28 6.26801 21.732 0 14 0Z" fill="${color}" fill-opacity="0.95" stroke="#0B1F33" stroke-width="2"/>
    <circle cx="14" cy="14" r="5" fill="#FFFFFF"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 34],
    iconAnchor: [14, 34],
    popupAnchor: [0, -30]
  });
}

export default function GISMap() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [minConf, setMinConf] = useState(0.50);
  
  // Map toggles
  const [tileLayerUrl, setTileLayerUrl] = useState('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    loadDetections();
  }, [selectedClass, selectedRisk, selectedStatus, minConf]);

  async function loadDetections() {
    setLoading(true);
    const data = await fetchDetections({
      class_name: selectedClass,
      risk_level: selectedRisk,
      status: selectedStatus,
      min_confidence: minConf
    });
    setDetections(data);
    setLoading(false);
  }

  const handleVerify = async (id, action) => {
    await verifyDetection(id, action);
    loadDetections();
  };

  const mapCenter = [18.9220, 72.8347];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Map Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-navy-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-ocean-600 dark:text-tealAccent-400" />
            <span>GIS Control Map (SRID 4326)</span>
          </h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
            Real-time hydrographic survey spatial map with risk markers and hazard density overlays
          </p>
        </div>

        {/* Multi-Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 mb-0.5">Hazard Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-semibold outline-none"
            >
              <option value="all">All Classes (4 Target Types)</option>
              <option value="mine_cylinder">Mine-like object (unverified)</option>
              <option value="ghost_net">Ghost Fishing Net</option>
              <option value="shipwreck">Submerged Shipwreck</option>
              <option value="submarine_pipeline">Submarine Pipeline</option>
            </select>

          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 mb-0.5">Risk Severity</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-semibold outline-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Low">Low Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 mb-0.5">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white font-semibold outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Map Layer Switcher & Heatmap Toggle */}
          <div className="flex items-center space-x-2 pt-3">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
                showHeatmap ? 'bg-orange-500/20 text-orange-950 dark:text-orange-300 border border-orange-500/40' : 'bg-slate-200 dark:bg-navy-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-navy-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Density Heatmap</span>
            </button>

            <button
              onClick={() => setTileLayerUrl(
                tileLayerUrl.includes('dark') 
                  ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' 
                  : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              )}
              className="px-3 py-1.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 text-white font-bold transition shadow-sm"
            >
              Toggle Map Style
            </button>
          </div>

        </div>
      </div>

      {/* Main Map Canvas */}
      <Card className="overflow-hidden border-slate-200 dark:border-navy-800 shadow-xl">
        <CardContent className="p-0 relative min-h-[380px] sm:min-h-[580px]">
          
          <MapContainer
            center={mapCenter}
            zoom={6}
            className="h-[380px] sm:h-[580px] w-full z-10"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
              url={tileLayerUrl}
            />

            {showHeatmap && detections.map((det) => (
              <CircleMarker
                key={`heat-${det.id}`}
                center={[det.lat, det.lon]}
                radius={det.risk_score * 35}
                pathOptions={{
                  fillColor: RISK_LEVELS[det.risk_level]?.color || '#EF4444',
                  fillOpacity: 0.30,
                  stroke: false
                }}
              />
            ))}

            {detections.map((det) => (
              <Marker
                key={det.id}
                position={[det.lat, det.lon]}
                icon={createRiskIcon(det.risk_level)}
              >
                <Popup className="w-64">
                  <div className="space-y-2 p-1 font-sans text-xs text-white">
                    <div className="flex items-center justify-between border-b border-navy-700 pb-1.5">
                      <ClassBadge classNameKey={det.class_name} />
                      <RiskBadge level={det.risk_level} />
                    </div>

                    <img
                      src={getImageUrl(det.thumbnail_path || det.image_path)}
                      alt="Hazard Acoustic Crop"
                      className="w-full h-20 object-cover rounded border border-navy-700 my-1.5"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/samples/sample_mumbai_raw.jpg";
                      }}
                    />


                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-200">
                      <div>Conf: <b className="text-white">{(det.confidence * 100).toFixed(1)}%</b></div>
                      <div>Risk: <b className="text-white">{det.risk_score}</b></div>
                      <div className="col-span-2">
                        Position (Estimated): <b className="text-white">{det.lat.toFixed(4)}°N, {det.lon.toFixed(4)}°E</b>
                      </div>
                    </div>

                    {/* Category & Action */}
                    <div className="p-2 rounded bg-navy-950/80 border border-navy-800 space-y-1 text-[10px]">
                      <div className="font-bold text-amber-400">
                        Category: {getClassConfig(det.class_name).category}
                      </div>
                      <div className="text-slate-300 leading-tight">
                        <b>Action:</b> {getClassConfig(det.class_name).recommended_action}
                      </div>
                    </div>


                    <div className="pt-2 border-t border-navy-700 flex items-center justify-between">
                      <StatusBadge status={det.status} />
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleVerify(det.id, 'confirm')}
                          className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleVerify(det.id, 'reject')}
                          className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>

          {/* Map Floating Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-navy-900/95 backdrop-blur border border-navy-800 rounded-xl p-3 text-xs space-y-1.5 shadow-lg text-white font-mono">
            <div className="font-bold text-tealAccent-400 text-[11px] uppercase tracking-wider mb-1">
              GIS Hazard Risk Scale
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <span>Critical (≥0.75)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
              <span>High (≥0.60)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span>Medium (≥0.40)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span>Low (&lt;0.40)</span>
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
