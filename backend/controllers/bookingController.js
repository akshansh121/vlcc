const { validationResult } = require('express-validator');
const db = require('../config/database');
const nodemailer = require('nodemailer');
const { verifySignature } = require('./paymentController');

// Auto-migrate: add payment columns to bookings if they don't exist yet
(async () => {
  try {
    await db.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'pay_after_service'`);
    await db.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid'`);
    await db.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255)`);
    await db.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_id INTEGER REFERENCES offers(id)`);
    await db.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0`);
    await db.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2)`);
  } catch (e) {
    console.error('bookings migration error:', e.message);
  }
})();

// ── Email transport (created once, reused) ────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
}

async function sendBookingEmail(to, subject, html) {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Beauty World <noreply@beautyworld.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
}

// ── Email HTML templates ──────────────────────────────────────────────────────
function emailWrapper(content) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a1a 0%,#111 100%);padding:30px;text-align:center;border-bottom:2px solid #d4a017;">
            <h1 style="margin:0;color:#d4a017;font-size:26px;letter-spacing:2px;">✦ Beauty World</h1>
            <p style="margin:6px 0 0;color:#888;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Luxury Beauty Services</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:30px 35px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#111;padding:20px 35px;text-align:center;border-top:1px solid #2a2a2a;">
            <p style="margin:0;color:#555;font-size:12px;">© Beauty World · sunderdikho.com</p>
            <p style="margin:4px 0 0;color:#555;font-size:11px;">For queries, reply to this email or visit our website.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function bookingConfirmationHtml(userName, booking, items, paymentMethod, finalAmount) {
  const itemRows = items.map(i =>
    `<tr>
       <td style="padding:8px 0;color:#ccc;font-size:14px;border-bottom:1px solid #2a2a2a;">${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}</td>
       <td style="padding:8px 0;color:#d4a017;font-size:14px;text-align:right;border-bottom:1px solid #2a2a2a;">₹${(parseFloat(i.price) * i.quantity).toLocaleString('en-IN')}</td>
     </tr>`
  ).join('');

  const payLabel = paymentMethod === 'online'
    ? '<span style="background:#1a4731;color:#4ade80;padding:2px 10px;border-radius:20px;font-size:12px;">✓ Paid Online</span>'
    : '<span style="background:#2a2000;color:#facc15;padding:2px 10px;border-radius:20px;font-size:12px;">Pay After Service</span>';

  return emailWrapper(`
    <h2 style="margin:0 0 6px;color:#fff;font-size:20px;">Booking Confirmed! 🎉</h2>
    <p style="margin:0 0 24px;color:#888;font-size:14px;">Hi <strong style="color:#d4a017;">${userName}</strong>, your appointment has been received.</p>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Date</td>
          <td style="color:#fff;font-size:14px;text-align:right;">${new Date(booking.booking_date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:8px 0 4px;">Time</td>
          <td style="color:#fff;font-size:14px;text-align:right;">${booking.booking_time}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:8px 0 4px;">Status</td>
          <td style="text-align:right;"><span style="background:#1a2a4a;color:#60a5fa;padding:2px 10px;border-radius:20px;font-size:12px;">Pending Confirmation</span></td>
        </tr>
        <tr>
          <td style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;padding:8px 0 4px;">Payment</td>
          <td style="text-align:right;">${payLabel}</td>
        </tr>
      </table>
    </div>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 12px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Services Booked</p>
      <table width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
        <tr>
          <td style="color:#fff;font-size:16px;font-weight:bold;">Total Payable</td>
          <td style="color:#d4a017;font-size:20px;font-weight:bold;text-align:right;">₹${parseFloat(finalAmount).toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>

    <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">We'll confirm your booking shortly. Please arrive 5 minutes early. If you need to reschedule, contact us at least 2 hours before your appointment.</p>
    <p style="margin:16px 0 0;text-align:center;">
      <a href="${process.env.FRONTEND_URL || 'https://sunderdikho.com'}/bookings" style="display:inline-block;background:#d4a017;color:#000;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:14px;">View My Bookings →</a>
    </p>
  `);
}

