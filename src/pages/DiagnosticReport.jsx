import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, AlertTriangle, CheckCircle, XCircle, ExternalLink,
  Wrench, MapPin, Youtube, Activity, Shield, Gauge
} from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SEVERITY_COLORS = {
  Low: 'bg-green-900/30 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
  High: 'bg-orange-900/30 text-orange-400 border-orange-500/30',
  Critical: 'bg-red-900/30 text-red-400 border-red-500/30',
};

const RISK_CONFIG = {
  'Operational': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20 border-green-500/30' },
  'Restricted Operation': { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-500/30' },
  'Immediate Shutdown Required': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/20 border-red-500/30' },
};

export default function DiagnosticReport() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/scans/${scanId}`)
      .then(res => { setScan(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [scanId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64" data-testid="report-loading">
      <Activity className="w-6 h-6 text-[#D4AF37] animate-pulse" />
    </div>
  );

  if (!scan) return (
    <div className="text-center py-20" data-testid="report-not-found">
      <p className="text-zinc-500">Diagnostic report not found</p>
      <button onClick={() => navigate('/scan')} className="mt-4 btn-gold-shimmer px-6 py-2 text-xs">New Scan</button>
    </div>
  );

  const d = scan.diagnostic || {};
  const health = d.health_index || {};
  const risk = RISK_CONFIG[d.risk_status] || RISK_CONFIG['Restricted Operation'];
  const RiskIcon = risk.icon;
  const vehicleType = d.vehicle_classification?.type || 'Vehicle';
  const issues = d.detected_issues || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} data-testid="diagnostic-report">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} data-testid="back-btn" className="w-9 h-9 border border-zinc-800 flex items-center justify-center hover:border-[#D4AF37]/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <div>
          <span className="mono-label">Diagnostic Report</span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {vehicleType} — <span className="text-[#D4AF37]">{d.system_area || 'General Analysis'}</span>
          </h1>
        </div>
      </div>

      {/* Risk Status Banner */}
      <div className={`p-4 border flex items-center gap-3 mb-8 ${risk.bg}`} data-testid="risk-status-banner">
        <RiskIcon className={`w-5 h-5 ${risk.color}`} />
        <div>
          <p className={`text-sm font-bold uppercase tracking-wider ${risk.color}`}>{d.risk_status || 'N/A'}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{d.condition_summary || ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Classification */}
          <div className="glass-panel p-6" data-testid="vehicle-classification">
            <p className="mono-label mb-3">Target Classification</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">{d.vehicle_classification?.type || 'N/A'}</p>
                <p className="text-sm text-zinc-400">{d.vehicle_classification?.make_model_estimate || ''}</p>
              </div>
              <div className="text-right">
                <p className="mono-label">Confidence</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{d.vehicle_classification?.confidence_percent || 0}%</p>
              </div>
            </div>
          </div>

          {/* Detected Issues */}
          <div className="glass-panel p-6" data-testid="detected-issues">
            <p className="mono-label mb-4">Detected Issues ({issues.length})</p>
            {issues.length === 0 ? (
              <p className="text-sm text-zinc-500">No issues detected</p>
            ) : (
              <div className="space-y-4">
                {issues.map((issue, i) => (
                  <div key={i} className="border border-zinc-800/50 p-4 hover:border-zinc-700 transition-colors" data-testid={`issue-${i}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">{issue.issue_name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 border ${SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.Medium}`}>
                          {issue.severity}
                        </span>
                        <span className="mono-label">{issue.confidence_percent}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mb-1"><span className="text-zinc-600">Evidence:</span> {issue.mechanical_evidence}</p>
                    <p className="text-xs text-zinc-400"><span className="text-zinc-600">Root Cause:</span> {issue.root_cause}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Protocol */}
          <div className="glass-panel p-6" data-testid="action-protocol">
            <p className="mono-label mb-4">Immediate Action Protocol</p>
            <div className="space-y-3">
              {(d.action_protocol || []).map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-[#D4AF37] font-mono">{i + 1}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Repair Recommendation */}
          <div className="glass-panel p-6" data-testid="repair-recommendation">
            <p className="mono-label mb-3">Professional Repair Recommendation</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{d.repair_recommendation || 'N/A'}</p>
          </div>
        </div>

        {/* Right column - Health & Cost */}
        <div className="space-y-6">
          {/* Health Index */}
          <div className="glass-panel p-6" data-testid="health-index">
            <p className="mono-label mb-4">System Health Index</p>
            <div className="space-y-4">
              {[
                { label: 'Engine Integrity', value: health.engine_integrity },
                { label: 'Brake Reliability', value: health.brake_reliability },
                { label: 'Electrical Stability', value: health.electrical_stability },
                { label: 'Tyre Condition', value: health.tyre_condition },
                { label: 'Overall Stability', value: health.overall_stability },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-zinc-400">{label}</span>
                    <span className="text-xs font-mono text-white">{value || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value || 0}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full"
                      style={{
                        background: (value || 0) > 70 ? '#00E676' : (value || 0) > 40 ? '#FFEA00' : '#FF3B30'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Estimate */}
          <div className="glass-panel p-6" data-testid="cost-estimate">
            <p className="mono-label mb-3">Estimated Repair Cost</p>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-[#D4AF37]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {d.estimated_cost_range_inr?.min && d.estimated_cost_range_inr?.max
                  ? `₹${d.estimated_cost_range_inr.min.toLocaleString()} — ₹${d.estimated_cost_range_inr.max.toLocaleString()}`
                  : '₹0'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Estimated range (INR)</p>
            </div>
          </div>

          {/* Maintenance Forecast */}
          <div className="glass-panel p-6" data-testid="maintenance-forecast">
            <p className="mono-label mb-3">Maintenance Forecast</p>
            <p className="text-sm text-zinc-300">{d.maintenance_forecast || 'N/A'}</p>
            {d.service_interval_prediction && (
              <p className="text-xs text-zinc-500 mt-2">Next service: {d.service_interval_prediction}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3" data-testid="action-buttons">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vehicleType + ' repair professional near me')}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="find-mechanic-btn"
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-wider font-bold hover:bg-[#D4AF37]/10 transition-all flex-wrap"
            >
              <MapPin className="w-4 h-4" /> Find Professional Near You <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            {issues.length > 0 && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent('how to repair ' + issues[0].issue_name + ' ' + vehicleType)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="repair-video-btn"
                className="w-full flex items-center justify-center gap-2 py-3 border border-zinc-700 text-zinc-400 text-xs uppercase tracking-wider font-bold hover:bg-zinc-800/30 transition-all"
              >
                <Youtube className="w-4 h-4" /> Repair Intelligence <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
