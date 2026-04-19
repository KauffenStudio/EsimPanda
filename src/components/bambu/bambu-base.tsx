'use client';

import { motion, type TargetAndTransition } from 'motion/react';

export type BambuPose = 'idle' | 'loading' | 'success' | 'error' | 'browse' | 'empty';

interface BambuProps {
  pose?: BambuPose;
  size?: number;
  className?: string;
}

const poseVariants: Record<string, TargetAndTransition> = {
  idle: { rotate: 0, scale: 1 },
  success: { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] },
  error: { rotate: [-3, 3, -3, 0] },
  browse: { scale: 1, rotate: -5 },
  empty: { y: [0, -5, 0] },
};

function PandaSvg({ pose, size }: { pose: BambuPose; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left ear */}
      <circle cx="30" cy="22" r="16" fill="#1A1A1A" />
      <circle cx="30" cy="22" r="8" fill="#2A2A2A" />

      {/* Right ear */}
      <circle cx="90" cy="22" r="16" fill="#1A1A1A" />
      <circle cx="90" cy="22" r="8" fill="#2A2A2A" />

      {/* Face */}
      <circle cx="60" cy="48" r="30" fill="white" />

      {/* Eye patches */}
      <ellipse cx="44" cy="44" rx="10" ry="8" fill="#1A1A1A" transform="rotate(-10 44 44)" />
      <ellipse cx="76" cy="44" rx="10" ry="8" fill="#1A1A1A" transform="rotate(10 76 44)" />

      {/* Eyes */}
      <circle cx="44" cy="43" r="3" fill="white" />
      <circle cx="76" cy="43" r="3" fill="white" />
      <circle cx="45" cy="42" r="1.5" fill="white" opacity="0.8" />
      <circle cx="77" cy="42" r="1.5" fill="white" opacity="0.8" />

      {/* Nose */}
      <ellipse cx="60" cy="54" rx="4" ry="3" fill="#1A1A1A" />

      {/* Mouth */}
      <path d="M54 58 Q60 63 66 58" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Body */}
      <rect x="35" y="72" width="50" height="38" rx="18" fill="#1A1A1A" />

      {/* White belly */}
      <ellipse cx="60" cy="88" rx="16" ry="18" fill="white" />

      {/* Left arm */}
      <ellipse cx="30" cy="86" rx="10" ry="7" fill="#1A1A1A" transform="rotate(-20 30 86)" />

      {/* Right arm */}
      <ellipse cx="90" cy="86" rx="10" ry="7" fill="#1A1A1A" transform="rotate(20 90 86)" />

      {/* Binoculars for browse pose */}
      {pose === 'browse' && (
        <g>
          {/* Binocular left barrel */}
          <rect x="33" y="36" width="14" height="12" rx="6" fill="#616161" />
          <circle cx="40" cy="36" r="7" fill="#9E9E9E" stroke="#616161" strokeWidth="1.5" />
          <circle cx="40" cy="36" r="4" fill="#2979FF" opacity="0.3" />

          {/* Binocular right barrel */}
          <rect x="73" y="36" width="14" height="12" rx="6" fill="#616161" />
          <circle cx="80" cy="36" r="7" fill="#9E9E9E" stroke="#616161" strokeWidth="1.5" />
          <circle cx="80" cy="36" r="4" fill="#2979FF" opacity="0.3" />

          {/* Binocular bridge */}
          <rect x="47" y="38" width="26" height="4" rx="2" fill="#616161" />

          {/* Strap */}
          <path d="M33 42 Q20 60 30 80" stroke="#2979FF" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M87 42 Q100 60 90 80" stroke="#2979FF" strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>
      )}

      {/* Curious wide eyes for empty pose */}
      {pose === 'empty' && (
        <g>
          <circle cx="44" cy="43" r="4" fill="white" />
          <circle cx="76" cy="43" r="4" fill="white" />
          <circle cx="45" cy="42" r="2" fill="white" opacity="0.8" />
          <circle cx="77" cy="42" r="2" fill="white" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

export function Bambu({ pose = 'idle', size = 120, className = '' }: BambuProps) {
  const variant = poseVariants[pose] || poseVariants.idle;

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      animate={variant}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
      }}
    >
      <PandaSvg pose={pose} size={size} />
    </motion.div>
  );
}
