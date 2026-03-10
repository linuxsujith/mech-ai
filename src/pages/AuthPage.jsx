import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
    const { login, register, user } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');

        let success = false;
        if (isLogin) {
            if (!email || !password) {
                toast.error('Email and password required');
                setLoading(false);
                return;
            }
            success = await login(email, password);
        } else {
            if (!name || !email || !password) {
                toast.error('All fields are required');
                setLoading(false);
                return;
            }
            success = await register(name, email, password);
        }

        if (success) {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#050505' }}>
            {/* Background Elements */}
            <div className="fixed inset-0 grid-bg opacity-[0.15]" />
            <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)' }} />
            <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)' }} />

            <div className="flex-1 w-full max-w-md mx-auto relative z-10 glass-panel p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 border border-[#D4AF37]/50 mx-auto flex items-center justify-center mb-6 neon-glow">
                        <Activity className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <span className="font-mono text-xs tracking-[0.3em] text-[#D4AF37] uppercase block mb-2">Security Protocol</span>
                    <h1 className="text-3xl font-bold tracking-wider uppercase text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-1"
                            >
                                <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Operator Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 p-3 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors font-mono placeholder:text-zinc-600"
                                    placeholder="John Doe"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Operator Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full bg-zinc-900/50 border border-zinc-700 p-3 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors font-mono placeholder:text-zinc-600"
                            placeholder="operator@mechai.sys"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Access Code</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full bg-zinc-900/50 border border-zinc-700 p-3 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors font-mono placeholder:text-zinc-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 text-sm font-bold uppercase tracking-[0.2em] flex justify-center items-center mt-6 transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-500' : 'btn-gold-shimmer hover:scale-[1.02]'}`}
                    >
                        {loading ? (
                            <Cpu className="w-5 h-5 animate-pulse" />
                        ) : (
                            isLogin ? 'Sign In' : 'Sign Up'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
                    <p className="text-xs text-zinc-500 font-mono">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#D4AF37] hover:bg-[#D4AF37]/10 px-2 py-1 transition-colors uppercase"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
