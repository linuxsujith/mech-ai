import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity, ScanLine, ShieldAlert, FileText,
  Car, LayoutDashboard, Menu, X, LogOut, Scan
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Command Center' },
  { path: '/proscan', icon: Scan, label: 'ProScan AI', neon: true },
  { path: '/scan', icon: ScanLine, label: 'Vehicle Scan' },
  { path: '/emergency', icon: ShieldAlert, label: 'Emergency Protocol' },
  { path: '/services', icon: FileText, label: 'Vehicle Services' },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#050505' }}>
      {/* Mobile Top Header (Visible only on mobile) */}
      <div className="md:hidden fixed top-0 w-full z-40 border-b border-zinc-800/50 flex items-center justify-between px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" style={{ background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.15)]">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <span className="font-mono text-xs tracking-[0.25em] text-[#D4AF37] uppercase drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">MECHAI</span>
        </div>
        <button onClick={handleLogout} className="text-zinc-500 hover:text-[#D4AF37] transition-colors p-2 text-xs flex items-center gap-2">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside
        className="hidden md:flex w-64 border-r border-zinc-800/50 flex-col fixed h-screen z-40"
        style={{ background: '#0A0A0A' }}
        data-testid="sidebar-nav"
      >
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800/50 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-[#D4AF37]/50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-mono text-xs tracking-[0.25em] text-[#D4AF37] uppercase block">MECHAI</span>
              <span className="text-[10px] text-zinc-600 tracking-wider uppercase">Command Center</span>
            </div>
          </div>
        </div>

        {/* Mobile Spacer to match top header height */}
        <div className="h-[60px] md:hidden border-b border-zinc-800/50 flex items-center px-4">
          <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase">Menu</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, icon: Icon, label, neon }) => (
            <NavLink
              key={path}
              to={path}
              data-testid={`nav-${path.replace('/', '')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 group ${isActive
                  ? (neon ? 'text-cyan-400 bg-cyan-900/10 border-l-2 border-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-[#D4AF37] bg-[#D4AF37]/5 border-l-2 border-[#D4AF37]')
                  : (neon ? 'text-cyan-600 hover:text-cyan-400 hover:bg-zinc-800/30 border-l-2 border-transparent' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30 border-l-2 border-transparent')
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${neon && isActive ? 'drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : ''}`} />
                  <span className={`tracking-wide ${neon ? 'font-bold tracking-widest' : ''}`} style={{ fontFamily: neon ? 'Rajdhani, sans-serif' : 'DM Sans, sans-serif' }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom branding & User */}
        <div className="p-4 border-t border-zinc-800/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[#D4AF37] text-xs font-bold uppercase overflow-hidden">
              {user?.name?.charAt(0) || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{user?.name || 'Operator'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'MECHAI Systems'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors rounded"
          >
            <LogOut className="w-3.5 h-3.5" />
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen md:ml-64 w-full pt-[60px] md:pt-0 pb-[76px] md:pb-0 transition-all duration-300">
        {/* Top bar (Desktop Only or merged with Mobile Header functionally) */}
        <header className="hidden md:flex sticky top-0 z-20 border-b border-zinc-800/50 px-8 py-4 items-center justify-between" style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-4">
            <Car className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase">
              PUBLIC DIAGNOSTIC SYSTEM
            </span>
          </div>
          <NavLink
            to="/emergency"
            data-testid="emergency-top-btn"
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-600/30 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Emergency Stop
          </NavLink>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex items-center justify-around px-1 pt-1 border-t border-zinc-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]"
        style={{ background: 'rgba(10, 10, 10, 0.95)', backdropFilter: 'blur(20px)', paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
      >
        {NAV_ITEMS.map(({ path, icon: Icon, label, neon }) => {
          const shortLabel = label === 'Command Center' ? 'Command' :
            label === 'Vehicle Scan' ? 'Scan' :
              label === 'ProScan AI' ? 'ProScan' :
                label === 'Emergency Protocol' ? 'Emergency' :
                  label === 'Vehicle Services' ? 'Services' : label;
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full py-2 gap-1.5 transition-all duration-300 ${isActive ? (neon ? 'text-cyan-400' : 'text-[#D4AF37]') : (neon ? 'text-cyan-700 hover:text-cyan-500' : 'text-zinc-500 hover:text-zinc-400')
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className={`absolute top-[-5px] w-8 h-[2px] ${neon ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]' : 'bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,1)]'}`} />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? (neon ? 'drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'drop-shadow-[0_0_5px_rgba(212,175,55,0.6)]') : ''}`} />
                  <span className={`text-[9px] uppercase tracking-wider font-bold ${neon && isActive ? 'drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]' : ''}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{shortLabel}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
