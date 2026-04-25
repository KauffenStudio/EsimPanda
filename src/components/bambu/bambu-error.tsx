'use client';

import { motion } from 'motion/react';

interface BambuErrorProps {
  size?: number;
  className?: string;
}

export function BambuError({ size = 120, className = '' }: BambuErrorProps) {
  return (
    <div className={`inline-flex items-center justify-center dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] ${className}`}>
      <motion.div
        animate={{ rotate: [-5, 5, -3, 3, 0] }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
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

          {/* Worried eyes */}
          <circle cx="44" cy="43" r="3.5" fill="white" />
          <circle cx="76" cy="43" r="3.5" fill="white" />
          <circle cx="44" cy="44" r="1.5" fill="white" opacity="0.6" />
          <circle cx="76" cy="44" r="1.5" fill="white" opacity="0.6" />

          {/* Worried eyebrows */}
          <path d="M38 37 Q44 34 50 37" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M70 37 Q76 34 82 37" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <ellipse cx="60" cy="54" rx="4" ry="3" fill="#1A1A1A" />

          {/* Worried mouth */}
          <path d="M52 62 Q60 57 68 62" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Sweat drop */}
          <motion.g
            animate={{ y: [0, 3, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <path
              d="M86 28 Q88 22 90 28 Q90 32 88 33 Q86 32 86 28Z"
              fill="#64B5F6"
            />
            <ellipse cx="88" cy="27" rx="1" ry="0.8" fill="white" opacity="0.6" />
          </motion.g>

          {/* Body */}
          <rect x="35" y="72" width="50" height="38" rx="18" fill="#1A1A1A" />

          {/* White belly */}
          <ellipse cx="60" cy="88" rx="16" ry="18" fill="white" />

          {/* Arms down apologetically */}
          <ellipse cx="28" cy="90" rx="10" ry="7" fill="#1A1A1A" transform="rotate(-10 28 90)" />
          <ellipse cx="92" cy="90" rx="10" ry="7" fill="#1A1A1A" transform="rotate(10 92 90)" />
        </svg>
      </motion.div>
    </div>
  );
}
