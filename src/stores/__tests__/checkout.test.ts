import { describe, it, expect, beforeEach } from 'vitest';
import { useCheckoutStore } from '../checkout';

describe('useCheckoutStore', () => {
  beforeEach(() => {
    useCheckoutStore.getState().reset();
  });

  it('starts with initial state', () => {
    const state = useCheckoutStore.getState();
    expect(state.plan_id).toBeNull();
    expect(state.email).toBe('');
    expect(state.coupon_code).toBeNull();
    expect(state.discount_cents).toBe(0);
    expect(state.subtotal_cents).toBe(0);
    expect(state.tax_cents).toBe(0);
    expect(state.total_cents).toBe(0);
    expect(state.payment_status).toBe('idle');
    expect(state.error_message).toBeNull();
    expect(state.client_secret).toBeNull();
  });

  it('setPlan sets plan_id', () => {
    useCheckoutStore.getState().setPlan('plan-123');
    expect(useCheckoutStore.getState().plan_id).toBe('plan-123');
  });

  it('setEmail sets email', () => {
    useCheckoutStore.getState().setEmail('test@example.com');
    expect(useCheckoutStore.getState().email).toBe('test@example.com');
  });

  it('applyCoupon updates coupon and pricing fields', () => {
    useCheckoutStore.getState().applyCoupon('STUDENT15', 300, 700, 161, 861);
    const state = useCheckoutStore.getState();
    expect(state.coupon_code).toBe('STUDENT15');
    expect(state.discount_cents).toBe(300);
    expect(state.subtotal_cents).toBe(700);
    expect(state.tax_cents).toBe(161);
    expect(state.total_cents).toBe(861);
  });

  it('removeCoupon resets coupon_code and discount_cents', () => {
    useCheckoutStore.getState().applyCoupon('STUDENT15', 300, 700, 161, 861);
    useCheckoutStore.getState().removeCoupon();
    const state = useCheckoutStore.getState();
    expect(state.coupon_code).toBeNull();
    expect(state.discount_cents).toBe(0);
  });

  it('setPaymentStatus sets status', () => {
    useCheckoutStore.getState().setPaymentStatus('processing');
    expect(useCheckoutStore.getState().payment_status).toBe('processing');
    expect(useCheckoutStore.getState().error_message).toBeNull();
  });

  it('setPaymentStatus with error sets error_message', () => {
    useCheckoutStore.getState().setPaymentStatus('failed', 'Card declined');
    expect(useCheckoutStore.getState().payment_status).toBe('failed');
    expect(useCheckoutStore.getState().error_message).toBe('Card declined');
  });

  it('setPaymentStatus clears error when not failed', () => {
    useCheckoutStore.getState().setPaymentStatus('failed', 'Card declined');
    useCheckoutStore.getState().setPaymentStatus('processing');
    expect(useCheckoutStore.getState().error_message).toBeNull();
  });

  it('reset returns all fields to initial state', () => {
    useCheckoutStore.getState().setPlan('plan-123');
    useCheckoutStore.getState().setEmail('test@example.com');
    useCheckoutStore.getState().applyCoupon('STUDENT15', 300, 700, 161, 861);
    useCheckoutStore.getState().setPaymentStatus('processing');
    useCheckoutStore.getState().reset();

    const state = useCheckoutStore.getState();
    expect(state.plan_id).toBeNull();
    expect(state.email).toBe('');
    expect(state.payment_status).toBe('idle');
    expect(state.coupon_code).toBeNull();
    expect(state.total_cents).toBe(0);
  });
});
