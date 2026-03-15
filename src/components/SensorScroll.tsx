'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion';

const FRAME_COUNT = 80;

/**
 * SensorScroll — Scroll-linked image sequence with text overlays.
 */
export default function SensorScroll({ onCheckPulse }: { onCheckPulse?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // ─── Scroll tracking ─────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  // ─── Canvas render ───────────────────────────────────────────
  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalW = canvas.width / dpr;
    const logicalH = canvas.height / dpr;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(logicalW / img.naturalWidth, logicalH / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const offsetX = (logicalW - drawW) / 2;
    const offsetY = (logicalH - drawH) / 2;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  }, []);

  // ─── Resize ──────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // ─── Preload frames ─────────────────────────────────────────
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const onLoad = () => {
      loadedCount++;
      setLoadProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
      if (loadedCount === FRAME_COUNT) {
        imagesRef.current = images;
        setIsLoading(false);
      }
    };
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/video-split/ffout${String(i + 1).padStart(3, '0')}.gif`;
      img.onload = onLoad;
      img.onerror = onLoad;
      images[i] = img;
    }
  }, []);

  // ─── Resize listener ────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isLoading, resizeCanvas]);

  // ─── Scroll → frame ─────────────────────────────────────────
  useMotionValueEvent(frameIndex, 'change', (latest) => {
    const next = Math.round(latest);
    if (next === currentFrameRef.current) return;
    currentFrameRef.current = next;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => renderFrame(next));
  });

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          backgroundColor: '#050505',
        }}
      >
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#050505',
              zIndex: 60,
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                className="pulse-ring"
                style={{
                  position: 'absolute',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: '#34d399',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                Initializing P.U.L.S.E.
              </p>
              <div style={{ width: 192, height: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #6ee7b7)',
                    transition: 'width 0.3s ease-out',
                    borderRadius: 4,
                    width: `${loadProgress}%`,
                  }}
                />
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{loadProgress}%</p>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '400vh',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <TextOverlays scrollYProgress={scrollYProgress} onCheckPulse={onCheckPulse} />
      </div>
    </>
  );
}

function TextOverlays({ scrollYProgress, onCheckPulse }: { scrollYProgress: MotionValue<number>, onCheckPulse?: () => void }) {
  const o1 = useTransform(scrollYProgress, [0, 0.05, 0.14, 0.20], [1, 1, 1, 0]);
  const o2 = useTransform(scrollYProgress, [0.22, 0.30, 0.40, 0.47], [0, 1, 1, 0]);
  const o3 = useTransform(scrollYProgress, [0.52, 0.60, 0.70, 0.77], [0, 1, 1, 0]);
  const o4 = useTransform(scrollYProgress, [0.82, 0.90, 1.0], [0, 1, 1]);

  const y1 = useTransform(scrollYProgress, [0, 0.20], [0, -40]);
  const y2 = useTransform(scrollYProgress, [0.22, 0.47], [30, -30]);
  const y3 = useTransform(scrollYProgress, [0.52, 0.77], [30, -30]);
  const y4 = useTransform(scrollYProgress, [0.82, 1.0], [30, 0]);

  const s1 = useTransform(scrollYProgress, [0, 0.20], [1, 0.96]);

  const fixedFull = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10,
    pointerEvents: 'none' as const,
  };

  return (
    <>
      <motion.div style={{ ...fixedFull, opacity: o1, y: y1, scale: s1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, padding: '0 1.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(52,211,153,0.7)', fontWeight: 500, marginBottom: 16 }}>
          Industrial IoT
        </p>
        <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, color: 'rgba(255,255,255,0.9)' }}>
          <span style={{ background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            P.U.L.S.E.
          </span>
        </h1>
        <p style={{ marginTop: 24, fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
          Predictive Understanding and Logic Sensing Engine
        </p>
        <div style={{ position: 'absolute', bottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Scroll</p>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
        </div>
      </motion.div>

      <motion.div style={{ ...fixedFull, opacity: o2, y: y2, display: 'flex', alignItems: 'center', padding: '0 clamp(2rem,5vw,6rem)' }}>
        <div style={{ maxWidth: 480 }}>
          <div style={{ width: 32, height: 2, backgroundColor: 'rgba(52,211,153,0.6)', marginBottom: 24 }} />
          <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'rgba(255,255,255,0.9)', marginBottom: 20 }}>
            Intelligent<br />Vibration Analysis.
          </h2>
          <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 360 }}>
            Detect microscopic resonance anomalies before catastrophic mechanical failure. The shell expands to capture multiaxial frequencies continuously.
          </p>
        </div>
      </motion.div>

      <motion.div style={{ ...fixedFull, opacity: o3, y: y3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 clamp(2rem,5vw,6rem)' }}>
        <div style={{ maxWidth: 480, textAlign: 'right' }}>
          <div style={{ width: 32, height: 2, backgroundColor: 'rgba(52,211,153,0.6)', marginBottom: 24, marginLeft: 'auto' }} />
          <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'rgba(255,255,255,0.9)', marginBottom: 20 }}>
            Piezoelectric<br />Precision.
          </h2>
          <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.125rem)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 360, marginLeft: 'auto' }}>
            A custom-calibrated piezoelectric disk paired with Arduino micro-processing. Surgical accuracy up to 10kHz sampling inside a rugged IoT enclosure.
          </p>
        </div>
      </motion.div>

      <motion.div style={{ ...fixedFull, opacity: o4, y: y4, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, padding: '0 1.5rem' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'rgba(255,255,255,0.9)', marginBottom: 16 }}>
          Stop Failures<br />Before They Start.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.125rem', marginBottom: 40, maxWidth: 400 }}>
          Deploy always-on vibration intelligence across your entire fleet.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            style={{
              pointerEvents: 'auto', padding: '16px 32px', borderRadius: 9999,
              border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)', color: '#fff', fontWeight: 500, letterSpacing: '0.02em',
              cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.4s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
          >
            Deploy P.U.L.S.E.
          </button>

          <button
            onClick={onCheckPulse}
            style={{
              pointerEvents: 'auto', padding: '16px 32px', borderRadius: 9999,
              border: '1px solid rgba(52,211,153,0.3)', backgroundColor: 'rgba(16,185,129,0.1)',
              backdropFilter: 'blur(20px)', color: '#34d399', fontWeight: 600, letterSpacing: '0.02em',
              cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.4s ease',
              boxShadow: '0 0 20px rgba(16,185,129,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.2)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(16,185,129,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.1)';
            }}
          >
            Check your PULSE
          </button>
        </div>
      </motion.div>
    </>
  );
}