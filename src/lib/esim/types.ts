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
  status: 'pending' | 'active' | 'expired' | 'deactivated';
}

export interface PurchaseInput {
  destination: string;
  dataLimitInGb: number;
  durationDays: number;
  email?: string;
  referenceId?: string;
}

export interface NormalizedConsumption {
  /** Bytes remaining on the purchase. Celitech doesn't return "used", only "remaining" — derive used = total - remaining at the caller. */
  remainingBytes: number;
  /** Remaining GB (Celitech rounds; treat as ~2 decimals). */
  remainingGb: number;
  /** 'ACTIVE' once the user has started consuming data, 'NOT_ACTIVE' before first connection. */
  connectivityStatus: 'ACTIVE' | 'NOT_ACTIVE' | string;
}
