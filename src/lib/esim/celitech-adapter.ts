/* eslint-disable @typescript-eslint/no-explicit-any */
import { Celitech } from 'celitech-sdk';
import QRCode from 'qrcode';
import type { ESIMProvider } from './provider';
import type {
  NormalizedDestination,
  NormalizedPackage,
  NormalizedPurchase,
  PurchaseInput,
} from './types';

function unwrap<T = any>(response: any): T {
  return (response?.data ?? response) as T;
}

function mapStatus(raw: string | undefined): NormalizedPurchase['status'] {
  if (!raw) return 'pending';
  const v = raw.toLowerCase();
  if (v.includes('activ')) return 'active';
  if (v.includes('expir')) return 'expired';
  if (v.includes('deactiv') || v.includes('cancel') || v.includes('disabl')) return 'deactivated';
  return 'pending';
}

async function buildQrDataUrl(manualActivationCode: string): Promise<string> {
  if (!manualActivationCode) return '';
  return QRCode.toDataURL(manualActivationCode, { errorCorrectionLevel: 'M', margin: 1, width: 320 });
}

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
    const data = unwrap<{ destinations: any[] }>(response);
    return (data.destinations ?? []).map((d: any) => ({
      name: d.name,
      iso: d.destinationIso2 ?? d.isoCode ?? d.destination,
      region: typeof d.supportedCountries !== 'undefined' && d.supportedCountries.length > 1
        ? 'region'
        : (d.region ?? 'country'),
    }));
  }

  async listPackages(destinationIso: string): Promise<NormalizedPackage[]> {
    const response = await this.client.packages.listPackages({ destination: destinationIso } as any);
    const data = unwrap<{ packages: any[] }>(response);
    return (data.packages ?? []).map((p: any) => ({
      id: p.id,
      wholesaleId: p.id,
      destination: p.destinationIso2 ?? p.destination,
      dataGB: p.dataLimitInGb ?? p.dataInGb,
      durationDays: p.maxDays ?? p.duration ?? 0,
      wholesalePriceCents: typeof p.priceInCents === 'number'
        ? p.priceInCents
        : Math.round((p.price ?? 0) * 100),
      currency: p.currency ?? 'USD',
    }));
  }

  async purchase(input: PurchaseInput): Promise<NormalizedPurchase> {
    const response = await this.client.purchases.createPurchaseV2({
      destination: input.destination,
      dataLimitInGb: input.dataLimitInGb,
      duration: input.durationDays,
      quantity: 1,
      email: input.email,
      referenceId: input.referenceId,
    } as any);
    const data = unwrap<any>(response);
    const first = Array.isArray(data) ? data[0] : data;
    const profile = first?.profile ?? first;
    const manualActivationCode: string = profile?.manualActivationCode ?? profile?.activationCode ?? '';
    const activationQrBase64 = await buildQrDataUrl(manualActivationCode);

    return {
      iccid: profile?.iccid ?? '',
      activationQrBase64,
      manualActivationCode,
      iosActivationLink: profile?.iosActivationLink,
      androidActivationLink: profile?.androidActivationLink,
      status: 'pending',
    };
  }

  async getStatus(iccid: string): Promise<NormalizedPurchase> {
    const response = await this.client.eSim.getEsim({ iccid } as any);
    const data = unwrap<{ esim: any }>(response);
    const e = data.esim ?? data;
    const manualActivationCode: string = e?.manualActivationCode ?? '';
    const activationQrBase64 = manualActivationCode ? await buildQrDataUrl(manualActivationCode) : '';
    return {
      iccid: e?.iccid ?? iccid,
      activationQrBase64,
      manualActivationCode,
      iosActivationLink: e?.iosActivationLink,
      androidActivationLink: e?.androidActivationLink,
      status: mapStatus(e?.status),
    };
  }

  async topUp(iccid: string, dataLimitInGb: number, durationDays: number): Promise<NormalizedPurchase> {
    const response = await this.client.purchases.topUpEsim({
      iccid,
      dataLimitInGb,
      duration: durationDays,
    } as any);
    const data = unwrap<any>(response);
    const profile = data?.profile ?? {};
    return {
      iccid: profile?.iccid ?? iccid,
      activationQrBase64: '',
      manualActivationCode: '',
      status: 'pending',
    };
  }
}
