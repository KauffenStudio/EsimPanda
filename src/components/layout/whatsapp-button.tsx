'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '351000000000';

function useScrollDirection() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (Math.abs(diff) < 10) return; // threshold to avoid jitter

      if (currentY < 50 || diff < 0) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      lastScrollY.current = currentY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return visible;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export function WhatsAppButton() {
  const pathname = usePathname();
  const t = useTranslations();
  const scrollVisible = useScrollDirection();
  const isMobile = useIsMobile();
  const [showPulse, setShowPulse] = useState(false);

  // First-visit pulse detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shown = localStorage.getItem('whatsapp_pulse_shown');
    if (!shown) {
      setShowPulse(true);
      const timer = setTimeout(() => {
        setShowPulse(false);
        localStorage.setItem('whatsapp_pulse_shown', 'true');
      }, 2000); // 3 cycles x 600ms + buffer
      return () => clearTimeout(timer);
    }
  }, []);

  function getContextMessage(): string {
    if (pathname.includes('/browse')) {
      return t('whatsapp.browsePage');
    }
    if (pathname.includes('/checkout')) {
      return t('whatsapp.checkoutPage');
    }
    if (pathname.includes('/delivery') || pathname.includes('/success')) {
      return t('whatsapp.deliveryPage');
    }
    if (pathname.includes('/dashboard')) {
      return t('whatsapp.dashboardPage');
    }
    return t('whatsapp.defaultMessage');
  }

  const contextMessage = getContextMessage();
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(contextMessage)}`;
  const isVisible = !isMobile || scrollVisible;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed z-40 right-5"
          style={{ bottom: isMobile ? '80px' : '20px' }}
        >
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('whatsapp.ariaLabel')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={showPulse ? { scale: [1, 1.15, 1] } : {}}
            transition={showPulse ? { duration: 0.6, repeat: 2, ease: 'easeInOut' } : {}}
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
