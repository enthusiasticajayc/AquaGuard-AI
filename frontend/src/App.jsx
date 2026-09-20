import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import GuidedDemoTour from './components/GuidedDemoTour';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import DetectionViewer from './pages/DetectionViewer';
import GISMap from './pages/GISMap';
import VerificationQueue from './pages/VerificationQueue';
import Reports from './pages/Reports';
import Research from './pages/Research';
import { fetchStats } from './services/api';

function AppContent() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to sleek control room dark theme
  const [stats, setStats] = useState(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    // Sync dark mode class on <html>
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    async function loadStats() {
      const data = await fetchStats();
      setStats(data);
    }
    loadStats();
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleStartDemo = () => {
    setIsDemoOpen(true);
  };

  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-sky-50/60 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white overflow-x-hidden">
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        stats={stats}
        onStartDemo={handleStartDemo}
      />
      
      <div className="flex-1 flex w-full">
        {!isLandingPage && <Sidebar />}
        <main className={`flex-1 ${isLandingPage ? 'w-full' : 'w-full max-w-7xl'}`}>
          <Routes>
            <Route path="/" element={<Landing onStartDemo={handleStartDemo} />} />
            <Route path="/dashboard" element={<Dashboard onStartDemo={handleStartDemo} />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/surveys/:id" element={<DetectionViewer />} />
            <Route path="/map" element={<GISMap />} />
            <Route path="/verify" element={<VerificationQueue />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/research" element={<Research />} />
            <Route path="*" element={<Landing onStartDemo={handleStartDemo} />} />
          </Routes>
        </main>
      </div>

      <GuidedDemoTour isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

