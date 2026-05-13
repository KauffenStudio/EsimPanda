/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDestinationsList = vi.fn();
const mockPackagesList = vi.fn();
const mockPurchasesCreateV2 = vi.fn();
const mockPurchasesTopUp = vi.fn();
const mockEsimGetEsim = vi.fn();

vi.mock('celitech-sdk', () => {
  class MockCelitech {
    destinations = { listDestinations: mockDestinationsList };
    packages = { listPackages: mockPackagesList };
    purchases = { createPurchaseV2: mockPurchasesCreateV2, topUpEsim: mockPurchasesTopUp };
    eSim = { getEsim: mockEsimGetEsim };
    constructor(_opts: any) {}
  }
  return { Celitech: MockCelitech };
});

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,QR') },
}));

import { CelitechAdapter } from '../celitech-adapter';
import type { NormalizedDestination, NormalizedPackage, NormalizedPurchase } from '../types';

describe('CelitechAdapter (real SDK shapes)', () => {
  let adapter: CelitechAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new CelitechAdapter();
  });

  describe('listDestinations', () => {
    it('maps response.data.destinations using destinationIso2', async () => {
      mockDestinationsList.mockResolvedValue({
        data: {
          destinations: [
            { name: 'France', destination: 'FRA', destinationIso2: 'FR', supportedCountries: ['France'] },
            { name: 'Africa (16 countries)', destination: 'AFRICA', destinationIso2: 'AFRICA', supportedCountries: ['Botswana', 'Cameroon'] },
          ],
        },
      });

      const result: NormalizedDestination[] = await adapter.listDestinations();

      expect(result[0]).toEqual({ name: 'France', iso: 'FR', region: 'country' });
      expect(result[1]).toEqual({ name: 'Africa (16 countries)', iso: 'AFRICA', region: 'region' });
    });

    it('handles response without data wrapper', async () => {
      mockDestinationsList.mockResolvedValue({
        destinations: [{ name: 'Japan', destinationIso2: 'JP', supportedCountries: ['Japan'] }],
      });

      const result = await adapter.listDestinations();
      expect(result[0].iso).toBe('JP');
    });
  });

  describe('listPackages', () => {
    it('maps response.data.packages with priceInCents (no float math)', async () => {
      mockPackagesList.mockResolvedValue({
        data: {
          packages: [
            {
              id: '7013cb69-uuid',
              destination: 'PRT',
              destinationIso2: 'PT',
              dataLimitInBytes: 1073741824,
              dataLimitInGb: 1,
              minDays: 0,
              maxDays: 30,
              priceInCents: 400,
            },
          ],
        },
      });

      const result: NormalizedPackage[] = await adapter.listPackages('PT');

      expect(result[0]).toEqual({
        id: '7013cb69-uuid',
        wholesaleId: '7013cb69-uuid',
        destination: 'PT',
        dataGB: 1,
        durationDays: 30,
        wholesalePriceCents: 400,
        currency: 'USD',
      });
    });
  });

  describe('purchase', () => {
    it('calls createPurchaseV2 with plan descriptor and generates QR from manual activation code', async () => {
      mockPurchasesCreateV2.mockResolvedValue({
        data: [
          {
            purchase: { id: 'p1', packageId: 'pkg1', createdDate: '2026-05-13' },
            profile: {
              iccid: '8901234567890123456',
              activationCode: 'LPA:1$smdp.example.com$AC',
              manualActivationCode: 'LPA:1$smdp.example.com$AC',
              iosActivationLink: 'https://ios.link',
              androidActivationLink: 'https://android.link',
            },
          },
        ],
      });

      const result: NormalizedPurchase = await adapter.purchase({
        destination: 'PT',
        dataLimitInGb: 1,
        durationDays: 7,
        email: 'user@example.com',
        referenceId: 'ORD-ABC123',
      });

      expect(mockPurchasesCreateV2).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'PT',
          dataLimitInGb: 1,
          duration: 7,
          quantity: 1,
          email: 'user@example.com',
          referenceId: 'ORD-ABC123',
        }),
      );

      expect(result.iccid).toBe('8901234567890123456');
      expect(result.manualActivationCode).toBe('LPA:1$smdp.example.com$AC');
      expect(result.activationQrBase64).toBe('data:image/png;base64,QR');
      expect(result.iosActivationLink).toBe('https://ios.link');
      expect(result.androidActivationLink).toBe('https://android.link');
      expect(result.status).toBe('pending');
    });
  });

  describe('getStatus', () => {
    it('maps response.data.esim and normalizes status', async () => {
      mockEsimGetEsim.mockResolvedValue({
        data: {
          esim: {
            iccid: '89012',
            smdpAddress: 'smdp.example.com',
            activationCode: 'AC',
            manualActivationCode: 'LPA:1$smdp.example.com$AC',
            status: 'ENABLED',
            connectivityStatus: 'CONNECTED',
            isTopUpAllowed: true,
          },
        },
      });

      const result = await adapter.getStatus('89012');
      expect(result.iccid).toBe('89012');
      expect(result.manualActivationCode).toBe('LPA:1$smdp.example.com$AC');
      expect(result.activationQrBase64).toBe('data:image/png;base64,QR');
      expect(result.status).toBe('pending');
    });
  });
});
