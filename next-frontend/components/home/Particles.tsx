'use client';

import React, { useEffect, useRef } from 'react';

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  color?: string;
  refresh?: boolean;
}

export default function Particles({
  className = '',
  quantity = 150,
  staticity = 50,
  ease = 50,
  color = '#ffffff',
  refresh = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const particles = useRef<any[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext('2d');
    }
    initCanvas();
    animate();
    window.addEventListener('resize', initCanvas);

    return () => {
      window.removeEventListener('resize', initCanvas);
    };
  }, [color]);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

  const onMouseMove = (e: MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { clientX, clientY } = e;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      mouse.current.x = x * dpr;
      mouse.current.y = y * dpr;
    }
  };

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      particles.current = [];
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  type Particle = {
    x: number;
    y: number;
    translateX: number;
    translateY: number;
    size: number;
    alpha: number;
    targetAlpha: number;
    dx: number;
    dy: number;
    magnetism: number;
  };

  const circleParams = (): Particle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const size = Math.floor(Math.random() * 2) + 0.1;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.2;
    const dy = (Math.random() - 0.5) * 0.2;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const drawCircle = (circle: Particle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      
      // Glow Effect
      context.current.shadowBlur = size * 4;
      context.current.shadowColor = `rgba(${hexToRgb(color)}, ${alpha})`;
      
      context.current.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        particles.current.push(circle);
      }
    }
  };

  const hexToRgb = (hex: string): string => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  const drawParticles = () => {
    for (let i = 0; i < quantity; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  };

  const remapValue = (
    value: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number,
  ): number => {
    const rel = (value - start1) / (stop1 - start1);
    return start2 + rel * (stop2 - start2);
  };

  const animate = () => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w * dpr,
        canvasSize.current.h * dpr,
      );
      particles.current.forEach((particle: Particle, i: number) => {
        // Handle transparency
        const edge = [
          particle.x + particle.translateX - particle.size, // left
          canvasSize.current.w - particle.x - particle.translateX - particle.size, // right
          particle.y + particle.translateY - particle.size, // top
          canvasSize.current.h - particle.y - particle.translateY - particle.size, // bottom
        ];
        const closestEdge = Math.min(...edge);
        const remapClosestEdge = parseFloat(
          remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
        );

        if (remapClosestEdge > 1) {
          particle.alpha += 0.02;
          if (particle.alpha > particle.targetAlpha) {
            particle.alpha = particle.targetAlpha;
          }
        } else {
          particle.alpha = particle.targetAlpha * remapClosestEdge;
        }

        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.translateX +=
          (mouse.current.x / (staticity / particle.magnetism) -
            particle.translateX) /
          ease;
        particle.translateY +=
          (mouse.current.y / (staticity / particle.magnetism) -
            particle.translateY) /
          ease;

        // circle gets out of the canvas
        if (
          particle.x < -particle.size ||
          particle.x > canvasSize.current.w + particle.size ||
          particle.y < -particle.size ||
          particle.y > canvasSize.current.h + particle.size
        ) {
          // remove the circle from the array
          particles.current.splice(i, 1);
          // add a new circle
          const newParticle = circleParams();
          drawCircle(newParticle);
        } else {
          drawCircle(
            {
              ...particle,
              x: particle.x,
              y: particle.y,
              translateX: particle.translateX,
              translateY: particle.translateY,
              alpha: particle.alpha,
            },
            true,
          );
        }
      });
    }
    window.requestAnimationFrame(animate);
  };

  return (
    <div
      className={`${className} absolute inset-0 pointer-events-none`}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
