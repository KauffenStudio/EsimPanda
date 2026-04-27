'use client';

import { useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface QrCodeDisplayProps {
  data: string;
  size?: number;
}

export function QrCodeDisplay({ data, size }: QrCodeDisplayProps) {
  const t = useTranslations('delivery');
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const padding = 32;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'esim-qr-code.png';
      link.href = pngUrl;
      link.click();
    };
    img.src = url;
  }, []);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
      }}
      className="flex flex-col items-center"
    >
      <div ref={qrRef} className="rounded-[10px] border border-border dark:border-border-dark border-t-[3px] border-t-accent bg-white p-4 sm:p-6">
        <QRCodeSVG
          value={data}
          size={size}
          level="M"
          includeMargin={false}
          className="h-[160px] w-[160px] sm:h-[200px] sm:w-[200px]"
        />
      </div>
      <p className="mt-2 text-center text-base text-gray-600 dark:text-gray-400">
        {t('qr.instruction')}
      </p>
      <button
        type="button"
        onClick={handleDownload}
        className="mt-2 flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"
      >
        <Download size={14} />
        {t('qr.download')}
      </button>
    </motion.div>
  );
}
