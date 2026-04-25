'use client';

import { motion } from 'motion/react';

interface CircularGaugeProps {
  total_gb: number;
  used_gb: number;
  size?: number;
  stroke_width?: number;
  status?: 'pending' | 'active' | 'expired';
  destination?: string;
}

function getColor(remaining_pct: number): string {
  if (remaining_pct > 20) return '#2979FF';
  if (remaining_pct >= 10) return '#FB8C00';
  return '#E53935';
}

export function CircularGauge({
  total_gb,
  used_gb,
  size = 96,
  stroke_width = 8,
  status,
  destination,
}: CircularGaugeProps) {
  const radius = (size - stroke_width) / 2;
  const circumference = 2 * Math.PI * radius;
  const remaining_gb = Math.max(0, total_gb - used_gb);
  const remaining_pct = total_gb > 0 ? (remaining_gb / total_gb) * 100 : 0;
  const strokeDashoffset = circumference * (1 - remaining_pct / 100);
  const isExpired = status === 'expired';
  const color = isExpired ? '#9E9E9E' : getColor(remaining_pct);
  const center = size / 2;

  return (
    <div
      role="progressbar"
      aria-valuenow={remaining_gb}
      aria-valuemin={0}
      aria-valuemax={total_gb}
      aria-label={destination ? `Data usage for ${destination}` : undefined}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-border dark:text-border-dark"
          strokeWidth={stroke_width}
        />

        {/* Progress circle */}
        {!isExpired && (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke_width}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isExpired ? (
          <span className="text-sm font-normal" style={{ color: '#9E9E9E' }}>
            Expired
          </span>
        ) : (
          <>
            <span className="text-2xl font-bold leading-none dark:text-gray-100" style={{ fontSize: 24, fontWeight: 700 }}>
              {remaining_gb.toFixed(1)}
            </span>
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400" style={{ fontSize: 14, fontWeight: 400 }}>
              GB left
            </span>
          </>
        )}
      </div>
    </div>
  );
}
