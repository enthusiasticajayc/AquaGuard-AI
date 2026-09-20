export const CLASS_CONFIG = {
  mine_cylinder: {
    label: "Mine-like object (unverified)",
    category: "Explosive hazard",
    recommended_action: "Do not approach or disturb. Report to the Navy / EOD authority.",
    severity: 1.00,
    color: "#DC2626",
    badgeBg: "bg-red-600/10 text-red-600 dark:text-red-400 border-red-600/30",
    description: "Critical underwater explosive hazard or naval mine contact."
  },
  ghost_net: {
    label: "Ghost Fishing Net",
    category: "Ecological hazard",
    recommended_action: "Schedule recovery by an authorised cleanup team.",
    severity: 0.95,
    color: "#EF4444",
    badgeBg: "bg-red-500/10 text-red-500 border-red-500/20",
    description: "Abandoned, lost or discarded fishing gear (ALDFG) trapping marine life."
  },
  shipwreck: {
    label: "Submerged Shipwreck",
    category: "Navigation obstruction",
    recommended_action: "Update navigation charts; assess heritage value before any intervention.",
    severity: 0.80,
    color: "#F97316",
    badgeBg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    description: "Submerged vessel hull posing navigation risk and structural obstruction."
  },
  submarine_pipeline: {
    label: "Submarine Pipeline",
    category: "Infrastructure",
    recommended_action: "Cross-check with known asset records; inspect only if damage or exposure is suspected.",
    severity: 0.85,
    color: "#8B5CF6",
    badgeBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Subsea oil, gas, or industrial pipeline infrastructure."
  }
};

export function getClassConfig(clsName) {
  if (!clsName) return CLASS_CONFIG.ghost_net;
  const key = clsName.toLowerCase().replace(/[\s-]/g, '_');
  
  // Legacy alias mappings
  if (key === 'ghost_net_fishing_gear') return CLASS_CONFIG.ghost_net;
  
  return CLASS_CONFIG[key] || {
    label: clsName.replace(/_/g, ' ').toUpperCase(),
    category: "Unclassified Hazard",
    recommended_action: "Inspect anomaly and cross-check with hydrographic database.",
    severity: 0.50,
    color: "#6B7280",
    badgeBg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    description: "Detected target hazard."
  };
}

export const RISK_LEVELS = {
  Critical: {
    color: "#EF4444",
    bgClass: "bg-red-500/10 text-red-500 border-red-500/20",
    markerColor: "#EF4444",
    threshold: 0.75,
    description: "Immediate high-risk hazard requiring prioritized marine authority action."
  },
  High: {
    color: "#F97316",
    bgClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    markerColor: "#F97316",
    threshold: 0.60,
    description: "Significant hazard requiring verification and cleanup scheduling."
  },
  Medium: {
    color: "#F59E0B",
    bgClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    markerColor: "#F59E0B",
    threshold: 0.40,
    description: "Moderate hazard under monitoring by survey team."
  },
  Low: {
    color: "#22C55E",
    bgClass: "bg-green-500/10 text-green-500 border-green-500/20",
    markerColor: "#22C55E",
    threshold: 0.0,
    description: "Minor anomaly or low-density seabed feature."
  }
};

export const RISK_FORMULA_EXPLANATION = `
Risk Score Calculation Formula:
risk_score = (confidence × 0.40) + (class_severity × 0.45) + (relative_area_factor × 0.15)

• DRISHTI-SSS Severity Weights: Mine-like Object (1.00), Ghost Net (0.95), Submarine Pipeline (0.85), Shipwreck (0.80).
• Category & Action: Includes category hazard classification and recommended intervention instructions.
• Position Coordinates: All GPS positions derived from sonar origins carry the "Estimated" status tag.
• Risk Levels: Critical (≥0.75), High (≥0.60), Medium (≥0.40), Low (<0.40).
`;
