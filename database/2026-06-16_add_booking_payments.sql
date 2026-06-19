ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'pay_after_service';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_method_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_method_check
  CHECK (payment_method IN ('pay_after_service','online'));

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN ('unpaid','paid','failed','refunded'));
