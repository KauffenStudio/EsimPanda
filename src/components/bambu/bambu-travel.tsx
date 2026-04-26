'use client';

import { motion } from 'motion/react';

interface BambuTravelProps {
  size?: number;
  className?: string;
}

export function BambuTravel({ size = 200, className = '' }: BambuTravelProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === PANDA CHARACTER (walking pose) === */}
        <motion.g
          animate={{ y: [0, -4, 0, -4, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          {/* Left ear */}
          <circle cx="70" cy="32" r="14" fill="#1A1A1A" />
          <circle cx="70" cy="32" r="7" fill="#2A2A2A" />

          {/* Right ear */}
          <circle cx="122" cy="32" r="14" fill="#1A1A1A" />
          <circle cx="122" cy="32" r="7" fill="#2A2A2A" />

          {/* Face */}
          <circle cx="96" cy="56" r="28" fill="white" />

          {/* Eye patches */}
          <ellipse cx="82" cy="52" rx="9" ry="7" fill="#1A1A1A" transform="rotate(-10 82 52)" />
          <ellipse cx="110" cy="52" rx="9" ry="7" fill="#1A1A1A" transform="rotate(10 110 52)" />

          {/* Excited eyes */}
          <circle cx="82" cy="51" r="3" fill="white" />
          <circle cx="110" cy="51" r="3" fill="white" />
          <circle cx="83" cy="50" r="1.5" fill="white" opacity="0.8" />
          <circle cx="111" cy="50" r="1.5" fill="white" opacity="0.8" />

          {/* Nose */}
          <ellipse cx="96" cy="62" rx="3.5" ry="2.5" fill="#1A1A1A" />

          {/* Big happy smile */}
          <path d="M87 66 Q96 74 105 66" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Blush marks */}
          <ellipse cx="74" cy="62" rx="3.5" ry="2" fill="#FF8A80" opacity="0.5" />
          <ellipse cx="118" cy="62" rx="3.5" ry="2" fill="#FF8A80" opacity="0.5" />

          {/* Body */}
          <rect x="72" y="78" width="48" height="36" rx="16" fill="#1A1A1A" />

          {/* White belly */}
          <ellipse cx="96" cy="94" rx="14" ry="16" fill="white" />

          {/* Right arm (holding suitcase handle) */}
          <motion.g
            animate={{ rotate: [0, 5, 0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            style={{ originX: '120px', originY: '90px' }}
          >
            <ellipse cx="126" cy="88" rx="9" ry="6" fill="#1A1A1A" transform="rotate(30 126 88)" />
          </motion.g>

          {/* Left arm (swinging) */}
          <motion.g
            animate={{ rotate: [10, -15, 10] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            style={{ originX: '68px', originY: '90px' }}
          >
            <ellipse cx="62" cy="88" rx="9" ry="6" fill="#1A1A1A" transform="rotate(-30 62 88)" />
          </motion.g>

          {/* Left leg (walking) */}
          <motion.g
            animate={{ rotate: [15, -15, 15] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            style={{ originX: '84px', originY: '110px' }}
          >
            <ellipse cx="84" cy="118" rx="8" ry="10" fill="#1A1A1A" />
          </motion.g>

          {/* Right leg (walking opposite) */}
          <motion.g
            animate={{ rotate: [-15, 15, -15] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            style={{ originX: '108px', originY: '110px' }}
          >
            <ellipse cx="108" cy="118" rx="8" ry="10" fill="#1A1A1A" />
          </motion.g>
        </motion.g>

        {/* === SUITCASE (bouncing alongside) === */}
        <motion.g
          animate={{ y: [0, -3, 0, -3, 0], rotate: [0, 2, 0, -2, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: [0.32, 0.72, 0, 1],
            delay: 0.1,
          }}
          style={{ originX: '148px', originY: '140px' }}
        >
          {/* Suitcase handle */}
          <rect x="143" y="88" width="10" height="14" rx="3" fill="none" stroke="#2979FF" strokeWidth="2.5" />

          {/* Suitcase body */}
          <rect x="132" y="100" width="32" height="42" rx="6" fill="#2979FF" />

          {/* Suitcase highlight */}
          <rect x="136" y="104" width="24" height="34" rx="4" fill="#4A93FF" opacity="0.4" />

          {/* Suitcase straps */}
          <rect x="132" y="114" width="32" height="3" rx="1" fill="#1E6AE1" />
          <rect x="132" y="128" width="32" height="3" rx="1" fill="#1E6AE1" />

          {/* Suitcase latch */}
          <rect x="144" y="112" width="8" height="5" rx="2" fill="#FFD54F" />

          {/* Travel stickers */}
          <circle cx="142" cy="122" r="4" fill="#FF8A80" opacity="0.8" />
          <circle cx="154" cy="134" r="3.5" fill="#66BB6A" opacity="0.8" />
          <rect x="139" y="132" width="6" height="4" rx="1" fill="#FFD54F" opacity="0.8" />

          {/* Suitcase wheels */}
          <circle cx="138" cy="144" r="3" fill="#27272A" />
          <circle cx="158" cy="144" r="3" fill="#27272A" />
          <circle cx="138" cy="144" r="1.5" fill="#52525B" />
          <circle cx="158" cy="144" r="1.5" fill="#52525B" />
        </motion.g>

        {/* === FLOATING TRAVEL ELEMENTS === */}
        {/* Airplane */}
        <motion.g
          animate={{ x: [0, 8, 0], y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <path d="M30 24 L42 20 L38 24 L44 26 L38 27 L42 31 L30 27 Z" fill="#2979FF" opacity="0.5" />
        </motion.g>

        {/* Small globe/earth */}
        <motion.g
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          style={{ originX: '170px', originY: '30px' }}
        >
          <circle cx="170" cy="30" r="10" fill="none" stroke="#2979FF" strokeWidth="1.5" opacity="0.3" />
          <path d="M160 30 Q165 22 170 30 Q175 38 180 30" stroke="#2979FF" strokeWidth="1" fill="none" opacity="0.3" />
          <line x1="170" y1="20" x2="170" y2="40" stroke="#2979FF" strokeWidth="0.8" opacity="0.2" />
        </motion.g>

        {/* Signal/wifi waves (eSIM!) */}
        <motion.g
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}
          style={{ originX: '42px', originY: '60px' }}
        >
          <path d="M34 56 Q42 48 50 56" stroke="#43A047" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
          <path d="M37 52 Q42 46 47 52" stroke="#43A047" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M40 48 Q42 45 44 48" stroke="#43A047" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
}
