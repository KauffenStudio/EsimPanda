import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import deviceList from '@/components/browse/device-compatibility/device-list.json';

interface DeviceCompatState {
  brand: string | null;
  model: string | null;
  isCompatible: boolean | null;
  setBrand: (brand: string) => void;
  setModel: (model: string) => void;
  checkCompatibility: () => void;
  reset: () => void;
}

export function getBrands(): string[] {
  return deviceList.brands.map(b => b.name);
}

export function getModelsForBrand(brand: string): string[] {
  return deviceList.brands.find(b => b.name === brand)?.models ?? [];
}

export const useDeviceCompatStore = create<DeviceCompatState>()(
  persist(
    (set, get) => ({
      brand: null,
      model: null,
      isCompatible: null,
      setBrand: (brand) => set({ brand, model: null, isCompatible: null }),
      setModel: (model) => set({ model }),
      checkCompatibility: () => {
        const { brand, model } = get();
        if (!brand || !model) { set({ isCompatible: null }); return; }
        const brandEntry = deviceList.brands.find(b => b.name === brand);
        const compatible = brandEntry?.models.includes(model) ?? false;
        set({ isCompatible: compatible });
      },
      reset: () => set({ brand: null, model: null, isCompatible: null }),
    }),
    { name: 'esim-panda-device-compat' }
  )
);
