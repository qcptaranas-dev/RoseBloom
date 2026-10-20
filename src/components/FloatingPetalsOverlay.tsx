import React, { useEffect, useRef } from 'react';
import { ThemeConfig } from '../types';

interface FloatingPetalsOverlayProps {
  theme?: ThemeConfig;
  count?: number;
}

interface FloatingPetal {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  swayOffset: number;
  swaySpeed: number;
  colorBase: string;
  colorMid: string;
  colorEdge: string;
  opacity: number;
  depthScale: number;
}

export const FloatingPetalsOverlay: React.FC<FloatingPetalsOverlayProps> = ({
  theme,
  count = 7, // Subtle, lightweight count (avoids lag or obscuring content)
}) => {
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

    const isDamask = theme?.roseStyle === 'damask';
    const isBlush = theme?.roseStyle === 'blush';

    const colors = isDamask
      ? { base: '#A82D49', mid: '#C44569', edge: '#F8A5B9' }
      : isBlush
      ? { base: '#E28096', mid: '#F8B5C5', edge: '#FFF0F3' }
      : { base: '#C74A69', mid: '#EA7C98', edge: '#FFD3DF' };

    // Initialize 6 to 8 floating petals with varying depth & gentle drift
    const petals: FloatingPetal[] = Array.from({ length: count }, (_, i) => {
      const depthScale = 0.6 + Math.random() * 0.7; // Depth: some farther, some closer
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: (22 + Math.random() * 16) * depthScale,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.35 + Math.random() * 0.45,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.015,
        vRotY: (Math.random() - 0.5) * 0.02,
        vRotZ: (Math.random() - 0.5) * 0.012,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.015 + Math.random() * 0.02,
        colorBase: colors.base,
        colorMid: colors.mid,
        colorEdge: colors.edge,
        opacity: 0.45 + Math.random() * 0.3,
        depthScale,
      };
    });

    let animId: number;
    let t = 0;

    const render = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        // Natural swaying motion
        p.y += p.vy;
        p.x += p.vx + Math.sin(t * p.swaySpeed + p.swayOffset) * 0.6;
        p.rotX += p.vRotX;
        p.rotY += p.vRotY;
        p.rotZ += p.vRotZ;

        // Loop smoothly when falling off screen
        if (p.y > height + 60) {
          p.y = -50;
          p.x = Math.random() * width;
        }
        if (p.x < -60) p.x = width + 50;
        if (p.x > width + 60) p.x = -50;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotZ);

        // 3D tumble transforms
        const scaleX = Math.cos(p.rotY) * p.depthScale;
        const scaleY = Math.cos(p.rotX) * p.depthScale * 1.15;
        ctx.scale(scaleX, scaleY);
        ctx.globalAlpha = p.opacity;

        // Draw natural rose petal curve
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.4);
        ctx.bezierCurveTo(-s * 0.7, s * 0.2, -s * 0.9, -s * 0.4, -s * 0.3, -s * 0.8);
        ctx.bezierCurveTo(-s * 0.1, -s * 0.95, s * 0.1, -s * 0.95, s * 0.3, -s * 0.8);
        ctx.bezierCurveTo(s * 0.9, -s * 0.4, s * 0.7, s * 0.2, 0, s * 0.4);

        const grad = ctx.createRadialGradient(0, s * 0.1, s * 0.1, 0, -s * 0.2, s * 0.9);
        grad.addColorStop(0, p.colorBase);
        grad.addColorStop(0.65, p.colorMid);
        grad.addColorStop(0.95, p.colorEdge);
        grad.addColorStop(1, '#FFF5F8');

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(180, 50, 80, 0.2)';
        ctx.shadowBlur = 8 * p.depthScale;
        ctx.shadowOffsetY = 2 * p.depthScale;
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [theme, count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 w-full h-full block"
      aria-hidden="true"
    />
  );
};
