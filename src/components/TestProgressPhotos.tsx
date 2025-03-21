'use client';

import { useEffect } from 'react';

function generatePlaceholderImage(text: string, bgColor: string, textColor: string = 'white'): string {
  const canvas = document.createElement('canvas');
  // Make it square (1:1 aspect ratio)
  canvas.width = 500;
  canvas.height = 500;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add text
  ctx.fillStyle = textColor;
  ctx.font = 'bold 32px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Split text into lines
  const lines = text.split('\n');
  const lineHeight = 40;
  const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
  
  // Add text shadow for better readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
  });

  // Add measurement lines
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  
  // Vertical measurement lines
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(50, canvas.height - 50);
  ctx.moveTo(canvas.width - 50, 50);
  ctx.lineTo(canvas.width - 50, canvas.height - 50);
  ctx.stroke();

  // Horizontal measurement lines
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.lineTo(canvas.width - 50, 50);
  ctx.moveTo(50, canvas.height - 50);
  ctx.lineTo(canvas.width - 50, canvas.height - 50);
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.9);
}

export function useGenerateTestPhotos() {
  useEffect(() => {
    const beforeFront = generatePlaceholderImage('BEFORE\nFront View\nJan 15, 2024\n165 lbs', '#2563eb');
    const beforeSide = generatePlaceholderImage('BEFORE\nSide View\nJan 15, 2024\n36" Waist', '#2563eb');
    const beforeBack = generatePlaceholderImage('BEFORE\nBack View\nJan 15, 2024', '#2563eb');

    const progress1Front = generatePlaceholderImage('PROGRESS\nFront View\nFeb 15, 2024\n160 lbs', '#9333ea');
    const progress1Side = generatePlaceholderImage('PROGRESS\nSide View\nFeb 15, 2024\n34" Waist', '#9333ea');
    const progress1Back = generatePlaceholderImage('PROGRESS\nBack View\nFeb 15, 2024', '#9333ea');

    const afterFront = generatePlaceholderImage('AFTER\nFront View\nMar 15, 2024\n155 lbs', '#16a34a');
    const afterSide = generatePlaceholderImage('AFTER\nSide View\nMar 15, 2024\n32" Waist', '#16a34a');
    const afterBack = generatePlaceholderImage('AFTER\nBack View\nMar 15, 2024', '#16a34a');

    // Save the generated images to localStorage
    localStorage.setItem('testProgressPhotos', JSON.stringify([
      {
        date: '2024-01-15',
        front: beforeFront,
        side: beforeSide,
        back: beforeBack
      },
      {
        date: '2024-02-15',
        front: progress1Front,
        side: progress1Side,
        back: progress1Back
      },
      {
        date: '2024-03-15',
        front: afterFront,
        side: afterSide,
        back: afterBack
      }
    ]));
  }, []);

  return {
    getTestPhotos: () => {
      const photos = localStorage.getItem('testProgressPhotos');
      return photos ? JSON.parse(photos) : null;
    }
  };
} 