export interface DashboardEsim {
  id: string;
  iccid: string;
  destination: string;
  destination_iso: string;
  status: 'pending' | 'active' | 'expired';
  data_total_gb: number;
  data_used_gb: number;
  data_remaining_gb: number;
  data_remaining_pct: number;
  expires_at: string | null;
  activated_at: string | null;
  last_usage_check: string | null;
  plan_name: string;
  order_id: string;
  wholesale_plan_id: string;
}

export interface PurchaseRecord {
  id: string;
  order_id: string;
  date: string;
  destination: string;
  destination_iso: string;
  plan_name: string;
  duration_days: number;
  data_gb: number;
  amount_paid_cents: number;
  currency: string;
  payment_method: string;
  coupon_code: string | null;
  discount_cents: number;
  tax_cents: number;
  subtotal_cents: number;
  iccid: string;
  status: string;
}

export interface TopUpPackage {
  id: string;
  name: string;
  data_gb: number;
  duration_days: number;
  price_cents: number;
  currency: string;
}
