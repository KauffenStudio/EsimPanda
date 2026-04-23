'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

interface QrCodeDisplayProps {
  data: string;
  size?: number;
}

export function QrCodeDisplay({ data, size }: QrCodeDisplayProps) {
  const t = useTranslations('delivery');

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
      <div className="rounded-[10px] border border-border border-t-[3px] border-t-accent bg-white p-4 sm:p-6">
        <QRCodeSVG
          value={data}
          size={size}
          level="M"
          includeMargin={false}
          className="h-[160px] w-[160px] sm:h-[200px] sm:w-[200px]"
        />
      </div>
      <p className="mt-2 text-center text-base text-gray-600">
        {t('qr.instruction')}
      </p>
    </motion.div>
  );
}
