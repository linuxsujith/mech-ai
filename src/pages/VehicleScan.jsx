import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, ScanLine, X, Cpu } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SCAN_STEPS = [
  'Initializing Diagnostic Core...',
  'Scanning Mechanical Systems...',
  'Inspecting Structural Components...',
  'Analyzing Electrical Network...',
  'Evaluating Brake & Suspension...',
  'Processing Tyre Condition...',
  'Analyzing Risk Factors...',
  'Compiling Diagnostic Report...',
];

const AI_MODELS = [
  { provider: 'openai', model: 'gpt-5.2', label: 'OpenAI GPT-5.2' },
  { provider: 'gemini', model: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
];

export default function VehicleScan() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedModel, setSelectedModel] = useState('openai:gpt-5.2');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) { toast.error('Upload a vehicle image first'); return; }
    setScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep(prev => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    const [provider, model] = selectedModel.split(':');
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('model_provider', provider);
    formData.append('model_name', model);

    try {
      const res = await axios.post(`${API}/diagnose`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      clearInterval(stepInterval);
      toast.success('Diagnostic Complete');
      navigate(`/report/${res.data.scan_id}`);
    } catch (err) {
      clearInterval(stepInterval);
      setScanning(false);
      toast.error(err.response?.data?.detail || 'Diagnostic analysis failed. Retry with a clearer image.');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div data-testid="vehicle-scan-page">
      <AnimatePresence mode="wait">
        {scanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: '#050505' }}
            data-testid="scan-overlay"
          >
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="scan-line absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />
            </div>
            <div className="relative z-10 text-center max-w-lg px-6">
              {preview && (
                <div className="w-48 h-48 mx-auto mb-8 border border-[#D4AF37]/20 overflow-hidden relative">
                  <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent" />
                </div>
              )}
              <div className="mb-8">
                <Cpu className="w-8 h-8 text-[#D4AF37] mx-auto mb-4 animate-pulse" />
                <p className="mono-label text-lg mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{SCAN_STEPS[scanStep]}</p>
              </div>
              <div className="w-full h-1 bg-zinc-900 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: 'linear-gradient(90deg, #D4AF37, #F7EF8A, #D4AF37)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${((scanStep + 1) / SCAN_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-zinc-600 mt-3 font-mono">
                STEP {scanStep + 1}/{SCAN_STEPS.length}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mono-label">Vehicle Diagnostics</span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 text-white mb-8" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              INITIATE <span className="text-[#D4AF37]">VEHICLE SCAN</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="glass-panel relative overflow-hidden group cursor-pointer"
                onClick={() => !preview && fileInputRef.current?.click()}
                data-testid="upload-zone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Vehicle preview" className="w-full h-80 object-cover" data-testid="image-preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      data-testid="clear-image-btn"
                      className="absolute top-3 right-3 w-8 h-8 bg-black/60 border border-zinc-700 flex items-center justify-center hover:border-red-500 transition-colors"
                    >
                      <X className="w-4 h-4 text-zinc-300" />
                    </button>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-xs text-zinc-400 font-mono">{selectedFile?.name}</p>
                      <p className="text-[10px] text-zinc-600 font-mono">{(selectedFile?.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-[#D4AF37]/30 transition-colors">
                      <Upload className="w-7 h-7 text-zinc-600 group-hover:text-[#D4AF37] transition-colors" />
                    </div>
                    <p className="text-sm text-zinc-400 mb-1">Drop vehicle image or click to upload</p>
                    <p className="text-xs text-zinc-600">JPEG, PNG, WEBP supported</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div className="glass-panel p-6" data-testid="model-selector-panel">
                  <p className="mono-label mb-4">AI Engine Selection</p>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-zinc-950/50 border-zinc-800 text-white h-11" data-testid="model-select-trigger">
                      <SelectValue placeholder="Select AI Engine" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800">
                      {AI_MODELS.map(m => (
                        <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`} className="text-white hover:bg-zinc-800" data-testid={`model-option-${m.provider}`}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-zinc-600 mt-3">
                    {selectedModel.startsWith('openai') && 'GPT-5.2 — Premium vision analysis with highest accuracy'}
                    {selectedModel.startsWith('gemini') && 'Gemini 3 Flash — Fast multimodal analysis'}
                    {selectedModel.startsWith('anthropic') && 'Claude Sonnet 4.5 — Advanced reasoning capabilities'}
                  </p>
                </div>

                <div className="glass-panel p-6">
                  <p className="mono-label mb-3">Supported Systems</p>
                  <div className="flex flex-wrap gap-2">
                    {['Cars', 'Bikes', 'EVs', 'Trucks', 'Tractors', 'Heavy Vehicles'].map(v => (
                      <span key={v} className="px-3 py-1 text-xs border border-zinc-800 text-zinc-400">{v}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleScan}
                  disabled={!selectedFile}
                  data-testid="initiate-scan-btn"
                  className={`w-full py-4 text-sm tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                    selectedFile
                      ? 'btn-gold-shimmer hover:scale-[1.02]'
                      : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                  }`}
                >
                  <ScanLine className="w-5 h-5" />
                  Initiate Diagnostic Scan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
