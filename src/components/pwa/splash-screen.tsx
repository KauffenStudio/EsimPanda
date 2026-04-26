'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BambuVideo } from '@/components/bambu/bambu-video';

const SPLASH_DURATION = 3800;
const SPLASH_KEY = 'esim-panda-splash-seen';

export function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(SPLASH_KEY);
    if (!seen) {
      setShow(true);
      sessionStorage.setItem(SPLASH_KEY, '1');
      const timer = setTimeout(() => setShow(false), SPLASH_DURATION);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)' }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-background-dark overflow-hidden"
          onClick={() => setShow(false)}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-accent/5 dark:from-accent/10 dark:via-transparent dark:to-accent/10" />

          {/* 3D Panda walking with suitcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10"
          >
            <BambuVideo variant="splash" size={280} loop={false} />
          </motion.div>

          {/* Brand text appears after video starts */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 1.2, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 flex flex-col items-center mt-4"
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-primary dark:text-gray-100">
              eSIM Panda
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="text-gray-400 text-sm mt-2 tracking-wide"
            >
              Travel connected everywhere
            </motion.p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-[15%] flex gap-1.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
                className="w-1.5 h-1.5 rounded-full bg-accent"
              />
            ))}
          </motion.div>

          {/* Skip hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2.5 }}
            className="absolute bottom-[8%] text-xs text-gray-400"
          >
            Tap to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