function adminNewBookingHtml(user, booking, items, paymentMethod, finalAmount) {
  const itemList = items.map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''} — ₹${(parseFloat(i.price) * i.quantity).toLocaleString('en-IN')}`).join('<br/>');

  return emailWrapper(`
    <div style="background:#d4a01715;border-left:4px solid #d4a017;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:24px;">
      <p style="margin:0;color:#d4a017;font-weight:bold;font-size:16px;">🔔 New Booking Received</p>
      <p style="margin:4px 0 0;color:#888;font-size:13px;">Booking #${String(booking.id).padStart(6,'0')}</p>
    </div>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 12px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Customer Details</p>
      <p style="margin:0;color:#fff;font-size:15px;font-weight:bold;">${user.name}</p>
      <p style="margin:4px 0;color:#888;font-size:13px;">${user.email}</p>
      ${user.mobile ? `<p style="margin:4px 0;color:#888;font-size:13px;">📱 ${user.mobile}</p>` : ''}
    </div>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 12px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Appointment</p>
      <p style="margin:0;color:#fff;font-size:14px;">📅 ${new Date(booking.booking_date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
      <p style="margin:6px 0 0;color:#fff;font-size:14px;">🕐 ${booking.booking_time}</p>
    </div>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 10px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Services</p>
      <p style="margin:0;color:#ccc;font-size:13px;line-height:1.8;">${itemList}</p>
      <p style="margin:14px 0 0;color:#d4a017;font-size:18px;font-weight:bold;">Total: ₹${parseFloat(finalAmount).toLocaleString('en-IN')}</p>
      <p style="margin:6px 0 0;color:#888;font-size:12px;">Payment: ${paymentMethod === 'online' ? '✓ Paid Online' : 'Pay After Service'}</p>
    </div>

    ${booking.notes ? `<div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin-bottom:16px;"><p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Customer Notes</p><p style="margin:0;color:#ccc;font-size:13px;">${booking.notes}</p></div>` : ''}

    <p style="text-align:center;margin:0;">
      <a href="${process.env.FRONTEND_URL || 'https://sunderdikho.com'}/admin/bookings" style="display:inline-block;background:#d4a017;color:#000;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:14px;">View in Admin Panel →</a>
    </p>
  `);
}

function statusUpdateHtml(userName, booking, newStatus) {
  const statusConfig = {
    confirmed: { emoji: '✅', label: 'Confirmed', color: '#60a5fa', bg: '#1a2a4a', msg: "Great news! Your booking has been confirmed. We look forward to welcoming you." },
    completed: { emoji: '⭐', label: 'Completed', color: '#4ade80', bg: '#1a4731', msg: "Thank you for visiting Beauty World! We hope you loved your experience. See you again soon!" },
    cancelled: { emoji: '❌', label: 'Cancelled', color: '#f87171', bg: '#4a1a1a', msg: "Your booking has been cancelled. If you have any concerns, please don't hesitate to contact us." },
  };
  const cfg = statusConfig[newStatus] || { emoji: 'ℹ️', label: newStatus, color: '#888', bg: '#1a1a1a', msg: '' };

  return emailWrapper(`
    <div style="text-align:center;padding:10px 0 24px;">
      <div style="font-size:48px;margin-bottom:12px;">${cfg.emoji}</div>
      <h2 style="margin:0;color:#fff;font-size:22px;">Booking ${cfg.label}</h2>
      <p style="margin:8px 0 0;color:#888;font-size:14px;">Hi <strong style="color:#d4a017;">${userName}</strong></p>
    </div>

    <div style="background:#111;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin-bottom:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#888;font-size:13px;padding-bottom:8px;">Date</td>
          <td style="color:#fff;font-size:13px;text-align:right;">${new Date(booking.booking_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding-top:8px;">Time</td>
          <td style="color:#fff;font-size:13px;text-align:right;">${booking.booking_time}</td>
        </tr>
        <tr>
          <td style="color:#888;font-size:13px;padding-top:8px;">Status</td>
          <td style="text-align:right;padding-top:8px;"><span style="background:${cfg.bg};color:${cfg.color};padding:2px 12px;border-radius:20px;font-size:12px;">${cfg.label}</span></td>
        </tr>
      </table>
    </div>

    <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 20px;">${cfg.msg}</p>
    <p style="text-align:center;margin:0;">
      <a href="${process.env.FRONTEND_URL || 'https://sunderdikho.com'}/bookings" style="display:inline-block;background:#d4a017;color:#000;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:14px;">View My Bookings →</a>
    </p>
  `);
}

// GET /api/bookings - user's own bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE b.user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM bookings b ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const bookingsResult = await db.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.status, b.total_amount,
              b.discount_amount, b.final_amount, b.payment_method, b.payment_status,
              b.payment_reference, b.notes, b.created_at,
              json_agg(
                json_build_object(
                  'id', bi.id,
                  'service_id', bi.service_id,
                  'service_name', s.name,
                  'quantity', bi.quantity,
                  'price', bi.price
                )
              ) AS items
       FROM bookings b
       LEFT JOIN booking_items bi ON b.id = bi.booking_id
       LEFT JOIN services s ON bi.service_id = s.id
       ${whereClause}
       GROUP BY b.id
       ORDER BY b.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: bookingsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getUserBookings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/all - admin view all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status, date, dateFrom, dateTo, search, payment_method, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`b.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (payment_method) {
      conditions.push(`b.payment_method = $${paramIndex}`);
      params.push(payment_method);
      paramIndex++;
    }
    if (date) {
      conditions.push(`b.booking_date = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    }
    if (dateFrom) {
      conditions.push(`b.booking_date >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }
    if (dateTo) {
      conditions.push(`b.booking_date <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }
    if (search) {
      conditions.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.mobile ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(
      `SELECT COUNT(*) FROM bookings b LEFT JOIN users u ON b.user_id = u.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const bookingsResult = await db.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.status, b.total_amount,
              b.discount_amount, b.final_amount, b.payment_method, b.payment_status,
              b.payment_reference, b.notes, b.created_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email, u.mobile AS user_mobile,
              json_agg(
                json_build_object(
                  'id', bi.id,
                  'service_id', bi.service_id,
                  'service_name', s.name,
                  'quantity', bi.quantity,
                  'price', bi.price
                )
              ) AS items
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN booking_items bi ON b.id = bi.booking_id
       LEFT JOIN services s ON bi.service_id = s.id
       ${whereClause}
       GROUP BY b.id, u.id
       ORDER BY b.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: bookingsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getAllBookings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/slots?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required' });
    }

    // Fetch all configured time slots
    const slotsResult = await db.query(
      `SELECT id, slot_time, max_bookings, is_active FROM time_slots WHERE is_active = true ORDER BY slot_time`
    );

    if (slotsResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Count existing bookings for each slot on the given date
    const bookedResult = await db.query(
      `SELECT booking_time, COUNT(*) AS booked_count
       FROM bookings
       WHERE booking_date = $1 AND status IN ('pending', 'confirmed')
       GROUP BY booking_time`,
      [date]
    );

    const bookedMap = {};
    bookedResult.rows.forEach((row) => {
      bookedMap[row.booking_time] = parseInt(row.booked_count);
    });

    const slots = slotsResult.rows.map((slot) => {
      const booked = bookedMap[slot.slot_time] || 0;
      const available = slot.max_bookings - booked;
      return {
        slot_time: slot.slot_time,
        max_bookings: slot.max_bookings,
        booked,
        available: Math.max(0, available),
        is_available: available > 0,
      };
    });

    res.json({ success: true, data: slots });
  } catch (err) {
    console.error('getAvailableSlots error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await db.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.status, b.total_amount,
              b.discount_amount, b.final_amount, b.payment_method, b.payment_status,
              b.payment_reference, b.notes, b.created_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email, u.mobile AS user_mobile,
              json_agg(
                json_build_object(
                  'id', bi.id,
                  'service_id', bi.service_id,
                  'service_name', s.name,
                  'quantity', bi.quantity,
                  'price', bi.price
                )
              ) AS items
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN booking_items bi ON b.id = bi.booking_id
       LEFT JOIN services s ON bi.service_id = s.id
       WHERE b.id = $1
       GROUP BY b.id, u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Non-admin users can only view their own bookings
    if (!isAdmin && booking.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('getBooking error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/bookings
exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const userId = req.user.id;
    const {
      booking_date,
      booking_time,
      items,
      notes,
      offer_id,
      payment_method = 'pay_after_service',
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;
    const normalizedPaymentMethod = payment_method === 'online' ? 'online' : 'pay_after_service';

    // Verify Razorpay signature before proceeding with online payment
    if (normalizedPaymentMethod === 'online') {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Payment verification fields are required for online payment' });
      }
      if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Payment verification failed. Please contact support.' });
      }
    }

    // Validate booking date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(booking_date);
    if (bookingDate < today) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Booking date must be a future date' });
    }

    // Check slot availability
    const slotResult = await client.query(
      `SELECT max_bookings FROM time_slots WHERE slot_time = $1 AND is_active = true`,
      [booking_time]
    );
    if (slotResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Invalid or unavailable time slot' });
    }

    const maxBookings = slotResult.rows[0].max_bookings;
    const bookedResult = await client.query(
      `SELECT COUNT(*) FROM bookings WHERE booking_date = $1 AND booking_time = $2 AND status IN ('pending', 'confirmed')`,
      [booking_date, booking_time]
    );
    const bookedCount = parseInt(bookedResult.rows[0].count);
    if (bookedCount >= maxBookings) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Selected time slot is fully booked' });
    }

    // Fetch service prices and calculate total
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const serviceResult = await client.query(
        `SELECT id, name, original_price, discounted_price FROM services WHERE id = $1 AND is_active = true`,
        [item.service_id]
      );
      if (serviceResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: `Service ID ${item.service_id} not found or inactive` });
      }
      const service = serviceResult.rows[0];
      const unitPrice = service.discounted_price != null ? parseFloat(service.discounted_price) : parseFloat(service.original_price);
      const quantity = item.quantity || 1;
      totalAmount += unitPrice * quantity;
      enrichedItems.push({ service_id: service.id, name: service.name, price: unitPrice, quantity });
    }

    // Apply offer if provided
    let discountAmount = 0;
    let appliedOfferId = null;

    if (offer_id) {
      const offerResult = await client.query(
        `SELECT id, discount_type, discount_value, min_amount, max_discount
         FROM offers
         WHERE id = $1 AND is_active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE`,
        [offer_id]
      );
      if (offerResult.rows.length > 0) {
        const offer = offerResult.rows[0];
        if (!offer.min_amount || totalAmount >= parseFloat(offer.min_amount)) {
          if (offer.discount_type === 'percentage') {
            discountAmount = (totalAmount * parseFloat(offer.discount_value)) / 100;
            if (offer.max_discount) {
              discountAmount = Math.min(discountAmount, parseFloat(offer.max_discount));
            }
          } else {
            discountAmount = parseFloat(offer.discount_value);
          }
          appliedOfferId = offer.id;
        }
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);
    const paymentStatus = normalizedPaymentMethod === 'online' ? 'paid' : 'unpaid';
    const paymentReference = normalizedPaymentMethod === 'online' ? razorpay_payment_id : null;

    // Insert booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (
         user_id, booking_date, booking_time, status, total_amount, discount_amount,
         final_amount, payment_method, payment_status, payment_reference, notes, offer_id
       )
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        userId,
        booking_date,
        booking_time,
        totalAmount,
        discountAmount,
        finalAmount,
        normalizedPaymentMethod,
        paymentStatus,
        paymentReference,
        notes || null,
        appliedOfferId,
      ]
    );
    const booking = bookingResult.rows[0];

    // Insert booking items
    for (const item of enrichedItems) {
      await client.query(
        `INSERT INTO booking_items (booking_id, service_id, quantity, price) VALUES ($1, $2, $3, $4)`,
        [booking.id, item.service_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    // Send confirmation emails (customer + admin) — fire-and-forget, never block response
    setImmediate(async () => {
      try {
        const userResult = await db.query(
          `SELECT email, name, mobile FROM users WHERE id = $1`,
          [userId]
        );
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          // Customer confirmation
          await sendBookingEmail(
            user.email,
            `Booking Confirmed — Beauty World #${String(booking.id).padStart(6, '0')}`,
            bookingConfirmationHtml(user.name, booking, enrichedItems, normalizedPaymentMethod, finalAmount)
          );
          // Admin notification
          if (process.env.ADMIN_EMAIL) {
            await sendBookingEmail(
              process.env.ADMIN_EMAIL,
              `New Booking #${String(booking.id).padStart(6, '0')} — ${user.name}`,
              adminNewBookingHtml(user, booking, enrichedItems, normalizedPaymentMethod, finalAmount)
            );
          }
        }
      } catch (emailErr) {
        console.error('Booking email error:', emailErr.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { ...booking, items: enrichedItems },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createBooking error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

// PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Send status update email to customer — fire-and-forget
    setImmediate(async () => {
      try {
        const statusSubjects = {
          confirmed: `Your booking is Confirmed — Beauty World`,
          completed: `Thank you for visiting Beauty World!`,
          cancelled: `Booking Cancelled — Beauty World`,
        };
        const subject = statusSubjects[status];
        if (!subject) return;

        const userResult = await db.query(`SELECT email, name FROM users WHERE id = $1`, [booking.user_id]);
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          await sendBookingEmail(user.email, subject, statusUpdateHtml(user.name, booking, status));
        }
      } catch (emailErr) {
        console.error('Status update email error:', emailErr.message);
      }
    });

    res.json({ success: true, message: 'Booking status updated', data: booking });
  } catch (err) {
    console.error('updateBookingStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/bookings/:id - user cancels own booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch booking and verify ownership
    const bookingResult = await db.query(
      `SELECT id, user_id, status FROM bookings WHERE id = $1`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status '${booking.status}'`,
      });
    }

    const result = await db.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json({ success: true, message: 'Booking cancelled successfully', data: result.rows[0] });
  } catch (err) {
    console.error('cancelBooking error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/bookings/stats/overview
exports.getStats = async (req, res) => {
  try {
    // Count by status
    const statusResult = await db.query(
      `SELECT status, COUNT(*) AS count FROM bookings GROUP BY status`
    );

    const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    statusResult.rows.forEach((row) => {
      statusCounts[row.status] = parseInt(row.count);
    });

    // Monthly revenue for last 12 months
    const revenueResult = await db.query(
      `SELECT TO_CHAR(booking_date, 'YYYY-MM') AS month,
              SUM(final_amount) AS revenue,
              COUNT(*) AS count
       FROM bookings
       WHERE status = 'completed'
         AND booking_date >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
       GROUP BY TO_CHAR(booking_date, 'YYYY-MM')
       ORDER BY month ASC`
    );

    res.json({
      success: true,
      data: {
        status_counts: statusCounts,
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        monthly_revenue: revenueResult.rows,
      },
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
