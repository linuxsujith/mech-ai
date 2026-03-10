import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { ShieldAlert, AlertTriangle, Phone } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EMERGENCY_TYPES = [
  'Engine fire or smoke',
  'Brake failure while driving',
  'Tyre blowout at speed',
  'Electrical short circuit',
  'Coolant leak / Overheating',
  'Steering lock / Power steering failure',
  'EV battery thermal event',
  'Fuel leak detected',
  'Accident / Collision damage',
  'Vehicle not starting',
  'Strange noise / Vibration',
  'Other emergency',
];

export default function EmergencyProtocol() {
  const [situation, setSituation] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleActivate = async () => {
    if (!situation) { toast.error('Describe the emergency situation'); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('situation', situation);
    formData.append('vehicle_type', vehicleType);
    try {
      const res = await axios.post(`${API}/emergency-assist`, formData);
      setResponse(res.data);
    } catch (err) {
      toast.error('Emergency system error. Call 112 immediately.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="emergency-protocol-page">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <span className="mono-label" style={{ color: '#FF3B30' }}>Emergency Protocol</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          EMERGENCY <span className="text-red-500">ASSIST</span>
        </h1>
        <p className="text-sm text-zinc-500 mb-8">Immediate safety protocol activation system</p>

        {!response ? (
          <div className="max-w-2xl">
            <div className="border-2 border-red-500/30 p-6 mb-6" style={{ background: 'rgba(255, 59, 48, 0.05)' }} data-testid="emergency-form">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <p className="text-sm font-bold text-red-400 uppercase tracking-wider">Describe Emergency Situation</p>
              </div>

              <div className="space-y-4">
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className="bg-black border-red-500/20 text-white h-11" data-testid="emergency-vehicle-select">
                    <SelectValue placeholder="Vehicle Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    {['car', 'bike', 'truck', 'ev', 'tractor', 'heavy vehicle'].map(v => (
                      <SelectItem key={v} value={v} className="text-white hover:bg-zinc-800 capitalize">{v.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div>
                  <p className="text-xs text-zinc-500 mb-2">Quick select situation:</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {EMERGENCY_TYPES.slice(0, 6).map(type => (
                      <button
                        key={type}
                        onClick={() => setSituation(type)}
                        data-testid={`emergency-type-${type.replace(/\s/g, '-').toLowerCase()}`}
                        className={`text-xs px-3 py-1.5 border transition-all ${
                          situation === type ? 'border-red-500 text-red-400 bg-red-900/20' : 'border-zinc-800 text-zinc-500 hover:border-red-500/30'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Describe what's happening in detail..."
                  rows={3}
                  data-testid="emergency-situation-input"
                  className="bg-black border-red-500/20 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 text-white placeholder:text-zinc-600"
                />

                <button
                  onClick={handleActivate}
                  disabled={loading || !situation}
                  data-testid="activate-emergency-btn"
                  className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 emergency-glow"
                >
                  <ShieldAlert className="w-5 h-5" />
                  {loading ? 'ACTIVATING PROTOCOL...' : 'ACTIVATE EMERGENCY ASSIST'}
                </button>
              </div>
            </div>

            <div className="glass-panel p-5" data-testid="emergency-contacts">
              <p className="mono-label mb-3" style={{ color: '#FF3B30' }}>Emergency Contacts</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Emergency Services', number: '112' },
                  { label: 'Road Assistance', number: '1033' },
                  { label: 'Fire Brigade', number: '101' },
                  { label: 'Ambulance', number: '108' },
                ].map(({ label, number }) => (
                  <a key={number} href={`tel:${number}`} className="flex items-center gap-2 px-3 py-2 border border-zinc-800 hover:border-red-500/30 transition-colors text-left" data-testid={`call-${number}`}>
                    <Phone className="w-3.5 h-3.5 text-red-400" />
                    <div>
                      <p className="text-xs text-zinc-400">{label}</p>
                      <p className="text-sm font-bold text-white">{number}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl" data-testid="emergency-response">
            <div className="border-2 border-red-500/50 p-4 mb-6 flex items-center gap-3" style={{ background: 'rgba(255, 59, 48, 0.1)' }}>
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-sm font-bold text-red-400 uppercase tracking-wider">Emergency Level: {response.emergency_level}</p>
                {response.contact_emergency && <p className="text-xs text-red-300 mt-0.5">CALL 112 IMMEDIATELY</p>}
              </div>
            </div>

            <div className="glass-panel p-6 mb-4 border-l-2 border-red-500" data-testid="immediate-actions">
              <p className="mono-label mb-3" style={{ color: '#FF3B30' }}>Immediate Actions</p>
              <div className="space-y-2">
                {(response.immediate_actions || []).map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-white">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 mb-4" data-testid="safety-warnings">
              <p className="mono-label mb-3" style={{ color: '#FFEA00' }}>Safety Warnings</p>
              {(response.safety_warnings || []).map((w, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-300">{w}</p>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 mb-4 border-l-2 border-yellow-500" data-testid="do-not-do">
              <p className="mono-label mb-3">Do NOT Do</p>
              {(response.do_not_do || []).map((item, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="text-red-500 text-xs mt-0.5">X</span>
                  <p className="text-sm text-zinc-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 mb-6" data-testid="shutdown-procedure">
              <p className="mono-label mb-3">Shutdown Procedure</p>
              {(response.shutdown_procedure || []).map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-2">
                  <div className="w-5 h-5 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-zinc-400 font-mono">{i + 1}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{step}</p>
                </div>
              ))}
            </div>

            {response.additional_guidance && (
              <div className="glass-panel p-5 mb-6">
                <p className="mono-label mb-2">Additional Guidance</p>
                <p className="text-sm text-zinc-400">{response.additional_guidance}</p>
              </div>
            )}

            <button onClick={() => setResponse(null)} data-testid="new-emergency-btn" className="btn-gold-shimmer px-6 py-3 text-xs">
              New Emergency Report
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
