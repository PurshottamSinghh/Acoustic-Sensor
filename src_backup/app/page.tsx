'use client';

import SensorScroll from '@/components/SensorScroll';
import { useScroll, motion, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Opacity transforms for each text node
  // 0% Scroll
  const opacity1 = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.2], [1, 1, 0, 0]);
  
  // 30% Scroll
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.3, 0.4, 0.45], [0, 1, 1, 0]);
  
  // 60% Scroll
  const opacity3 = useTransform(scrollYProgress, [0.5, 0.6, 0.7, 0.75], [0, 1, 1, 0]);
  
  // 90% Scroll
  const opacity4 = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]);

  // TranslateY for smooth upward drift
  const y1 = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.45], [50, -50]);
  const y3 = useTransform(scrollYProgress, [0.5, 0.75], [50, -50]);
  const y4 = useTransform(scrollYProgress, [0.8, 1], [50, 0]);

  return (
    <main className="relative bg-[#050505] min-h-screen font-sans selection:bg-white/20">
      
      {/* 
        This container holds the 400vh height and the scroll logic.
        We pass scrollYProgress hook to SensorScroll OR SensorScroll handles its own.
        Actually, SensorScroll can handle its own canvas, and page.tsx can handle text over it. 
      */}
      <div ref={containerRef} className="relative w-full h-[400vh]">
        
        {/* The 3D Canvas Background overlay. 
            SensorScroll defines a sticky positioning inside its own layout flow.  
        */}
        <div className="absolute top-0 left-0 w-full h-full">
          <SensorScroll scrollTarget={containerRef} />
        </div>

        {/* Text Overlays - Sticky container that holds the animated text */}
        <div className="sticky top-0 w-full h-screen overflow-hidden pointer-events-none z-10 flex flex-col justify-center">
          
          {/* Section 1: 0% */}
          <motion.div 
            style={{ opacity: opacity1, y: y1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white/90 mb-4">
              AcousticSentinel
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide uppercase">
              Predictive Maintenance
            </p>
          </motion.div>

          {/* Section 2: 30% */}
          <motion.div 
            style={{ opacity: opacity2, y: y2 }}
            className="absolute inset-0 flex flex-col justify-center px-8 md:px-24 max-w-2xl"
          >
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90 mb-4">
              Intelligent Vibration Analysis.
            </h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed">
              Detect microscopic resonance anomalies before catastrophic mechanical failure. 
              The shell expands to capture multiaxial frequencies continuously.
            </p>
          </motion.div>

          {/* Section 3: 60% */}
          <motion.div 
            style={{ opacity: opacity3, y: y3 }}
            className="absolute inset-0 flex flex-col justify-center items-end text-right px-8 md:px-24"
          >
            <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white/90 mb-4">
                Piezoelectric Precision.
                </h2>
                <p className="text-lg md:text-xl text-white/60 leading-relaxed">
                A custom-calibrated piezoelectric disk paired with Arduino micro-processing. 
                Surgical accuracy up to 10kHz sampling rates inside a rugged IoT enclosure.
                </p>
            </div>
          </motion.div>

          {/* Section 4: 90% */}
          <motion.div 
            style={{ opacity: opacity4, y: y4 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white/90 mb-8">
              Stop Failures Before They Start.
            </h2>
            <button className="pointer-events-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full backdrop-blur-md transition-all duration-300 font-medium tracking-wide">
              Deploy Sentinel Today
            </button>
          </motion.div>

        </div>
      </div>

    </main>
  );
}
