'use client';

import { useEffect, useRef } from 'react';

interface PlaceholderImageProps {
  text: string;
  width?: number;
  height?: number;
  bgColor?: string;
  textColor?: string;
}

export default function PlaceholderImage({ 
  text, 
  width = 500, 
  height = 500, 
  bgColor = '#f3f4f6',
  textColor = '#6b7280'
}: PlaceholderImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Add gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add measurement lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, height - 50);
    ctx.moveTo(width - 50, 50);
    ctx.lineTo(width - 50, height - 50);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(width - 50, 50);
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 50, height - 50);
    ctx.stroke();

    // Add text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Split text into lines
    const lines = text.split('\n');
    const lineHeight = 30;
    const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });
  }, [text, width, height, bgColor, textColor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover rounded-lg"
      style={{ aspectRatio: '1/1' }}
    />
  );
} 