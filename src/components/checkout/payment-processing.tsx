'use client';

import { useEffect } from 'react';
import { BambuLoading } from '@/components/bambu/bambu-loading';

export function PaymentProcessing() {
  // Prevent body scroll while visible
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm"
      style={{ animation: 'fadeIn 300ms ease-out' }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <BambuLoading size={120} />
    </div>
  );
}
