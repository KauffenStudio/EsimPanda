'use client';

import { motion } from 'motion/react';

interface BambuWelcomeProps {
  variant?: 'wave' | 'bounce';
  size?: number;
  className?: string;
}

export function BambuWelcome({ variant = 'wave', size = 120, className = '' }: BambuWelcomeProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <motion.div
        initial={variant === 'bounce' ? { scale: 1, y: 0 } : undefined}
        animate={
          variant === 'bounce'
            ? { scale: [1, 1.15, 0.95, 1.05, 1], y: [0, -12, 0, -6, 0] }
            : undefined
        }
        transition={
          variant === 'bounce'
            ? { type: 'spring', stiffness: 400, damping: 10 }
            : undefined
        }
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

          {/* Friendly eyes */}
          <circle cx="44" cy="43" r="3" fill="white" />
          <circle cx="76" cy="43" r="3" fill="white" />
          <circle cx="45" cy="42" r="1.5" fill="white" opacity="0.8" />
          <circle cx="77" cy="42" r="1.5" fill="white" opacity="0.8" />

          {/* Nose */}
          <ellipse cx="60" cy="54" rx="4" ry="3" fill="#1A1A1A" />

          {/* Smile */}
          <path d="M52 58 Q60 65 68 58" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Blush marks */}
          <ellipse cx="36" cy="54" rx="4" ry="2.5" fill="#FF8A80" opacity="0.4" />
          <ellipse cx="84" cy="54" rx="4" ry="2.5" fill="#FF8A80" opacity="0.4" />

          {/* Body */}
          <rect x="35" y="72" width="50" height="38" rx="18" fill="#1A1A1A" />

          {/* White belly */}
          <ellipse cx="60" cy="88" rx="16" ry="18" fill="white" />

          {/* Left arm (resting) */}
          <ellipse cx="30" cy="86" rx="10" ry="7" fill="#1A1A1A" transform="rotate(-20 30 86)" />

          {/* Right arm (waving) */}
          <motion.g
            animate={
              variant === 'wave'
                ? { rotate: [0, -20, 15, -15, 10, 0] }
                : undefined
            }
            transition={
              variant === 'wave'
                ? {
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }
                : undefined
            }
            style={{ originX: '80px', originY: '86px' }}
          >
            <ellipse cx="96" cy="76" rx="10" ry="7" fill="#1A1A1A" transform="rotate(-30 96 76)" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}
