import type {
  NormalizedConsumption,
  NormalizedDestination,
  NormalizedPackage,
  NormalizedPurchase,
  PurchaseInput,
} from './types';
import { CelitechAdapter } from './celitech-adapter';

export interface ESIMProvider {
  listDestinations(): Promise<NormalizedDestination[]>;
  listPackages(destinationIso: string): Promise<NormalizedPackage[]>;
  purchase(input: PurchaseInput): Promise<NormalizedPurchase>;
  getStatus(iccid: string): Promise<NormalizedPurchase>;
  /** Live data-remaining for an eSIM, looked up by ICCID. Returns null when no purchase matches (e.g. iccid typo or eSIM never purchased). */
  getConsumption(iccid: string): Promise<NormalizedConsumption | null>;
  topUp(iccid: string, dataLimitInGb: number, durationDays: number): Promise<NormalizedPurchase>;
}

export function createProvider(): ESIMProvider {
  return new CelitechAdapter();
}
