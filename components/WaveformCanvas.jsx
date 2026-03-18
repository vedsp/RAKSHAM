'use client';

import { useEffect, useRef } from 'react';

export default function WaveformCanvas({ analyser, isActive }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(0);

  useEffect(() => {
    if (!analyser || !isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 32;
      const barWidth = (width / barCount) * 0.7;
      const gap = (width / barCount) * 0.3;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(2, value * height);

        // Color gradient: green → yellow → red based on volume
        const hue = 120 - value * 120; // 120=green, 0=red
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;

        const x = i * (barWidth + gap);
        const y = height - barHeight;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className="w-full h-[60px] rounded-lg bg-[#0f172a]/50"
    />
  );
}
