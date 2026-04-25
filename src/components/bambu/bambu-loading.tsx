'use client';

import { motion } from 'motion/react';

interface BambuLoadingProps {
  size?: number;
  className?: string;
}

export function BambuLoading({ size = 120, className = '' }: BambuLoadingProps) {
  return (
    <div className={`inline-flex items-center justify-center dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] ${className}`}>
      <motion.div
        animate={{ rotate: [0, -10, 0, 10, 0] }}
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

          {/* Happy eyes (eating) */}
          <path d="M39 43 Q44 39 49 43" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M71 43 Q76 39 81 43" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <ellipse cx="60" cy="54" rx="4" ry="3" fill="#1A1A1A" />

          {/* Open mouth (eating) */}
          <ellipse cx="60" cy="60" rx="6" ry="4" fill="#1A1A1A" />

          {/* Body */}
          <rect x="35" y="72" width="50" height="38" rx="18" fill="#1A1A1A" />

          {/* White belly */}
          <ellipse cx="60" cy="88" rx="16" ry="18" fill="white" />

          {/* Left arm (reaching for bamboo) */}
          <ellipse cx="28" cy="82" rx="10" ry="7" fill="#1A1A1A" transform="rotate(-35 28 82)" />

          {/* Right arm */}
          <ellipse cx="90" cy="86" rx="10" ry="7" fill="#1A1A1A" transform="rotate(20 90 86)" />

          {/* Bamboo stick */}
          <motion.g
            animate={{ y: [0, -3, 0, 3, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
          >
            {/* Main bamboo stalk */}
            <rect x="12" y="50" width="4" height="40" rx="2" fill="#43A047" />

            {/* Bamboo segments */}
            <rect x="11" y="58" width="6" height="2" rx="1" fill="#388E3C" />
            <rect x="11" y="70" width="6" height="2" rx="1" fill="#388E3C" />

            {/* Bamboo leaves */}
            <ellipse cx="8" cy="50" rx="6" ry="3" fill="#66BB6A" transform="rotate(-30 8 50)" />
            <ellipse cx="20" cy="54" rx="5" ry="2.5" fill="#66BB6A" transform="rotate(20 20 54)" />
            <ellipse cx="7" cy="62" rx="5" ry="2" fill="#66BB6A" transform="rotate(-15 7 62)" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
