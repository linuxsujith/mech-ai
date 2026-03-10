import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Wrench, ShieldAlert, FileText, Activity, ChevronRight, Cpu } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUICK_ACTIONS = [
  { icon: ScanLine, label: 'Vehicle Scan', desc: 'AI-powered diagnostic analysis', path: '/scan', color: '#D4AF37' },
  { icon: Wrench, label: 'Spare Parts', desc: 'Browse certified components', path: '/parts', color: '#D4AF37' },
  { icon: ShieldAlert, label: 'Emergency Protocol', desc: 'Immediate safety assistance', path: '/emergency', color: '#FF3B30' },
  { icon: FileText, label: 'Vehicle Services', desc: 'Official government portals', path: '/services', color: '#D4AF37' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_scans: 0, total_parts: 0 });
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    axios.get(`${API}/public/stats`).then(res => setStats(res.data)).catch(() => { });
    axios.get(`${API}/user/scans`).then(res => setRecentScans(res.data.slice(0, 5))).catch(() => { });
  }, []);

  return (
    <div data-testid="dashboard-page">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="mono-label">Command Center</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Welcome, <span className="text-[#D4AF37]">Operator</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2">Vehicle Intelligence Authority — All systems operational</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
      >
        {[
          { label: 'Total Scans', value: stats.total_scans, icon: ScanLine },
          { label: 'Parts Catalog', value: stats.total_parts, icon: Wrench },
          { label: 'System Status', value: 'ONLINE', icon: Activity, isStatus: true },
        ].map(({ label, value, icon: Icon, isStatus }) => (
          <div key={label} className="glass-panel p-5 relative overflow-hidden group" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#D4AF37]/10 transition-colors" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="mono-label mb-1">{label}</p>
                <p className={`text-2xl font-bold tracking-tight ${isStatus ? 'text-green-400' : 'text-white'}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {value}
                </p>
              </div>
              <Icon className="w-5 h-5 text-[#D4AF37]/50" />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10"
      >
        <h2 className="text-xl font-semibold tracking-tight text-white mb-5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, path, color }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              data-testid={`quick-${label.toLowerCase().replace(/\s/g, '-')}`}
              className="glass-panel p-5 text-left group hover:border-[#D4AF37]/30 transition-all duration-300 border border-transparent"
            >
              <div className="w-10 h-10 border flex items-center justify-center mb-4 transition-colors duration-300" style={{ borderColor: `${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-sm font-semibold text-white tracking-wide mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {label}
              </h3>
              <p className="text-xs text-zinc-500">{desc}</p>
              <ChevronRight className="w-4 h-4 text-zinc-600 mt-3 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recent Scans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mt-10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            RECENT DIAGNOSTICS
          </h2>
          {recentScans.length > 0 && (
            <button onClick={() => navigate('/scan')} className="text-xs text-[#D4AF37] hover:text-white transition-colors mono-label">
              View All
            </button>
          )}
        </div>
        {recentScans.length === 0 ? (
          <div className="glass-panel p-10 text-center" data-testid="no-scans-message">
            <Cpu className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No diagnostics performed yet</p>
            <button
              onClick={() => navigate('/scan')}
              data-testid="first-scan-btn"
              className="mt-4 btn-gold-shimmer px-6 py-2 text-xs"
            >
              Initiate First Scan
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentScans.map((scan) => (
              <button
                key={scan.id}
                onClick={() => navigate(`/report/${scan.id}`)}
                data-testid={`scan-item-${scan.id}`}
                className="w-full glass-panel p-4 flex items-center justify-between group hover:border-[#D4AF37]/20 transition-all border border-transparent text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border border-zinc-800 flex items-center justify-center">
                    <ScanLine className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm text-white">{scan.diagnostic?.vehicle_classification?.type || 'Vehicle'} — {scan.diagnostic?.system_area || 'General'}</p>
                    <p className="text-xs text-zinc-500 font-mono">{new Date(scan.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase ${scan.diagnostic?.risk_status === 'Operational' ? 'text-green-400' : scan.diagnostic?.risk_status === 'Immediate Shutdown Required' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {scan.diagnostic?.risk_status || 'N/A'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#D4AF37] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
