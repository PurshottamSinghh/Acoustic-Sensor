'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import PulseHub from '@/components/PulseHub';
import PulseDashboard from '@/components/PulseDashboard';

// Dynamic import to avoid SSR canvas issues
const SensorScroll = dynamic(() => import('@/components/SensorScroll'), {
  ssr: false,
});

export default function Home() {
  // This state controls exactly which screen is currently visible
  const [currentView, setCurrentView] = useState<'scroll' | 'hub' | 'dashboard'>('scroll');
  const [selectedAppliance, setSelectedAppliance] = useState('');

  return (
    <main className="relative bg-[#050505] min-h-screen font-sans text-white">

      {/* View 1: The 3D Scroll Animation */}
      {currentView === 'scroll' && (
        <SensorScroll onCheckPulse={() => setCurrentView('hub')} />
      )}

      {/* View 2: The Appliance Selection Hub */}
      {currentView === 'hub' && (
        <PulseHub
          onSelectAppliance={(applianceName) => {
            setSelectedAppliance(applianceName);
            setCurrentView('dashboard');
          }}
          onBack={() => setCurrentView('scroll')}
        />
      )}

      {/* View 3: The Live Digital Twin Dashboard (Your Python Edge Node) */}
      {currentView === 'dashboard' && (
        <PulseDashboard
          applianceName={selectedAppliance}
          onBack={() => setCurrentView('hub')}
        />
      )}

      {/* Footer — appears on all pages */}
      <footer className="relative z-20 border-t border-white/5 bg-[#050505]">
        <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-white/80 tracking-tight">
              P.U.L.S.E. Platform
            </p>
            <p className="text-xs text-white/30 mt-1">
              Industrial IoT — Predictive Maintenance
            </p>
          </div>
          <p className="text-[11px] text-white/20 tracking-wide">
            © 2026 P.U.L.S.E. Systems. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}