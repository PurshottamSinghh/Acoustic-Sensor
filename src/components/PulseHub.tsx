'use client';

import { motion, Variants } from 'framer-motion';

export default function PulseHub({ onSelectAppliance, onBack }: { onSelectAppliance: (name: string) => void, onBack: () => void }) {
  const appliances = [
    { name: "Commercial Refrigerator", id: "REF-001", loc: "Dining Hall A", status: "Active", image: "/FridgeCompressor.png" },
    { name: "HVAC System", id: "HVAC-404", loc: "Server Room", status: "Active", image: "/HVAC System.png" },
    { name: "Industrial Pump", id: "PMP-992", loc: "Water Treatment", status: "Active", image: "/IndustrialPump.png" },
    { name: "Conveyor Motor", id: "CNV-110", loc: "Assembly Line", status: "Active", image: "/ConveyorMotor.png" },
  ];

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, type: 'spring', bounce: 0 } }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-[#050505] text-white pt-24 pb-24 px-6 md:px-12 flex flex-col items-center selection:bg-white/20"
    >
      <div className="w-full max-w-7xl flex flex-col">
        {/* Navigation */}
        <button onClick={onBack} className="group self-start flex items-center gap-3 text-white/40 hover:text-white mb-12 md:mb-16 transition-colors duration-300">
          <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Return to Scroll</span>
        </button>

        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mb-16 max-w-3xl">
          <h2 className="text-[clamp(3rem,6vw,5rem)] font-semibold tracking-tighter text-white mb-6 leading-[1.1]">
            Fleet Overview.
          </h2>
          <p className="text-white/50 text-[clamp(1rem,2vw,1.25rem)] font-light tracking-tight leading-relaxed">
            Select an edge node to monitor real-time acoustic telemetry and mechanical actuation.
          </p>
        </motion.div>

        {/* Cinematic Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full">
          {appliances.map((app, i) => (
            <motion.div
              variants={item}
              key={i}
              onClick={() => {
                fetch('/api/start-sensor', { method: 'POST' }).catch(console.error);
                onSelectAppliance(app.name);
              }}
              className="group relative h-[24rem] sm:h-[28rem] lg:h-[32rem] rounded-[2rem] overflow-hidden cursor-pointer border border-white/[0.08] bg-[#0a0a0a] transition-all duration-700 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                style={{ backgroundImage: `url('${app.image}')` }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent opacity-90 transition-opacity duration-700" />

              <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-white/90 text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold">{app.status}</span>
              </div>

              {/* SECURE TEXT WRAPPER: Absolute positioned to the bottom with strictly enforced padding */}
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 lg:p-12 flex flex-col items-start justify-end translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-semibold mb-3 md:mb-4">{app.id} — {app.loc}</p>
                <h3 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight text-white mb-4 md:mb-6">{app.name}</h3>

                <div className="flex items-center gap-2 text-white/0 group-hover:text-white/80 text-[10px] md:text-xs font-semibold tracking-widest uppercase transition-all duration-500">
                  <span>Initialize Connection</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-500">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}