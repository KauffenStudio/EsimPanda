'use client';

import { useMemo } from 'react';

interface ConfettiEffectProps {
  active: boolean;
}

const COLORS = ['#2979FF', '#43A047', '#FFD700', '#2979FF', '#43A047'];
const PARTICLE_COUNT = 40;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function ConfettiEffect({ active }: ConfettiEffectProps) {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      left: `${randomBetween(5, 95)}%`,
      color: COLORS[i % COLORS.length],
      width: randomBetween(6, 10),
      height: randomBetween(4, 8),
      rotation: randomBetween(0, 360),
      delay: randomBetween(0, 0.5),
      duration: randomBetween(1.5, 2),
      xDrift: randomBetween(-40, 40),
    }));
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) translateX(0px) rotate(0deg);
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(var(--x-drift)) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-10px',
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--x-drift' as any]: `${p.xDrift}px`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
