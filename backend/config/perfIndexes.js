// ---------------------------------------------------------------------------
// Performance indexes
// ---------------------------------------------------------------------------
//
// Fire-and-forget creation of indexes on hot columns. Each statement uses
// CREATE INDEX IF NOT EXISTS so it is idempotent and safe to run on every boot.
// Failures are logged but never thrown — this module must not crash startup.
// This module does NOT alter any query logic or returned data; it only adds
// indexes the planner can choose to use.

const { query } = require('./database');

const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings (booking_date)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_date_time_status ON bookings (booking_date, booking_time, status)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id)',
  'CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id ON booking_items (booking_id)',
  'CREATE INDEX IF NOT EXISTS idx_services_category_id ON services (category_id)',
  'CREATE INDEX IF NOT EXISTS idx_services_is_active ON services (is_active)',
];

(async () => {
  for (const sql of INDEXES) {
    try {
      await query(sql);
    } catch (err) {
      // Non-fatal: a missing table/column just means this index is skipped.
      console.error('Performance index skipped:', err.message);
    }
  }
})().catch((err) => {
  console.error('Performance index setup failed (non-fatal):', err.message);
});

module.exports = {};
