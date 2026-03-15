'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const applianceImages: Record<string, string> = {
    "Commercial Refrigerator": "/FridgeCompressor.png",
    "HVAC System": "/HVAC System.png",
    "Industrial Pump": "/IndustrialPump.png",
    "Conveyor Motor": "/ConveyorMotor.png"
};

export default function PulseDashboard({ applianceName, onBack }: { applianceName: string, onBack: () => void }) {
    const [telemetry, setTelemetry] = useState({ status: 'offline', peak: 0.0 });

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const response = await fetch('https://acousticsensor-ae07a-default-rtdb.firebaseio.com/sensor_data.json?nocache=' + new Date().getTime());
                const data = await response.json();
                if (data) setTelemetry({ status: data.status, peak: data.peak_impact });
            } catch (error) { console.error(error); }
        };
        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 500);
        return () => clearInterval(interval);
    }, []);

    const isOffline = telemetry.status === 'offline' || telemetry.status === '--';
    const isCalibrating = telemetry.status === 'calibrating';
    const isHealthy = telemetry.status === 'healthy';
    const isCritical = telemetry.status === 'critical';

    let accentColor = 'rgba(255,255,255,0.1)';
    let accentGlow = 'transparent';
    let statusText = 'Offline';
    let bannerText = 'System Offline';
    let peakText = '-';
    let relayState = 'Standby';

    if (isCalibrating) {
        accentColor = '#3b82f6';
        accentGlow = 'rgba(59,130,246,0.15)';
        statusText = 'Calibrating';
        bannerText = 'Mapping Baseline Acoustic Model';
        peakText = telemetry.peak > 0 ? telemetry.peak.toFixed(1) : '-';
        relayState = 'Closed';
    } else if (isHealthy) {
        accentColor = '#10b981';
        accentGlow = 'rgba(16,185,129,0.1)';
        statusText = 'Healthy';
        bannerText = 'Node Armed • Active Inference';
        peakText = telemetry.peak.toFixed(1);
        relayState = 'Closed';
    } else if (isCritical) {
        accentColor = '#ef4444';
        accentGlow = 'rgba(239,68,68,0.2)';
        statusText = 'Critical';
        bannerText = 'Anomaly Detected • Emergency Halt';
        peakText = telemetry.peak.toFixed(1);
        relayState = 'Tripped';
    }

    const imageSrc = applianceImages[applianceName] || "/FridgeCompressor.png";

    return (
        <motion.section
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-screen bg-[#050505] text-white pt-24 pb-24 px-6 md:px-12 flex flex-col items-center"
        >
            <div className="w-full max-w-7xl flex flex-col">

                {/* Header Flow */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-12 md:mb-16 gap-6 lg:gap-8">
                    <div className="w-full lg:w-auto">
                        <button onClick={onBack} className="group flex items-center gap-3 text-white/40 hover:text-white mb-8 lg:mb-10 transition-colors duration-300">
                            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-medium">Fleet Overview</span>
                        </button>
                        <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold tracking-tighter text-white leading-none break-words">
                            {applianceName}.
                        </h2>
                    </div>

                    <div
                        className="self-start lg:self-end px-5 py-2.5 md:px-6 md:py-3 rounded-full text-[9px] md:text-[10px] font-semibold tracking-[0.2em] uppercase transition-all duration-700 backdrop-blur-xl border border-white/10 whitespace-nowrap"
                        style={{ color: isOffline ? 'rgba(255,255,255,0.4)' : accentColor, backgroundColor: isOffline ? 'rgba(255,255,255,0.03)' : accentGlow }}
                    >
                        {bannerText}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 w-full">

                    {/* Left Block: Image & Readouts */}
                    <div className="col-span-1 xl:col-span-5 flex flex-col gap-6 lg:gap-8">
                        <div className="relative aspect-video xl:aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/[0.08] bg-[#0a0a0a]">
                            <div
                                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out ${isOffline ? 'opacity-30 grayscale blur-[2px]' : 'opacity-100 scale-105'}`}
                                style={{ backgroundImage: `url('${imageSrc}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>

                        {/* SECURE STAT CARDS: Perfectly centered text, uniform height */}
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            <div className="bg-[#0a0a0a] border border-white/[0.08] backdrop-blur-2xl rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center h-32 md:h-40">
                                <span className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-medium mb-3">State</span>
                                <span className="text-[clamp(1.25rem,2.5vw,1.875rem)] font-semibold tracking-tight transition-colors duration-500" style={{ color: isOffline ? 'rgba(255,255,255,0.3)' : accentColor }}>
                                    {statusText}
                                </span>
                            </div>
                            <div className="bg-[#0a0a0a] border border-white/[0.08] backdrop-blur-2xl rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center h-32 md:h-40">
                                <span className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-medium mb-3">Envelope</span>
                                <span className={`text-[clamp(1.75rem,3.5vw,2.5rem)] font-light font-mono tracking-tighter transition-colors duration-500 ${isOffline ? 'text-white/20' : 'text-white'}`}>
                                    {peakText}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Block: The Hardware Schematic */}
                    <div className="col-span-1 xl:col-span-7 bg-[#0a0a0a] border border-white/[0.08] backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] p-8 sm:p-10 lg:p-14 flex flex-col relative overflow-hidden">

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] md:w-[30rem] md:h-[30rem] rounded-full blur-[100px] md:blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000" style={{ backgroundColor: accentColor }} />

                        <div className="mb-10 md:mb-16 relative z-10 flex flex-col items-center xl:items-start text-center xl:text-left">
                            <h3 className="text-white/80 text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-medium mb-3 md:mb-4">Actuation Schematic</h3>
                            <p className="text-white/40 text-xs md:text-sm font-light tracking-wide max-w-sm leading-relaxed mx-auto xl:mx-0">
                                Live Edge AI inference loop. Cloud payloads actively override the relay state upon acoustic threshold breach.
                            </p>
                        </div>

                        {/* SECURE SCHEMATIC: Items perfectly centered in boxes, wires perfectly centered between them */}
                        <div className="flex flex-col lg:flex-row items-center justify-center w-full mt-auto relative z-10 gap-4 lg:gap-0">

                            {/* Node */}
                            <div className="w-full max-w-[12rem] lg:w-40 h-24 lg:h-32 bg-[#050505] border border-white/10 backdrop-blur-xl rounded-[1.25rem] md:rounded-[1.5rem] flex flex-col items-center justify-center shadow-xl">
                                <div className={`font-semibold text-sm md:text-lg tracking-tight mb-1 md:mb-2 ${isOffline ? 'text-white/30' : 'text-white'}`}>ESP32</div>
                                <div className="text-white/40 text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold">Edge Node</div>
                            </div>

                            {/* Wire 1 */}
                            <div className="w-[2px] h-8 lg:w-10 xl:w-16 lg:h-[2px] bg-white/5 relative overflow-hidden">
                                {!isOffline && <div className="absolute top-0 left-0 w-full h-full transition-all duration-500" style={{ backgroundColor: accentColor, boxShadow: `0 0 15px ${accentColor}` }} />}
                            </div>

                            {/* Relay */}
                            <div className="w-full max-w-[12rem] lg:w-40 h-24 lg:h-32 bg-[#050505] border border-white/10 backdrop-blur-xl rounded-[1.25rem] md:rounded-[1.5rem] flex flex-col items-center justify-center shadow-xl">
                                <div className={`font-semibold text-sm md:text-lg tracking-tight mb-1 md:mb-2 ${isOffline ? 'text-white/30' : 'text-white'}`}>RELAY</div>
                                <div className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-semibold transition-colors duration-500" style={{ color: isOffline ? 'rgba(255,255,255,0.3)' : accentColor }}>
                                    {relayState}
                                </div>
                            </div>

                            {/* Wire 2 */}
                            <div className="w-[2px] h-8 lg:w-10 xl:w-16 lg:h-[2px] bg-white/5 relative overflow-hidden">
                                {(!isOffline && !isCritical) && <div className="absolute top-0 left-0 w-full h-full transition-all duration-500" style={{ backgroundColor: accentColor, boxShadow: `0 0 15px ${accentColor}` }} />}
                            </div>

                            {/* Outputs (Centered) */}
                            <div className="flex flex-row lg:flex-col gap-3 lg:gap-4 w-full max-w-[16rem] lg:max-w-none lg:w-40 h-auto lg:h-32 justify-center lg:justify-between">
                                <div className="flex-1 h-14 lg:h-full bg-[#050505] border border-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl flex items-center justify-between px-5 md:px-6 shadow-xl">
                                    <span className="text-white/50 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium">Strobe</span>
                                    <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${isCritical ? 'bg-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-white/10'}`} />
                                </div>
                                <div className="flex-1 h-14 lg:h-full bg-[#050505] border border-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl flex items-center justify-between px-5 md:px-6 shadow-xl">
                                    <span className="text-white/50 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium">Motor</span>
                                    <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-[2px] transition-all duration-300 ${(!isOffline && !isCritical) ? 'bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`} />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}