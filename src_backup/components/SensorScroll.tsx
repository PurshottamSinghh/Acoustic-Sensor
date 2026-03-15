'use client';

import { RefObject, useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 80;

interface SensorScrollProps {
  scrollTarget: RefObject<HTMLElement | null>;
}

export default function SensorScroll({ scrollTarget }: SensorScrollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Framer motion scroll hook
  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ["start start", "end end"]
  });

  // Map 0-1 scroll to 0-79 frames
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  useEffect(() => {
    // Preload sequence
    let loaded = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `/video-split/frame_${i}_delay-0.04s.webp`;
        
        const onImageLoad = () => {
            loaded++;
            setLoadingProgress((loaded / FRAME_COUNT) * 100);
            if (loaded === FRAME_COUNT) {
                setImages(loadedImages);
                setIsLoading(false);
            }
        };
        img.onload = onImageLoad;
        img.onerror = onImageLoad; // Continue if one fails to prevent infinite load
        
        loadedImages.push(img);
    }
  }, []);

  // Frame drawing logic & Resize handler
  useEffect(() => {
    if (images.length === 0 || isLoading) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const renderInitialFrame = () => renderFrame(Math.round(frameIndex.get()));

    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        // Physical resolution
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        
        // CSS display size
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
        
        renderInitialFrame();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initialize on mount

    return () => window.removeEventListener('resize', resizeCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, isLoading]);

  const renderFrame = (index: number) => {
    if (!images[index] || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[index];
    if (!img.complete || img.naturalWidth === 0) return;

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate aspect ratio covering / containment (contain fit specified)
    const ratio = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    const newWidth = img.width * ratio;
    const newHeight = img.height * ratio;
    
    // Center the image perfectly
    const offsetX = (canvasWidth - newWidth) / 2;
    const offsetY = (canvasHeight - newHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
  };

  // Subscribe to framer motion value and update canvas on scroll tick
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (!isLoading) {
        renderFrame(Math.round(latest));
    }
  });

  return (
    <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-transparent pointer-events-none">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#050505]">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white/90 rounded-full animate-spin"></div>
            <p className="mt-4 text-white/60 tracking-widest text-sm uppercase">
                Loading Sensor Data... {Math.round(loadingProgress)}%
            </p>
        </div>
      )}

      {/* The render canvas */}
      <canvas 
        ref={canvasRef} 
        className="block" 
      />
    </div>
  );
}
