import React, { useEffect, useRef } from 'react';
import { BackgroundEffectType } from '../types/bio';

interface BackgroundEffectsProps {
  effect: BackgroundEffectType;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (effect === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Effect specific data structures
    interface Firefly {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      pulse: number;
      pulseSpeed: number;
    }

    interface Star {
      x: number;
      y: number;
      size: number;
      speedY: number;
      sparklePhase: number;
      sparkleSpeed: number;
    }

    interface MistBlob {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }

    interface RainDrop {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
    }

    interface Spore {
      x: number;
      y: number;
      radius: number;
      angle: number;
      rotSpeed: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }

    const fireflies: Firefly[] = [];
    const stars: Star[] = [];
    const mistBlobs: MistBlob[] = [];
    const rainDrops: RainDrop[] = [];
    const spores: Spore[] = [];

    // Initialize based on effect
    if (effect === 'fireflies') {
      for (let i = 0; i < 30; i++) {
        fireflies.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.5 + 1.2,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: -Math.random() * 0.5 - 0.1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
        });
      }
    } else if (effect === 'stardust') {
      for (let i = 0; i < 50; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.8,
          speedY: -Math.random() * 0.25 - 0.05,
          sparklePhase: Math.random() * Math.PI * 2,
          sparkleSpeed: 0.03 + Math.random() * 0.04,
        });
      }
    } else if (effect === 'mist') {
      for (let i = 0; i < 7; i++) {
        mistBlobs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 160 + 100,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.08 + 0.04,
        });
      }
    } else if (effect === 'rain') {
      for (let i = 0; i < 45; i++) {
        rainDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 22 + 10,
          speed: Math.random() * 6 + 5,
          opacity: Math.random() * 0.35 + 0.1,
        });
      }
    } else if (effect === 'spores') {
      for (let i = 0; i < 28; i++) {
        spores.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 1,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: -Math.random() * 0.4 - 0.1,
          opacity: Math.random() * 0.4 + 0.2,
        });
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (effect === 'fireflies') {
        for (const f of fireflies) {
          f.pulse += f.pulseSpeed;
          f.x += f.speedX;
          f.y += f.speedY;

          if (f.y < -10) f.y = height + 10;
          if (f.x < -10) f.x = width + 10;
          if (f.x > width + 10) f.x = -10;

          const currentOpacity = 0.2 + (Math.sin(f.pulse) + 1) * 0.35;
          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 3.5);
          grad.addColorStop(0, `rgba(255, 230, 160, ${currentOpacity})`);
          grad.addColorStop(0.4, `rgba(255, 190, 80, ${currentOpacity * 0.4})`);
          grad.addColorStop(1, 'rgba(255, 190, 80, 0)');

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      } else if (effect === 'stardust') {
        for (const s of stars) {
          s.sparklePhase += s.sparkleSpeed;
          s.y += s.speedY;
          if (s.y < -5) s.y = height + 5;

          const alpha = 0.2 + (Math.sin(s.sparklePhase) + 1) * 0.35;
          ctx.save();
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(235, 245, 255, ${alpha})`;
          ctx.shadowColor = 'rgba(200, 230, 255, 0.8)';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.restore();
        }
      } else if (effect === 'mist') {
        for (const m of mistBlobs) {
          m.x += m.speedX;
          m.y += m.speedY;
          if (m.x < -m.radius) m.x = width + m.radius;
          if (m.x > width + m.radius) m.x = -m.radius;

          const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
          grad.addColorStop(0, `rgba(180, 210, 240, ${m.opacity})`);
          grad.addColorStop(0.6, `rgba(140, 180, 220, ${m.opacity * 0.5})`);
          grad.addColorStop(1, 'rgba(100, 140, 180, 0)');

          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      } else if (effect === 'rain') {
        ctx.strokeStyle = 'rgba(200, 225, 255, 0.25)';
        ctx.lineWidth = 1;
        for (const r of rainDrops) {
          r.y += r.speed;
          if (r.y > height + 20) {
            r.y = -20;
            r.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x, r.y + r.length);
          ctx.stroke();
        }
      } else if (effect === 'spores') {
        for (const s of spores) {
          s.angle += s.rotSpeed;
          s.x += s.speedX + Math.sin(s.angle) * 0.3;
          s.y += s.speedY;

          if (s.y < -10) s.y = height + 10;
          if (s.x < -10) s.x = width + 10;
          if (s.x > width + 10) s.x = -10;

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, s.radius * 1.8, s.radius, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 245, 255, ${s.opacity * 0.6})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 3;
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [effect]);

  if (effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
