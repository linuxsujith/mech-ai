import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import VehicleScan from './pages/VehicleScan';
import DiagnosticReport from './pages/DiagnosticReport';
import ProScan from './pages/ProScan';
import EmergencyProtocol from './pages/EmergencyProtocol';
import LegalServices from './pages/LegalServices';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#D4AF37] font-mono tracking-widest text-sm">INITIALIZING...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0A0A0A',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><AppLayout><VehicleScan /></AppLayout></ProtectedRoute>} />
          <Route path="/report/:scanId" element={<ProtectedRoute><AppLayout><DiagnosticReport /></AppLayout></ProtectedRoute>} />
          <Route path="/proscan" element={<ProtectedRoute><AppLayout><ProScan /></AppLayout></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><AppLayout><EmergencyProtocol /></AppLayout></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><AppLayout><LegalServices /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
