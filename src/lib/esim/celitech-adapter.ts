/* eslint-disable @typescript-eslint/no-explicit-any */
import { Celitech } from 'celitech-sdk';
import type {
  ESIMProvider,
} from './provider';
import type {
  NormalizedDestination,
  NormalizedPackage,
  NormalizedPurchase,
} from './types';

export class CelitechAdapter implements ESIMProvider {
  private client: InstanceType<typeof Celitech>;

  constructor() {
    this.client = new Celitech({
      clientId: process.env.CELITECH_CLIENT_ID!,
      clientSecret: process.env.CELITECH_CLIENT_SECRET!,
    });
  }

  async listDestinations(): Promise<NormalizedDestination[]> {
    const response = await this.client.destinations.listDestinations();
    return (response as any).destinations.map((d: any) => ({
      name: d.name,
      iso: d.isoCode,
      region: d.region ?? 'unknown',
    }));
  }

  async listPackages(destinationIso: string): Promise<NormalizedPackage[]> {
    const response = await this.client.packages.listPackages({ destination: destinationIso } as any);
    return (response as any).packages.map((p: any) => ({
      id: p.id,
      wholesaleId: p.id,
      destination: p.destination,
      dataGB: p.dataInGb,
      durationDays: p.duration,
      wholesalePriceCents: Math.round(p.price * 100),
      currency: p.currency,
    }));
  }

  async purchase(packageId: string, quantity: number): Promise<NormalizedPurchase> {
    const response = await this.client.purchases.createPurchase({
      packageId,
      quantity,
    } as any);
    const p = (response as any).purchase;
    return {
      iccid: p.iccid,
      activationQrBase64: p.qrCode,
      manualActivationCode: p.manualActivationCode,
      iosActivationLink: p.iosActivationLink,
      androidActivationLink: p.androidActivationLink,
      status: p.status,
    };
  }

  async getStatus(iccid: string): Promise<NormalizedPurchase> {
    const response = await this.client.eSim.getEsim({ iccid } as any);
    const e = (response as any).esim;
    return {
      iccid: e.iccid,
      activationQrBase64: e.qrCode ?? '',
      manualActivationCode: e.manualActivationCode ?? '',
      iosActivationLink: e.iosActivationLink,
      androidActivationLink: e.androidActivationLink,
      status: e.status,
    };
  }

  async topUp(iccid: string, packageId: string): Promise<NormalizedPurchase> {
    const response = await this.client.purchases.topUpEsim({
      iccid,
      packageId,
    } as any);
    const p = (response as any).purchase;
    return {
      iccid: p.iccid,
      activationQrBase64: p.qrCode ?? '',
      manualActivationCode: p.manualActivationCode ?? '',
      iosActivationLink: p.iosActivationLink,
      androidActivationLink: p.androidActivationLink,
      status: p.status,
    };
  }
}
