ALTER TABLE orders ADD COLUMN esim_iccid TEXT;
ALTER TABLE orders ADD COLUMN esim_qr_encrypted TEXT;
ALTER TABLE orders ADD COLUMN esim_status TEXT DEFAULT 'pending'
  CHECK (esim_status IN ('pending', 'provisioning', 'provisioned', 'delivered', 'failed'));
ALTER TABLE orders ADD COLUMN esim_activation_code_encrypted TEXT;
ALTER TABLE orders ADD COLUMN esim_smdp_address_encrypted TEXT;
CREATE INDEX idx_orders_esim_status ON orders(esim_status);
CREATE INDEX idx_orders_payment_intent ON orders(stripe_payment_intent_id);
