import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ isActive = true, barCount = 18, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / barCount) - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isActive) {
          // Dynamic harmonic heights
          const time = Date.now() * 0.006;
          const wave1 = Math.sin(time + i * 0.4);
          const wave2 = Math.cos(time * 0.7 + i * 0.3);
          const magnitude = Math.abs(wave1 * 0.6 + wave2 * 0.4);
          barHeight = Math.max(4, magnitude * (height - 6));
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(1, '#d97706');

        ctx.fillStyle = isActive ? grad : '#78716c';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={32}
      className={`rounded-lg ${className}`}
    />
  );
}
