export type EsimStatus = 'pending' | 'provisioning' | 'provisioned' | 'delivered' | 'failed';
export type ProvisioningStatus = 'pending' | 'provisioning' | 'ready' | 'failed';

export interface DeliveryData {
  iccid: string;
  activation_qr_base64: string;
  manual_activation_code: string;
  smdp_address: string;
  ios_activation_link?: string;
  android_activation_link?: string;
}

export interface ProvisionResult {
  status: ProvisioningStatus;
  data?: DeliveryData;
  order_id: string;
  error?: string;
  retry_count?: number;
  /** AES-256-GCM encrypted blob (iv_hex:authTag_hex:ciphertext_hex). Present when status is 'ready'. */
  encrypted_payload?: string;
}
