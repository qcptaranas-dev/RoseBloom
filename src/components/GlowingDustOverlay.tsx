import React, { useEffect, useRef } from 'react';

interface GlowingDustOverlayProps {
  density?: number;
}

interface DustMote {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
  vx: number;
  vy: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobblePhase: number;
  colorType: 'gold' | 'rose' | 'cream';
}

export const GlowingDustOverlay: React.FC<GlowingDustOverlayProps> = ({ density = 50 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const motes: DustMote[] = [];
    const colorTypes: ('gold' | 'rose' | 'cream')[] = ['gold', 'rose', 'cream'];

    for (let i = 0; i < density; i++) {
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.2 + Math.random() * 2.5,
        alpha: 0.15 + Math.random() * 0.45,
        targetAlpha: 0.2 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.35, // gentle upward drift
        wobbleSpeed: 0.5 + Math.random() * 1.5,
        wobbleAmp: 0.3 + Math.random() * 0.8,
        wobblePhase: Math.random() * Math.PI * 2,
        colorType: colorTypes[Math.floor(Math.random() * colorTypes.length)],
      });
    }

    let animFrame: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      motes.forEach((m) => {
        // Subtle drift with wobble
        m.wobblePhase += m.wobbleSpeed * delta;
        m.x += m.vx + Math.sin(m.wobblePhase) * m.wobbleAmp;
        m.y += m.vy;

        // Wrap around bounds
        if (m.y < -15) {
          m.y = height + 15;
          m.x = Math.random() * width;
        }
        if (m.x < -15) m.x = width + 15;
        if (m.x > width + 15) m.x = -15;

        // Soft breathing twinkle
        const pulseAlpha = m.alpha * (0.8 + 0.3 * Math.sin(m.wobblePhase * 1.5));

        // Soft glowing gradient
        const glowRadius = m.radius * 3.5;
        const radGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, glowRadius);

        if (m.colorType === 'gold') {
          radGrad.addColorStop(0, `rgba(255, 238, 195, ${pulseAlpha * 0.95})`);
          radGrad.addColorStop(0.35, `rgba(255, 220, 160, ${pulseAlpha * 0.45})`);
          radGrad.addColorStop(1, 'rgba(255, 220, 160, 0)');
        } else if (m.colorType === 'rose') {
          radGrad.addColorStop(0, `rgba(255, 210, 225, ${pulseAlpha * 0.95})`);
          radGrad.addColorStop(0.35, `rgba(244, 165, 185, ${pulseAlpha * 0.45})`);
          radGrad.addColorStop(1, 'rgba(244, 165, 185, 0)');
        } else {
          radGrad.addColorStop(0, `rgba(255, 255, 250, ${pulseAlpha * 0.95})`);
          radGrad.addColorStop(0.35, `rgba(255, 240, 230, ${pulseAlpha * 0.4})`);
          radGrad.addColorStop(1, 'rgba(255, 240, 230, 0)');
        }

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bright delicate center point
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full opacity-85"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
