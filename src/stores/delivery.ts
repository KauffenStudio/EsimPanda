import { create } from 'zustand';
import type { DeliveryData, ProvisioningStatus } from '@/lib/delivery/types';

interface DeliveryState {
  status: ProvisioningStatus;
  data: DeliveryData | null;
  order_id: string | null;
  error: string | null;
  retry_count: number;
  email: string | null;
  setStatus: (status: ProvisioningStatus) => void;
  setData: (data: DeliveryData, orderId: string) => void;
  setError: (error: string, retryCount: number) => void;
  setEmail: (email: string) => void;
  reset: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  status: 'pending',
  data: null,
  order_id: null,
  error: null,
  retry_count: 0,
  email: null,
  setStatus: (status) => set({ status }),
  setData: (data, order_id) => set({ status: 'ready', data, order_id, error: null }),
  setError: (error, retry_count) => set({ status: 'failed', error, retry_count }),
  setEmail: (email) => set({ email }),
  reset: () => set({ status: 'pending', data: null, order_id: null, error: null, retry_count: 0, email: null }),
}));
