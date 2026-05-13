import type {
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
  topUp(iccid: string, dataLimitInGb: number, durationDays: number): Promise<NormalizedPurchase>;
}

export function createProvider(): ESIMProvider {
  return new CelitechAdapter();
}
