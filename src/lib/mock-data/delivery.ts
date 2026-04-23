import type { NormalizedPurchase } from '@/lib/esim/types';

export const MOCK_ICCID = '8901234567890123456';
export const MOCK_SMDP_ADDRESS = 'smdp.example.com';
export const MOCK_ACTIVATION_CODE = 'K2-ABC123-DEF456';
export const MOCK_IOS_LINK =
  'https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$smdp.example.com$K2-ABC123-DEF456';
export const MOCK_ANDROID_LINK = 'LPA:1$smdp.example.com$K2-ABC123-DEF456';

// Minimal valid 1x1 transparent PNG as base64
export const MOCK_QR_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Simulates eSIM provisioning with a 3-5 second delay.
 * Returns mock activation data matching NormalizedPurchase shape.
 */
export function mockProvision(): Promise<NormalizedPurchase> {
  const delay = 3000 + Math.random() * 2000;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        iccid: MOCK_ICCID,
        activationQrBase64: MOCK_QR_BASE64,
        manualActivationCode: MOCK_ACTIVATION_CODE,
        iosActivationLink: MOCK_IOS_LINK,
        androidActivationLink: MOCK_ANDROID_LINK,
        status: 'active',
      });
    }, delay);
  });
}
