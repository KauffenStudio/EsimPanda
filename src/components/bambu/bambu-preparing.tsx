'use client';

import { motion } from 'motion/react';

interface BambuPreparingProps {
  size?: number;
  className?: string;
}

export function BambuPreparing({ size = 160, className = '' }: BambuPreparingProps) {
  return (
    <div className={`inline-flex items-center justify-center dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] ${className}`}>
      <motion.div
        animate={{ y: [-5, 5, -5], rotate: [-3, 3, -3] }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
          type: 'spring',
          stiffness: 300,
          damping: 15,
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

          {/* Focused eyes (looking down at package) */}
          <circle cx="44" cy="45" r="3" fill="white" />
          <circle cx="76" cy="45" r="3" fill="white" />
          <circle cx="44" cy="46" r="1.5" fill="white" opacity="0.8" />
          <circle cx="76" cy="46" r="1.5" fill="white" opacity="0.8" />

          {/* Nose */}
          <ellipse cx="60" cy="54" rx="4" ry="3" fill="#1A1A1A" />

          {/* Slight smile (concentrated) */}
          <path d="M54 59 Q60 62 66 59" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Body */}
          <rect x="35" y="72" width="50" height="38" rx="18" fill="#1A1A1A" />

          {/* White belly */}
          <ellipse cx="60" cy="88" rx="16" ry="18" fill="white" />

          {/* Left arm (holding package) */}
          <ellipse cx="32" cy="82" rx="10" ry="7" fill="#1A1A1A" transform="rotate(-25 32 82)" />

          {/* Right arm (holding package) */}
          <ellipse cx="88" cy="82" rx="10" ry="7" fill="#1A1A1A" transform="rotate(25 88 82)" />

          {/* Gift box / package between paws */}
          <motion.g
            animate={{ y: [-2, 2, -2], rotate: [-2, 2, -2] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
          >
            {/* Box body */}
            <rect x="46" y="76" width="28" height="20" rx="3" fill="#2979FF" />
            {/* Box lid */}
            <rect x="44" y="73" width="32" height="6" rx="2" fill="#1E88E5" />
            {/* Ribbon vertical */}
            <rect x="58" y="73" width="4" height="23" fill="#FB8C00" />
            {/* Ribbon horizontal */}
            <rect x="44" y="82" width="32" height="4" fill="#FB8C00" />
            {/* Bow */}
            <ellipse cx="56" cy="73" rx="5" ry="3" fill="#FB8C00" />
            <ellipse cx="64" cy="73" rx="5" ry="3" fill="#FB8C00" />
            <circle cx="60" cy="73" r="2" fill="#F57C00" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
