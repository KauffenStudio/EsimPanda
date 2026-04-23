'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { DeliveryData } from '@/lib/delivery/types';
import { detectDeviceFamily, isMobile } from './device-detection';
import { QrCodeDisplay } from './qr-code-display';
import { InstallButton } from './install-button';
import { ManualCodes } from './manual-codes';

interface EsimCredentialsProps {
  data: DeliveryData;
}

export function EsimCredentials({ data }: EsimCredentialsProps) {
  const deviceFamily = useMemo(
    () => (typeof navigator !== 'undefined' ? detectDeviceFamily(navigator.userAgent) : 'desktop'),
    []
  );
  const mobile = useMemo(
    () => (typeof navigator !== 'undefined' ? isMobile(navigator.userAgent) : false),
    []
  );

  // Determine the activation link based on device family
  const activationLink = useMemo(() => {
    if (deviceFamily === 'ios') return data.ios_activation_link;
    if (mobile) return data.android_activation_link;
    return undefined;
  }, [deviceFamily, mobile, data.ios_activation_link, data.android_activation_link]);

  // Build the LPA string for QR code content
  const qrData = `LPA:1$${data.smdp_address}$${data.manual_activation_code}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {mobile && activationLink ? (
        <InstallButton href={activationLink} />
      ) : (
        <QrCodeDisplay data={qrData} />
      )}

      <ManualCodes
        smdpAddress={data.smdp_address}
        activationCode={data.manual_activation_code}
      />
    </motion.div>
  );
}
