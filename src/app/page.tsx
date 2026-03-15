'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR canvas issues
const SensorScroll = dynamic(() => import('@/components/SensorScroll'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative bg-[#050505] min-h-screen" suppressHydrationWarning>
      {/* Scrollytelling Section */}
      <SensorScroll />

      {/* Footer — appears after scrollytelling completes */}
      <footer className="relative z-20 border-t border-white/5 bg-[#050505]">
        <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-6" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <p className="text-sm font-semibold text-white/80 tracking-tight">
              P.U.L.S.E.
            </p>
            <p className="text-xs text-white/30 mt-1">
              Predictive Unsupervised Learning Sensor Edge
            </p>
          </div>
          <p className="text-[11px] text-white/20 tracking-wide">
            © 2026 P.U.L.S.E. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
