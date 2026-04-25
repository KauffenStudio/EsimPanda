'use client';

import { motion } from 'motion/react';

interface BambuEmptyProps {
  size?: number;
  className?: string;
}

export function BambuEmpty({ size = 120, className = '' }: BambuEmptyProps) {
  return (
    <div className={`inline-flex items-center justify-center dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] ${className}`}>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
          type: 'spring',
          stiffness: 100,
          damping: 30,
        }}
      >
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

          {/* Curious wide eyes */}
          <circle cx="44" cy="43" r="4.5" fill="white" />
          <circle cx="76" cy="43" r="4.5" fill="white" />
          <circle cx="45" cy="42" r="2" fill="white" opacity="0.8" />
          <circle cx="77" cy="42" r="2" fill="white" opacity="0.8" />

          {/* Nose */}
          <ellipse cx="60" cy="54" rx="4" ry="3" fill="#1A1A1A" />

          {/* Curious open mouth */}
          <circle cx="60" cy="61" r="3" fill="#1A1A1A" />

          {/* Body */}
          <rect x="35" y="72" width="50" height="38" rx="18" fill="#1A1A1A" />

          {/* White belly */}
          <ellipse cx="60" cy="88" rx="16" ry="18" fill="white" />

          {/* Left arm slightly out */}
          <ellipse cx="28" cy="84" rx="10" ry="7" fill="#1A1A1A" transform="rotate(-25 28 84)" />

          {/* Right arm slightly out */}
          <ellipse cx="92" cy="84" rx="10" ry="7" fill="#1A1A1A" transform="rotate(25 92 84)" />
        </svg>
      </motion.div>
    </div>
  );
}
