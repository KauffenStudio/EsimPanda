import type {
  NormalizedDestination,
  NormalizedPackage,
  NormalizedPurchase,
} from './types';
import { CelitechAdapter } from './celitech-adapter';

export interface ESIMProvider {
  listDestinations(): Promise<NormalizedDestination[]>;
  listPackages(destinationIso: string): Promise<NormalizedPackage[]>;
  purchase(packageId: string, quantity: number): Promise<NormalizedPurchase>;
  getStatus(iccid: string): Promise<NormalizedPurchase>;
  topUp(iccid: string, packageId: string): Promise<NormalizedPurchase>;
}

export function createProvider(): ESIMProvider {
  return new CelitechAdapter();
}
