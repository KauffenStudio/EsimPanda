'use client';

import { motion } from 'motion/react';

interface BambuSuccessProps {
  size?: number;
  className?: string;
}

export function BambuSuccess({ size = 120, className = '' }: BambuSuccessProps) {
  return (
    <div className={`inline-flex items-center justify-center relative ${className}`}>
      {/* Sparkle top-left */}
      <motion.svg
        className="absolute -top-2 -left-2"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <path d="M8 0 L9 6 L16 8 L9 10 L8 16 L7 10 L0 8 L7 6 Z" fill="#FB8C00" />
      </motion.svg>

      {/* Sparkle top-right */}
      <motion.svg
        className="absolute -top-1 -right-3"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <path d="M8 0 L9 6 L16 8 L9 10 L8 16 L7 10 L0 8 L7 6 Z" fill="#2979FF" />
      </motion.svg>

      {/* Sparkle bottom-right */}
      <motion.svg
        className="absolute bottom-4 -right-2"
        width="10"
        height="10"
        viewBox="0 0 16 16"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <path d="M8 0 L9 6 L16 8 L9 10 L8 16 L7 10 L0 8 L7 6 Z" fill="#43A047" />
      </motion.svg>

      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.3, 0.9, 1.1, 1] }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 10,
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

          {/* Happy squinting eyes */}
          <path d="M39 43 Q44 38 49 43" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M71 43 Q76 38 81 43" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <ellipse cx="60" cy="54" rx="4" ry="3" fill="#1A1A1A" />

          {/* Big smile */}
          <path d="M50 58 Q60 68 70 58" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Blush marks */}
          <ellipse cx="36" cy="54" rx="5" ry="3" fill="#FF8A80" opacity="0.5" />
          <ellipse cx="84" cy="54" rx="5" ry="3" fill="#FF8A80" opacity="0.5" />

          {/* Body */}
          <rect x="35" y="72" width="50" height="38" rx="18" fill="#1A1A1A" />

          {/* White belly */}
          <ellipse cx="60" cy="88" rx="16" ry="18" fill="white" />

          {/* Arms raised in celebration */}
          <ellipse cx="24" cy="76" rx="10" ry="7" fill="#1A1A1A" transform="rotate(-45 24 76)" />
          <ellipse cx="96" cy="76" rx="10" ry="7" fill="#1A1A1A" transform="rotate(45 96 76)" />
        </svg>
      </motion.div>
    </div>
  );
}
