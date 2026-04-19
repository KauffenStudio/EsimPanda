export interface NormalizedDestination {
  name: string;
  iso: string;
  region: string;
}

export interface NormalizedPackage {
  id: string;
  wholesaleId: string;
  destination: string;
  dataGB: number;
  durationDays: number;
  wholesalePriceCents: number;
  currency: string;
}

export interface NormalizedPurchase {
  iccid: string;
  activationQrBase64: string;
  manualActivationCode: string;
  iosActivationLink?: string;
  androidActivationLink?: string;
  status: 'pending' | 'active' | 'expired';
}
