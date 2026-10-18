import React, { useEffect, useRef } from 'react';

interface MusicPlaybackAuraProps {
  isPlaying: boolean;
}

interface NoteParticle {
  x: number;
  y: number;
  char: string;
  size: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayOffset: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  maxOpacity: number;
  life: number;
  maxLife: number;
}

interface FrostSparkle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  phase: number;
  phaseSpeed: number;
  maxOpacity: number;
}

interface PulseWave {
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
  lineWidth: number;
}

const MUSICAL_SYMBOLS = ['♪', '♫', '♬', '♩', '♪', '♫', '𝄢'];

export const MusicPlaybackAura: React.FC<MusicPlaybackAuraProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const opacityRef = useRef(0);
  const targetOpacityRef = useRef(0);

  useEffect(() => {
    targetOpacityRef.current = isPlaying ? 1 : 0;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Notes collection
    const notes: NoteParticle[] = [];
    const maxNotes = 26;

    // Sparkles collection
    const sparkles: FrostSparkle[] = [];
    const maxSparkles = 30;

    // Pulsing Waves collection (smooth expanding concentric neon ripples)
    const pulseWaves: PulseWave[] = [];
    let lastWaveSpawnTime = 0;

    let time = 0;

    const spawnNote = (initialScatter = false): NoteParticle => {
      const size = Math.random() * 12 + 16;
      return {
        x: Math.random() * width,
        y: initialScatter ? Math.random() * (height * 0.85) : -25 - Math.random() * 50,
        char: MUSICAL_SYMBOLS[Math.floor(Math.random() * MUSICAL_SYMBOLS.length)],
        size,
        speedY: Math.random() * 0.45 + 0.35,
        speedX: (Math.random() - 0.5) * 0.25,
        swaySpeed: Math.random() * 0.012 + 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.25,
        rotSpeed: (Math.random() - 0.5) * 0.005,
        opacity: 0,
        maxOpacity: Math.random() * 0.4 + 0.4,
        life: 0,
        maxLife: Math.random() * 600 + 450,
      };
    };

    const spawnSparkle = (initialScatter = false): FrostSparkle => {
      return {
        x: Math.random() * width,
        y: initialScatter ? Math.random() * (height * 0.7) : -10 - Math.random() * 40,
        size: Math.random() * 2.2 + 1.2,
        speedY: Math.random() * 0.3 + 0.2,
        speedX: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.02 + 0.01,
        maxOpacity: Math.random() * 0.45 + 0.3,
      };
    };

    for (let i = 0; i < maxNotes; i++) notes.push(spawnNote(true));
    for (let i = 0; i < maxSparkles; i++) sparkles.push(spawnSparkle(true));

    const render = (timestamp: number) => {
      opacityRef.current += (targetOpacityRef.current - opacityRef.current) * 0.04;

      ctx.clearRect(0, 0, width, height);

      if (opacityRef.current > 0.005) {
        time += 0.012;
        const breath = 0.88 + Math.sin(time * 0.9) * 0.12;

        // Periodic spawn of glowing pulsing waves (every ~2.2 seconds)
        if (timestamp - lastWaveSpawnTime > 2200) {
          lastWaveSpawnTime = timestamp;
          pulseWaves.push({
            radius: 15,
            maxRadius: Math.max(width * 0.55, 500),
            opacity: 0.42,
            speed: 1.6,
            lineWidth: 1.8,
          });
        }

        ctx.save();
        ctx.globalAlpha = opacityRef.current;

        // 1. Pulsing Concentric Neon Ripple Waves from Top Center
        for (let i = pulseWaves.length - 1; i >= 0; i--) {
          const pw = pulseWaves[i];
          pw.radius += pw.speed;
          const progress = pw.radius / pw.maxRadius;
          pw.opacity = Math.max(0, (1 - progress) * 0.42);

          if (pw.radius >= pw.maxRadius || pw.opacity <= 0.01) {
            pulseWaves.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(width * 0.5, 0, pw.radius, 0, Math.PI);
          ctx.strokeStyle = `rgba(255, 255, 255, ${pw.opacity * breath})`;
          ctx.lineWidth = pw.lineWidth;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.restore();
        }

        // 2. Primary Undulating Wave across the top
        ctx.beginPath();
        const waveY = 42;
        ctx.moveTo(0, waveY);
        for (let x = 0; x <= width; x += 18) {
          const y =
            waveY +
            Math.sin(x * 0.006 + time * 1.3) * 14 * breath +
            Math.cos(x * 0.012 - time) * 7;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.14 * breath})`;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 14;
        ctx.stroke();

        // 3. Second Harmonic Wave across the top (Returned!)
        ctx.beginPath();
        ctx.moveTo(0, waveY + 22);
        for (let x = 0; x <= width; x += 20) {
          const y =
            waveY +
            22 +
            Math.cos(x * 0.008 - time * 1.1) * 11 * breath +
            Math.sin(x * 0.016 + time) * 6;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.09 * breath})`;
        ctx.lineWidth = 1.1;
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // 4. Sparkling Frost Stardust Points
        for (let i = 0; i < sparkles.length; i++) {
          const sp = sparkles[i];
          sp.phase += sp.phaseSpeed;
          sp.x += sp.speedX;
          sp.y += sp.speedY;

          const sparkleAlpha = (0.5 + Math.sin(sp.phase) * 0.5) * sp.maxOpacity;

          if (sp.y > height + 20 || sp.x < -20 || sp.x > width + 20) {
            sparkles[i] = spawnSparkle(false);
            continue;
          }

          ctx.save();
          ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
          ctx.shadowBlur = 8;
          ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();

          if (sp.size > 2.2) {
            const spikeLen = sp.size * 2.5;
            ctx.strokeStyle = `rgba(255, 255, 255, ${sparkleAlpha * 0.7})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(sp.x - spikeLen, sp.y);
            ctx.lineTo(sp.x + spikeLen, sp.y);
            ctx.moveTo(sp.x, sp.y - spikeLen);
            ctx.lineTo(sp.x, sp.y + spikeLen);
            ctx.stroke();
          }

          ctx.restore();
        }

        // 5. Floating White-Neon Notes with Calm, Graceful Drift
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < notes.length; i++) {
          const n = notes[i];
          n.life++;
          n.swayOffset += n.swaySpeed;
          n.x += n.speedX + Math.sin(n.swayOffset) * 0.35;
          n.y += n.speedY;
          n.rotation += n.rotSpeed;

          const progress = n.life / n.maxLife;
          if (progress < 0.15) {
            n.opacity = (progress / 0.15) * n.maxOpacity;
          } else if (progress > 0.75) {
            n.opacity = ((1 - progress) / 0.25) * n.maxOpacity;
          } else {
            n.opacity = n.maxOpacity;
          }

          if (n.life >= n.maxLife || n.y > height + 40 || n.x < -40 || n.x > width + 40) {
            notes[i] = spawnNote(false);
            continue;
          }

          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate(n.rotation);

          // Outer Neon Halo
          ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
          ctx.shadowBlur = 16;
          ctx.fillStyle = `rgba(255, 255, 255, ${n.opacity})`;
          ctx.font = `600 ${n.size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
          ctx.fillText(n.char, 0, 0);

          // Crisp Core Bloom
          ctx.shadowColor = 'rgba(255, 255, 255, 1)';
          ctx.shadowBlur = 5;
          ctx.fillStyle = `rgba(255, 255, 255, ${n.opacity * 0.95})`;
          ctx.fillText(n.char, 0, 0);

          ctx.restore();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden transition-opacity duration-1000 ease-in-out"
      style={{ opacity: isPlaying ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* 1. Deep Atmospheric White-Neon Aurora Dome at Top */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] max-w-[140vw] h-[480px] rounded-full pointer-events-none transition-all duration-1000"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0.01) 75%, transparent 100%)',
          filter: 'blur(35px)',
        }}
      />

      {/* 2. Top Edge Neon Horizon Ribbon with Bright Glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.9),0_0_50px_rgba(255,255,255,0.4)]" />

      {/* 3. Soft Ambient Vignette Glow Behind the Entire Screen */}
      <div
        className="absolute top-0 left-0 right-0 h-[320px] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)',
        }}
      />

      {/* 4. High-DPI Canvas with Floating Neon Notes, Dual Waves & Pulsing Neon Ripples */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};
