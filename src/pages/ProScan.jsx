import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
    Scan, Crosshair, X, Car, Cpu, Home, Leaf, HeartPulse, Wrench, Upload
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
    {
        id: 'vehicles',
        title: 'Vehicles and Engines',
        icon: Car,
        description: 'Diagnose vehicle issues such as engine problems, leaks, damaged parts, warning lights, tire damage, and mechanical faults.'
    },
    {
        id: 'electronics',
        title: 'Electronics and Laptops',
        icon: Cpu,
        description: 'Detect problems in laptops, phones, screens, cables, circuit boards, and other electronic devices.'
    },
    {
        id: 'appliances',
        title: 'Home Appliances',
        icon: Home,
        description: 'Identify faults in appliances like refrigerators, washing machines, fans, air conditioners, and kitchen devices.'
    },
    {
        id: 'plants',
        title: 'Plants and Agriculture',
        icon: Leaf,
        description: 'Detect plant diseases, pest damage, nutrient deficiencies, and crop health problems.'
    },
    {
        id: 'health',
        title: 'Health and Skin Conditions',
        icon: HeartPulse,
        description: 'Analyze visible skin issues such as rashes, irritation, swelling, or infections and suggest possible guidance.'
    },
    {
        id: 'machinery',
        title: 'Tools and Machinery',
        icon: Wrench,
        description: 'Detect issues in mechanical tools, machines, construction equipment, and workshop devices.'
    }
];

const SCAN_STEPS = [
    'Initializing Neural Core...',
    'Processing Visual Patterns...',
    'Scanning Component Structures...',
    'Cross-referencing Global Database...',
    'Isolating Anomaly Signatures...',
    'Evaluating Risk Parameters...',
    'Compiling AI Solution Matrix...',
];

