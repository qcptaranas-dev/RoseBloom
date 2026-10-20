import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig } from '../types';
import { FastForward, Sparkles } from 'lucide-react';

interface RoseBloomExperienceProps {
  theme: ThemeConfig;
  onComplete: () => void;
  onSkip?: () => void;
}

interface Petal3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  baseSize: number;
  aspectRatio: number;
  colorIndex: number;
  curl: number;
  isForegroundCover?: boolean;
}

interface ParticleMote {
  x: number;
  y: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  hueShift: number;
}

export const RoseBloomExperience: React.FC<RoseBloomExperienceProps> = ({
  theme,
  onComplete,
  onSkip
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [phaseText, setPhaseText] = useState<string>("A flower is blooming for you...");
  const hasTriggeredCompleteRef = useRef<boolean>(false);

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

    // Color palettes based on theme
    const roseColors = theme.roseStyle === 'damask'
      ? [
          { base: '#A82D49', mid: '#C44569', edge: '#F8A5B9' },
          { base: '#8F223B', mid: '#B33957', edge: '#F392AA' },
          { base: '#B83B5E', mid: '#D45D7E', edge: '#FFB8C9' },
        ]
      : theme.roseStyle === 'blush'
      ? [
          { base: '#E28096', mid: '#F8B5C5', edge: '#FFF0F3' },
          { base: '#D97188', mid: '#F4A2B5', edge: '#FFE3EA' },
          { base: '#EDB0BF', mid: '#FCD6DF', edge: '#FFFFFF' },
        ]
      : [
          // Classic Garden Rose
          { base: '#C74A69', mid: '#EA7C98', edge: '#FFD3DF' },
          { base: '#B83B5B', mid: '#DE6885', edge: '#FFC0D3' },
          { base: '#D65C7C', mid: '#F292AA', edge: '#FFE8EE' },
        ];

    // Background gradient tones
    const bgTone = theme.palette === 'soft-lavender'
      ? { top: 'rgba(250, 245, 252, 0.95)', bottom: 'rgba(240, 230, 245, 0.98)' }
      : theme.palette === 'white-sage'
      ? { top: 'rgba(248, 250, 248, 0.95)', bottom: 'rgba(235, 242, 236, 0.98)' }
      : { top: 'rgba(255, 248, 248, 0.95)', bottom: 'rgba(252, 236, 240, 0.98)' };

    // Atmospheric Motes
    const motes: ParticleMote[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 3,
      alpha: 0.2 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      hueShift: Math.random() * 20
    }));

    // 3D Petal Rush Storm with Subtle Layered Depth
    const speedMultiplier = theme.animationIntensity === 'subtle' ? 0.8 : theme.animationIntensity === 'expressive' ? 1.25 : 1.0;
    // Controlled count avoids excessive particles that cause lag or obscure content
    const petalCount = theme.animationIntensity === 'subtle' ? 75 : theme.animationIntensity === 'expressive' ? 120 : 95;

    const petals3D: Petal3D[] = [];

    // Create 3D rushing petals with subtle depth distribution (some close, some far)
    for (let i = 0; i < petalCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spreadRadius = Math.random() * 90;
      // 3 subtle depth tiers: 20% distant, 65% midground, 15% ultra-close
      const depthTier = i % 5;
      const isDistant = depthTier === 0;
      const isUltraClose = depthTier === 1;

      const zStart = isDistant ? 1100 + Math.random() * 600 : isUltraClose ? 500 + Math.random() * 300 : 750 + Math.random() * 650;
      const vzSpeed = isDistant ? -(3.5 + Math.random() * 4.5) : isUltraClose ? -(6.0 + Math.random() * 6.5) : -(4.5 + Math.random() * 6.0);

      petals3D.push({
        x: Math.cos(angle) * spreadRadius * (isUltraClose ? 1.3 : 1.0),
        y: Math.sin(angle) * spreadRadius * (isUltraClose ? 1.1 : 0.7),
        z: zStart,
        vx: (Math.cos(angle) * (isUltraClose ? 2.2 : 1.4) + (Math.random() - 0.5) * 1.5) * speedMultiplier,
        vy: (Math.sin(angle) * 1.2 - 0.4 + (Math.random() - 0.5) * 1.5) * speedMultiplier,
        vz: vzSpeed * speedMultiplier,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.035 * speedMultiplier,
        vRotY: (Math.random() - 0.5) * 0.05 * speedMultiplier,
        vRotZ: (Math.random() - 0.5) * 0.025 * speedMultiplier,
        baseSize: isUltraClose ? 65 + Math.random() * 45 : isDistant ? 35 + Math.random() * 25 : 45 + Math.random() * 35,
        aspectRatio: 1.1 + Math.random() * 0.35,
        colorIndex: Math.floor(Math.random() * roseColors.length),
        curl: 0.15 + Math.random() * 0.35,
        isForegroundCover: isUltraClose || i % 10 === 0 // Petals that pass very close to camera
      });
    }

    // Additional smooth sweep petals for final seamless transition
    for (let j = 0; j < 10; j++) {
      const angle = (j / 10) * Math.PI * 2;
      petals3D.push({
        x: Math.cos(angle) * 110,
        y: Math.sin(angle) * 85,
        z: 700 + (j * 35),
        vx: Math.cos(angle) * 2.0 * speedMultiplier,
        vy: Math.sin(angle) * 1.6 * speedMultiplier,
        vz: -7.0 * speedMultiplier,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: angle,
        vRotX: 0.02 * speedMultiplier,
        vRotY: 0.035 * speedMultiplier,
        vRotZ: 0.025 * speedMultiplier,
        baseSize: 115 + Math.random() * 45,
        aspectRatio: 1.3,
        colorIndex: j % roseColors.length,
        curl: 0.25,
        isForegroundCover: true
      });
    }

    const focalLength = 480;
    const startTime = performance.now();
    // Timing milestones in seconds
    const T_BUD_APPEAR = 1.6;
    const T_BLOOM_START = 2.2;
    const T_FULL_BLOOM = 6.2;
    const T_DETACH_START = 7.6;
    const T_RUSH_START = 8.8;
    const T_FULL_COVER = 11.2;
    const T_SWEEP_AWAY = 13.0;
    const T_TOTAL_END = 14.8;

    let canvasOpacity = 1.0;

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Update Phase Text
      if (elapsed < T_BLOOM_START) {
        setPhaseText("A tender pink garden rose arrives for you...");
      } else if (elapsed < T_FULL_BLOOM) {
        setPhaseText("Petal by petal, blooming with love...");
      } else if (elapsed < T_DETACH_START) {
        setPhaseText("In full, radiant bloom for you, Maya...");
      } else if (elapsed < T_RUSH_START) {
        setPhaseText("A gentle breeze stirs the petals...");
      } else if (elapsed < T_FULL_COVER) {
        setPhaseText("A shower of rose petals rushing to surround you...");
      } else if (elapsed < T_SWEEP_AWAY) {
        setPhaseText("Surrounded completely in pink petals...");
      } else {
        setPhaseText("Unveiling your love letter...");
      }

      // Check for completion trigger
      if (elapsed >= T_FULL_COVER + 0.8 && !hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true;
        onComplete();
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Draw Atmospheric Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, bgTone.top);
      bgGrad.addColorStop(1, bgTone.bottom);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Radial subtle glow in center
      const centerGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.min(width, height) * 0.65
      );
      centerGlow.addColorStop(0, 'rgba(255, 225, 235, 0.45)');
      centerGlow.addColorStop(0.5, 'rgba(255, 210, 225, 0.2)');
      centerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Atmospheric Motes
      motes.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -10) m.y = height + 10;
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 225, ${m.alpha * 0.7})`;
        ctx.shadowColor = 'rgba(255, 180, 200, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      // Compute Bloom Factor (0: closed bud -> 1: fully opened garden rose)
      let bloomProgress = 0;
      if (elapsed > T_BLOOM_START) {
        const raw = (elapsed - T_BLOOM_START) / (T_FULL_BLOOM - T_BLOOM_START);
        // Smooth easeInOutCubic
        bloomProgress = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
        bloomProgress = Math.max(0, Math.min(1, bloomProgress));
      }

      // Bud arrival fade and vertical float
      let roseAlpha = Math.min(1, elapsed / T_BUD_APPEAR);
      const roseFloatY = Math.sin(elapsed * 1.5) * 6 + (1 - roseAlpha) * 40;

      // When rush hits full cover, fade the center flower out gently
      if (elapsed > T_RUSH_START) {
        const coverFactor = (elapsed - T_RUSH_START) / (T_FULL_COVER - T_RUSH_START);
        roseAlpha = Math.max(0, 1 - coverFactor * 1.4);
      }

      // -------------------------------------------------------------
      // 1. DRAW CENTRAL STEM, LEAVES & BLOOMING ROSE
      // -------------------------------------------------------------
      if (roseAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = roseAlpha;
        const centerX = width / 2;
        const centerY = height / 2 + roseFloatY;
        const roseRotation = (elapsed * 0.02) + (bloomProgress * 0.12);

        // A. Draw Realistic Curved Stem
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 30);
        ctx.bezierCurveTo(
          centerX - 10, centerY + 130,
          centerX + 18, centerY + 240,
          centerX + 4, centerY + 380
        );
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        const stemGrad = ctx.createLinearGradient(centerX - 10, centerY, centerX + 18, centerY + 380);
        stemGrad.addColorStop(0, '#537A5C');
        stemGrad.addColorStop(0.5, '#44684C');
        stemGrad.addColorStop(1, '#35533B');
        ctx.strokeStyle = stemGrad;
        ctx.stroke();

        // Slender thorns
        const drawThorn = (tx: number, ty: number, angle: number) => {
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(8, -2, 12, -8);
          ctx.quadraticCurveTo(6, -2, 0, 4);
          ctx.fillStyle = '#6E4940';
          ctx.fill();
          ctx.restore();
        };
        drawThorn(centerX + 3, centerY + 160, 0.5);
        drawThorn(centerX - 4, centerY + 220, -0.6);

        // B. Draw Stem Leaves with Veins
        const drawLeaf = (lx: number, ly: number, angle: number, scale: number) => {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(angle);
          ctx.scale(scale, scale);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(30, -25, 70, -20, 95, 0);
          ctx.bezierCurveTo(70, 25, 30, 20, 0, 0);

          const leafGrad = ctx.createLinearGradient(0, 0, 95, 0);
          leafGrad.addColorStop(0, '#4E7456');
          leafGrad.addColorStop(0.6, '#5C8866');
          leafGrad.addColorStop(1, '#6F9D79');
          ctx.fillStyle = leafGrad;
          ctx.shadowColor = 'rgba(30, 60, 35, 0.15)';
          ctx.shadowBlur = 8;
          ctx.fill();

          // Main central leaf vein
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(50, -3, 90, 0);
          ctx.strokeStyle = '#38583E';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Tiny lateral veins
          for (let v = 20; v < 80; v += 15) {
            ctx.beginPath();
            ctx.moveTo(v, 0);
            ctx.lineTo(v + 10, -8);
            ctx.moveTo(v, 0);
            ctx.lineTo(v + 10, 8);
            ctx.strokeStyle = 'rgba(70, 110, 80, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.restore();
        };

        drawLeaf(centerX - 8, centerY + 180, -0.7 + Math.sin(elapsed) * 0.05, 0.85);
        drawLeaf(centerX + 12, centerY + 230, 0.8 + Math.cos(elapsed * 1.1) * 0.05, 0.95);
        ctx.restore();

        // C. Calyx (green sepals cradling the rosebud)
        ctx.save();
        ctx.translate(centerX, centerY + 25);
        for (let s = -2; s <= 2; s++) {
          ctx.save();
          const sepalAngle = s * 0.35 + (bloomProgress * s * 0.1);
          ctx.rotate(sepalAngle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-8, 15, -12, 35, 0, 50 - (bloomProgress * 15));
          ctx.bezierCurveTo(12, 35, 8, 15, 0, 0);
          ctx.fillStyle = '#497052';
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // D. BLOOMING ROSE PETAL LAYERS
        // We render concentric rings of petals with realistic Bezier curves and velvet shading
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(roseRotation);

        // Soft ambient bloom glow when fully open
        if (bloomProgress > 0.4) {
          const glowAlpha = (bloomProgress - 0.4) * 0.45;
          const roseHalo = ctx.createRadialGradient(0, 0, 20, 0, 0, 160);
          roseHalo.addColorStop(0, `rgba(255, 180, 205, ${glowAlpha})`);
          roseHalo.addColorStop(0.6, `rgba(255, 195, 215, ${glowAlpha * 0.4})`);
          roseHalo.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = roseHalo;
          ctx.beginPath();
          ctx.arc(0, 0, 160, 0, Math.PI * 2);
          ctx.fill();
        }

        // Helper to draw a single organic curved garden rose petal
        const drawPetal = (
          angle: number,
          distance: number,
          petalWidth: number,
          petalHeight: number,
          curlOutward: number,
          palette: { base: string; mid: string; edge: string },
          shadowBlurVal: number = 6
        ) => {
          ctx.save();
          ctx.rotate(angle);
          ctx.translate(0, -distance);

          // Curving transform based on bloom
          ctx.scale(1 + curlOutward * 0.1, 1 - curlOutward * 0.05);

          ctx.beginPath();
          ctx.moveTo(0, petalHeight * 0.4);
          // Left side
          ctx.bezierCurveTo(
            -petalWidth * 0.65, petalHeight * 0.25,
            -petalWidth * 0.85, -petalHeight * 0.4,
            -petalWidth * 0.3, -petalHeight * 0.8
          );
          // Top curved rim with velvety indent
          ctx.bezierCurveTo(
            -petalWidth * 0.1, -petalHeight * 0.95,
            petalWidth * 0.1, -petalHeight * 0.95,
            petalWidth * 0.3, -petalHeight * 0.8
          );
          // Right side
          ctx.bezierCurveTo(
            petalWidth * 0.85, -petalHeight * 0.4,
            petalWidth * 0.65, petalHeight * 0.25,
            0, petalHeight * 0.4
          );

          // Rich radial velvet gradient
          const pGrad = ctx.createRadialGradient(
            0, petalHeight * 0.2, 5,
            0, -petalHeight * 0.3, petalHeight * 0.9
          );
          pGrad.addColorStop(0, palette.base);
          pGrad.addColorStop(0.55, palette.mid);
          pGrad.addColorStop(0.92, palette.edge);
          pGrad.addColorStop(1, '#FFF5F8');

          ctx.fillStyle = pGrad;
          ctx.shadowColor = 'rgba(150, 40, 70, 0.28)';
          ctx.shadowBlur = shadowBlurVal;
          ctx.shadowOffsetY = 3;
          ctx.fill();

          // Delicate rim highlight
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = 'rgba(255, 240, 245, 0.6)';
          ctx.stroke();

          ctx.restore();
        };

        // Ring 1 (Outermost Petals: 5 large petals unfolding first)
        const r1Unfold = Math.min(1, bloomProgress * 1.35);
        const r1Dist = 18 + r1Unfold * 48;
        const r1W = 55 + r1Unfold * 36;
        const r1H = 65 + r1Unfold * 42;
        for (let i = 0; i < 5; i++) {
          const pAngle = (i / 5) * Math.PI * 2 + 0.2;
          drawPetal(pAngle, r1Dist, r1W, r1H, r1Unfold, roseColors[i % roseColors.length], 8);
        }

        // Ring 2 (Middle Outer: 5 petals overlapping the gaps)
        const r2Unfold = Math.max(0, Math.min(1, (bloomProgress - 0.15) * 1.35));
        const r2Dist = 14 + r2Unfold * 34;
        const r2W = 48 + r2Unfold * 28;
        const r2H = 55 + r2Unfold * 32;
        for (let i = 0; i < 5; i++) {
          const pAngle = (i / 5) * Math.PI * 2 + (Math.PI / 5) + 0.1;
          drawPetal(pAngle, r2Dist, r2W, r2H, r2Unfold, roseColors[(i + 1) % roseColors.length], 7);
        }

        // Ring 3 (Intermediate Petals: 5 petals)
        const r3Unfold = Math.max(0, Math.min(1, (bloomProgress - 0.3) * 1.35));
        const r3Dist = 10 + r3Unfold * 22;
        const r3W = 40 + r3Unfold * 20;
        const r3H = 46 + r3Unfold * 22;
        for (let i = 0; i < 5; i++) {
          const pAngle = (i / 5) * Math.PI * 2 + 0.55;
          drawPetal(pAngle, r3Dist, r3W, r3H, r3Unfold, roseColors[(i + 2) % roseColors.length], 6);
        }

        // Ring 4 (Inner Swirl Petals: 4 petals)
        const r4Unfold = Math.max(0, Math.min(1, (bloomProgress - 0.45) * 1.4));
        const r4Dist = 6 + r4Unfold * 13;
        const r4W = 32 + r4Unfold * 14;
        const r4H = 38 + r4Unfold * 15;
        for (let i = 0; i < 4; i++) {
          const pAngle = (i / 4) * Math.PI * 2 + 0.35;
          drawPetal(pAngle, r4Dist, r4W, r4H, r4Unfold, roseColors[i % roseColors.length], 5);
        }

        // Ring 5 (Inner Heart Bud: Tightly curled spiral core)
        const centerCurl = Math.max(0, Math.min(1, (bloomProgress - 0.6) * 1.5));
        ctx.save();
        ctx.rotate(centerCurl * 0.4);
        for (let c = 0; c < 3; c++) {
          const cAngle = (c / 3) * Math.PI * 2;
          drawPetal(cAngle, 3 + centerCurl * 6, 22 + centerCurl * 8, 28 + centerCurl * 8, centerCurl, roseColors[c % roseColors.length], 4);
        }
        // Center deep velvety bud core
        ctx.beginPath();
        ctx.arc(0, 0, 10 + centerCurl * 4, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 14);
        coreGrad.addColorStop(0, roseColors[0].base);
        coreGrad.addColorStop(0.8, roseColors[0].mid);
        coreGrad.addColorStop(1, roseColors[0].edge);
        ctx.fillStyle = coreGrad;
        ctx.fill();
        ctx.restore();

        ctx.restore(); // restore center translate
        ctx.restore(); // restore roseAlpha
      }

      // -------------------------------------------------------------
      // 2. THE IMMERSIVE 3D PETAL RUSH & FULL-SCREEN COVER
      // -------------------------------------------------------------
      if (elapsed > T_DETACH_START) {
        // Sort petals by z-depth (painters algorithm: farthest first, nearest last)
        petals3D.sort((a, b) => b.z - a.z);

        const rushActive = elapsed > T_RUSH_START;
        const rushAcceleration = rushActive ? Math.min(2.8, 1 + (elapsed - T_RUSH_START) * 0.75) : 0.4;

        // Render each 3D petal
        petals3D.forEach(p => {
          // Advance physics
          p.z += p.vz * rushAcceleration;
          p.x += p.vx * rushAcceleration;
          p.y += p.vy * rushAcceleration;

          // Natural rotation in 3D
          p.rotX += p.vRotX * rushAcceleration;
          p.rotY += p.vRotY * rushAcceleration;
          p.rotZ += p.vRotZ * rushAcceleration;

          // If petal has passed far beyond the camera, loop it or disperse depending on stage
          if (p.z < 25) {
            if (elapsed < T_SWEEP_AWAY) {
              // During the rush and full cover, recycle petals from mid-depth to keep the screen packed!
              p.z = 600 + Math.random() * 500;
              p.x = (Math.random() - 0.5) * 400;
              p.y = (Math.random() - 0.5) * 300;
            } else {
              // During sweep-away, let them fly out of screen
              p.z = -100;
            }
          }

          if (p.z <= 30) return; // Behind camera clipping

          // Perspective projection
          const scale = focalLength / p.z;
          const screenX = width / 2 + p.x * scale;
          const screenY = height / 2 + p.y * scale;

          // Render Petal at calculated screen position
          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(p.rotZ);

          // 3D tumble transforms
          const scaleX = Math.cos(p.rotY) * scale;
          const scaleY = Math.cos(p.rotX) * scale * p.aspectRatio;

          // Subtle camera depth effect: petals passing close to lens expand smoothly
          const isUltraClose = p.z < 180;
          const sizeBoost = p.isForegroundCover && p.z < 280 ? 2.1 : isUltraClose ? 1.45 : 1.0;
          ctx.scale(scaleX * sizeBoost, scaleY * sizeBoost);

          // Depth-based subtle opacity
          if (p.z > 950) {
            ctx.globalAlpha = 0.75;
          } else if (isUltraClose) {
            ctx.globalAlpha = 0.95;
          }

          const curPetalSize = p.baseSize;
          const palette = roseColors[p.colorIndex % roseColors.length];

          // Petal geometry: realistic teardrop-shaped garden rose petal with natural curves
          ctx.beginPath();
          ctx.moveTo(0, curPetalSize * 0.45);
          ctx.bezierCurveTo(
            -curPetalSize * 0.75, curPetalSize * 0.25,
            -curPetalSize * 0.95, -curPetalSize * 0.45,
            -curPetalSize * 0.35, -curPetalSize * 0.85
          );
          ctx.bezierCurveTo(
            -curPetalSize * 0.1, -curPetalSize,
            curPetalSize * 0.1, -curPetalSize,
            curPetalSize * 0.35, -curPetalSize * 0.85
          );
          ctx.bezierCurveTo(
            curPetalSize * 0.95, -curPetalSize * 0.45,
            curPetalSize * 0.75, curPetalSize * 0.25,
            0, curPetalSize * 0.45
          );

          // Dynamic radial shading on moving petal
          const petalGrad = ctx.createRadialGradient(
            0, curPetalSize * 0.1, curPetalSize * 0.1,
            0, -curPetalSize * 0.2, curPetalSize * 0.95
          );
          petalGrad.addColorStop(0, palette.base);
          petalGrad.addColorStop(0.65, palette.mid);
          petalGrad.addColorStop(0.95, palette.edge);
          petalGrad.addColorStop(1, '#FFF5F8');

          ctx.fillStyle = petalGrad;

          // Depth-based shadow
          if (p.z < 350) {
            ctx.shadowColor = 'rgba(120, 25, 55, 0.35)';
            ctx.shadowBlur = Math.min(25, 300 / p.z);
            ctx.shadowOffsetY = 4 * scale;
          }

          ctx.fill();

          // Delicate translucent rim curl highlight
          ctx.lineWidth = Math.max(1, 1.8 * scale);
          ctx.strokeStyle = 'rgba(255, 235, 242, 0.45)';
          ctx.stroke();

          ctx.restore();
        });

        // FULL SCREEN PETAL COVER DENSITY OVERLAY
        // During T_FULL_COVER, the screen is enveloped in moving, overlapping petals.
        if (elapsed >= T_FULL_COVER && elapsed < T_SWEEP_AWAY) {
          const coverRatio = Math.min(1, (elapsed - T_FULL_COVER) / 0.8);
          // Swirling ambient rose veil that enhances the full petal coverage without being a flat solid cut
          const veilGrad = ctx.createRadialGradient(
            width / 2 + Math.sin(elapsed * 2) * 50,
            height / 2 + Math.cos(elapsed * 2) * 40,
            50,
            width / 2,
            height / 2,
            Math.max(width, height) * 0.8
          );
          veilGrad.addColorStop(0, `rgba(244, 145, 170, ${0.45 * coverRatio})`);
          veilGrad.addColorStop(0.5, `rgba(230, 110, 140, ${0.4 * coverRatio})`);
          veilGrad.addColorStop(1, `rgba(215, 85, 120, ${0.35 * coverRatio})`);
          ctx.fillStyle = veilGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // SWEEP AWAY TO REVEAL LOVE LETTER
        if (elapsed >= T_SWEEP_AWAY) {
          const sweepProgress = (elapsed - T_SWEEP_AWAY) / (T_TOTAL_END - T_SWEEP_AWAY);
          canvasOpacity = Math.max(0, 1 - sweepProgress * 1.2);
          if (canvas) {
            canvas.style.opacity = String(canvasOpacity);
          }
        }
      }

      // Check if finished
      if (elapsed < T_TOTAL_END + 0.5) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        // Final handoff
        if (!hasTriggeredCompleteRef.current) {
          hasTriggeredCompleteRef.current = true;
          onComplete();
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [theme, onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#FAF6F6] select-none pointer-events-auto">
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block transition-opacity duration-1000 ease-out"
      />

      {/* Elegant Atmospheric Overlay Text */}
      <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none transition-all duration-700">
        <div className="flex items-center gap-2 mb-2 text-rose-500/80">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-sans-custom font-medium text-rose-600/70">
            Monthsary Rose Ceremony
          </span>
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <p className="font-cormorant text-2xl md:text-3xl text-rose-900/90 italic drop-shadow-sm max-w-lg transition-all duration-500">
          "{phaseText}"
        </p>
      </div>

      {/* Skip Button */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white/95 text-xs text-rose-800/80 hover:text-rose-900 backdrop-blur-md border border-rose-200/60 shadow-sm transition-all duration-200 cursor-pointer"
          title="Skip straight to your love letter"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip to Letter</span>
        </button>
      )}
    </div>
  );
};
