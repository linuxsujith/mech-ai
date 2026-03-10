import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Zap, ChevronRight, Activity } from 'lucide-react';

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 6 + Math.random() * 8,
  size: 1 + Math.random() * 2,
}));

export default function LandingPage() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => navigate('/dashboard'), 600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#050505' }}>
      {/* Particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${p.duration}s ease-in ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Hero background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1751467928362-3521fd404f4e"
          alt="Dark luxury vehicle"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
      </div>

      {/* Main content */}
      <AnimatePresence>
        {!entered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6"
          >
            {/* Top bar */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="absolute top-8 left-8 flex items-center gap-3"
            >
              <div className="w-8 h-8 border border-[#D4AF37]/50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <span className="font-mono text-xs tracking-[0.3em] text-[#D4AF37] uppercase">MECHAI Systems</span>
            </motion.div>

            {/* Central content */}
            <div className="text-center max-w-5xl">
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="mb-8"
              >
                <span className="mono-label">Vehicle Intelligence Authority</span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-none mb-6"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                data-testid="hero-heading"
              >
                <span className="text-white">MECHAI</span>
                <br />
                <span className="text-[#D4AF37]" style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F7EF8A 50%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  VEHICLE INTELLIGENCE
                </span>
                <br />
                <span className="text-white">REDEFINED</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.7 }}
                className="text-base md:text-lg text-zinc-400 tracking-wide mb-12 max-w-xl mx-auto"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
                data-testid="hero-subtitle"
              >
                Precision Diagnosis. Zero Guesswork.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
              >
                <button
                  onClick={handleEnter}
                  data-testid="enter-command-center-btn"
                  className="btn-gold-shimmer px-10 py-4 text-sm tracking-[0.2em] inline-flex items-center gap-3 transition-all duration-300 hover:scale-105"
                >
                  Enter The Command Center
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.7 }}
                className="flex flex-wrap justify-center gap-4 mt-16"
              >
                {[
                  { icon: Shield, label: 'Military-Grade Analysis' },
                  { icon: Cpu, label: 'Multi-AI Engine' },
                  { icon: Zap, label: 'Instant Diagnostics' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 text-xs tracking-wider uppercase"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Bottom line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