const AI_MODELS = [
    { provider: 'openai', model: 'gpt-5.2', label: 'OpenAI GPT-5.2' },
    { provider: 'gemini', model: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
    { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
];

export default function ProScan() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

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

    const clearFile = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleScan = async () => {
        if (!selectedFile) { toast.error('Upload an image first'); return; }
        if (!selectedCategory) { toast.error('Select a problem category'); return; }

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
        formData.append('problem_category', selectedCategory.title);

        try {
            const res = await axios.post(`${API}/diagnose`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000,
            });
            clearInterval(stepInterval);
            toast.success('AI Analysis Complete');
            navigate(`/report/${res.data.scan_id}`);
        } catch (err) {
            clearInterval(stepInterval);
            setScanning(false);
            toast.error(err.response?.data?.detail || 'Analysis failed. Please verify the image and try again.');
        }
    };

    return (
        <div className="min-h-full rounded-2xl relative" style={{ background: '#0F1115' }}>

            {/* Scanning Overlay */}
            <AnimatePresence mode="wait">
                {scanning && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
                        style={{ background: 'rgba(15, 17, 21, 0.9)' }}
                    >
                        <div className="absolute inset-0 overflow-hidden">
                            {/* Neon Blue Scan Line */}
                            <motion.div
                                className="absolute left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] opacity-60"
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>

                        <div className="relative z-10 text-center max-w-lg px-6 w-full">
                            {preview && (
                                <div className="w-48 h-48 mx-auto mb-8 border border-cyan-500/30 overflow-hidden relative rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                                    <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-70" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />
                                </div>
                            )}
                            <div className="mb-8">
                                <Scan className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                <p className="text-cyan-400 font-mono text-sm mb-2 tracking-widest uppercase">{SCAN_STEPS[scanStep]}</p>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 overflow-hidden rounded-full">
                                <motion.div
                                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${((scanStep + 1) / SCAN_STEPS.length) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-3 font-mono tracking-wider">
                                ANALYSIS STEP {scanStep + 1}/{SCAN_STEPS.length}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 md:p-8 max-w-6xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-4 rounded-full bg-cyan-950/30 border border-cyan-500/30 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                    >
                        <Crosshair className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    </motion.div>

                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        Scan Any Problem. <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">Get Instant AI Solutions.</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto font-mono text-sm tracking-wide">
                        Upload an image of a broken part, error screen, sick plant, or mechanical failure. Our universal intelligence will diagnose the root cause and provide actionable steps.
                    </p>

                    {!selectedCategory && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsModalOpen(true)}
                            className="mt-8 px-8 py-4 rounded-full border border-cyan-400/50 bg-[#161A20] text-cyan-400 font-bold uppercase tracking-widest text-sm flex items-center gap-3 mx-auto shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:bg-cyan-950/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-300"
                        >
                            <Scan className="w-5 h-5" />
                            Supported Problem Categories
                        </motion.button>
                    )}
                </div>

                {/* Selected Category & Upload Interface */}
                {selectedCategory && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {/* Left: Upload Zone */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 rounded-xl border border-cyan-500/20 bg-[#161A20]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30">
                                        <selectedCategory.icon className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold tracking-wide text-sm uppercase">{selectedCategory.title}</h3>
                                        <p className="text-xs text-zinc-500 font-mono">Target Domain Locked</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-xs font-mono text-cyan-500 hover:text-cyan-300 transition-colors uppercase py-1 px-3 rounded border border-cyan-800 hover:border-cyan-500"
                                >
                                    Change Domain
                                </button>
                            </div>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className="flex-1 rounded-2xl border-2 border-dashed border-cyan-900/50 bg-[#161A20] relative overflow-hidden group cursor-pointer hover:border-cyan-500/50 transition-colors min-h-[300px]"
                                onClick={() => !preview && fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {preview ? (
                                    <div className="absolute inset-0">
                                        <img src={preview} alt="Target subject" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); clearFile(); }}
                                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-zinc-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors text-white"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <div className="absolute bottom-6 left-6">
                                            <p className="text-sm text-cyan-400 font-mono tracking-wider shadow-black drop-shadow-md">TARGET ACQUIRED</p>
                                            <p className="text-xs text-zinc-300 font-mono dropshadow-md">{selectedFile?.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                        <div className="w-20 h-20 rounded-full border border-cyan-900/50 flex items-center justify-center mb-6 group-hover:border-cyan-500/30 group-hover:bg-cyan-950/20 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
                                            <Upload className="w-8 h-8 text-cyan-700 group-hover:text-cyan-400 transition-colors" />
                                        </div>
                                        <p className="text-white font-medium mb-2 tracking-wide text-lg">Initialize Visual Array</p>
                                        <p className="text-sm text-zinc-500 max-w-[250px]">Drag and drop an image of the {selectedCategory.title.toLowerCase()} problem, or click to browse.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Controls */}
                        <div className="flex flex-col gap-6">
                            <div className="rounded-2xl border border-zinc-800 bg-[#161A20] p-6">
                                <p className="text-xs font-mono text-cyan-500 uppercase tracking-widest mb-4">Neural Engine Protocol</p>
                                <Select value={selectedModel} onValueChange={setSelectedModel}>
                                    <SelectTrigger className="bg-[#0F1115] border-zinc-800 text-white h-12 rounded-xl focus:ring-cyan-500/50">
                                        <SelectValue placeholder="Select Processing Core" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#161A20] border-zinc-700">
                                        {AI_MODELS.map(m => (
                                            <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`} className="text-zinc-300 hover:bg-cyan-950 hover:text-cyan-400 transition-colors focus:bg-cyan-950 focus:text-cyan-400">
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between items-center text-xs font-mono border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-500">Analysis Depth</span>
                                        <span className="text-cyan-400">Deep Scan</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-mono border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-500">Network Speed</span>
                                        <span className="text-green-400">Optimal</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-mono pb-2">
                                        <span className="text-zinc-500">Domain</span>
                                        <span className="text-zinc-300 capitalize">{selectedCategory.id}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleScan}
                                disabled={!selectedFile}
                                className={`w-full py-5 rounded-xl font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 ${selectedFile
                                        ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]'
                                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                                    }`}
                            >
                                <Crosshair className="w-5 h-5" />
                                Initialize Diagnosis
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Categories Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                        style={{ background: 'rgba(10, 10, 10, 0.85)' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/20 bg-[#0F1115] shadow-2xl relative"
                        >
                            <div className="sticky top-0 bg-[#0F1115]/90 backdrop-blur border-b border-zinc-800 p-6 flex items-center justify-between z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                        Problems Our AI Can Diagnose
                                    </h2>
                                    <p className="text-cyan-500/80 font-mono text-xs mt-1 uppercase tracking-widest">Select target domain</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {CATEGORIES.map((cat) => (
                                    <motion.button
                                        key={cat.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedCategory(cat);
                                            setIsModalOpen(false);
                                        }}
                                        className="text-left group relative p-6 rounded-xl border border-zinc-800 bg-[#161A20] hover:border-cyan-500/50 hover:bg-cyan-950/10 transition-all duration-300 flex flex-col gap-4 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-[100px] -z-10 group-hover:bg-cyan-500/10 transition-colors" />

                                        <div className="w-12 h-12 rounded-lg bg-[#0F1115] border border-cyan-900 flex items-center justify-center group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                                            <cat.icon className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{cat.title}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed font-mono">
                                                {cat.description}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
