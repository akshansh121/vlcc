const nodemailer = require('nodemailer');
require('dotenv').config();

// ---------------------------------------------------------------------------
// Transporter
// ---------------------------------------------------------------------------

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.spacemail.com',
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: process.env.EMAIL_SECURE === 'true' || parseInt(process.env.EMAIL_PORT || '465', 10) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection configuration in non-test environments
if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error) => {
    if (error) {
      console.error('Email transporter configuration error:', error.message);
    } else {
      console.log('Email transporter is ready to send messages');
    }
  });
}

// ---------------------------------------------------------------------------
// Shared HTML layout
// ---------------------------------------------------------------------------

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Beauty World</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Georgia', serif; }
    .container { max-width: 600px; margin: 40px auto; background: #1a1a1a; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #d4af37; }
    .header h1 { margin: 0; color: #d4af37; font-size: 32px; letter-spacing: 3px; text-transform: uppercase; }
    .header p { margin: 6px 0 0; color: #b0b0b0; font-size: 13px; letter-spacing: 1px; }
    .body { padding: 40px 30px; color: #e0e0e0; }
    .body h2 { color: #d4af37; font-size: 22px; margin-top: 0; }
    .body p { line-height: 1.8; color: #c0c0c0; }
    .info-box { background: #2d2d2d; border-left: 4px solid #d4af37; padding: 20px 24px; border-radius: 4px; margin: 24px 0; }
    .info-box p { margin: 6px 0; font-size: 14px; }
    .info-box .label { color: #d4af37; font-weight: bold; }
    .cta-button { display: inline-block; margin: 24px 0; padding: 14px 36px; background: #d4af37; color: #1a1a1a; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 15px; letter-spacing: 1px; }
    .footer { background: #111; padding: 24px 30px; text-align: center; border-top: 1px solid #333; }
    .footer p { margin: 4px 0; color: #666; font-size: 12px; }
    .divider { height: 1px; background: #333; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Beauty World</h1>
      <p>Premium Beauty & Wellness</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>Beauty World Salon | Premium Beauty & Wellness Services</p>
      <p>If you have questions, contact us at support@sunderdikho.com</p>
      <p style="margin-top:10px; color:#444;">© ${new Date().getFullYear()} Beauty World. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ---------------------------------------------------------------------------
// sendWelcomeEmail
// ---------------------------------------------------------------------------

const sendWelcomeEmail = async (user) => {
  const html = emailWrapper(`
    <h2>Welcome to Beauty World, ${user.name}!</h2>
    <p>We're thrilled to have you join our family of beauty enthusiasts. Your account has been successfully created.</p>
    <div class="info-box">
      <p><span class="label">Name:</span> ${user.name}</p>
      <p><span class="label">Email:</span> ${user.email}</p>
    </div>
    <p>Explore our exclusive services, premium packages, and special offers crafted just for you.</p>
    <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/services" class="cta-button">Explore Services</a>
    <div class="divider"></div>
    <p>As a Beauty World member you enjoy:</p>
    <ul style="color:#c0c0c0; line-height:2;">
      <li>Easy online booking 24/7</li>
      <li>Exclusive member discounts</li>
      <li>Priority appointment scheduling</li>
      <li>Personalised beauty recommendations</li>
    </ul>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: user.email,
    subject: 'Welcome to Beauty World!',
    html,
  });
};

// ---------------------------------------------------------------------------
// sendBookingConfirmation
// ---------------------------------------------------------------------------

const sendBookingConfirmation = async (user, booking) => {
  const html = emailWrapper(`
    <h2>Booking Confirmed!</h2>
    <p>Dear ${user.name}, your appointment has been successfully booked. We look forward to seeing you!</p>
    <div class="info-box">
      <p><span class="label">Booking Reference:</span> ${booking.order_id || booking.id}</p>
      <p><span class="label">Service:</span> ${booking.service_name || 'N/A'}</p>
      <p><span class="label">Staff:</span> ${booking.staff_name || 'Any available stylist'}</p>
      <p><span class="label">Date:</span> ${booking.booking_date ? new Date(booking.booking_date).toDateString() : 'N/A'}</p>
      <p><span class="label">Time:</span> ${booking.booking_time || 'N/A'}</p>
      <p><span class="label">Duration:</span> ${booking.duration_minutes ? `${booking.duration_minutes} minutes` : 'N/A'}</p>
      <p><span class="label">Amount:</span> ₹${parseFloat(booking.total_price || 0).toFixed(2)}</p>
    </div>
    <p>Please arrive 5–10 minutes before your scheduled time. If you need to reschedule or cancel, please do so at least 2 hours in advance.</p>
    <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/bookings" class="cta-button">View My Bookings</a>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: user.email,
    subject: `Booking Confirmed – ${booking.order_id || booking.id}`,
    html,
  });
};

// ---------------------------------------------------------------------------
// sendBookingCancellation
// ---------------------------------------------------------------------------

const sendBookingCancellation = async (user, booking) => {
  const html = emailWrapper(`
    <h2>Booking Cancelled</h2>
    <p>Dear ${user.name}, your booking has been cancelled as requested.</p>
    <div class="info-box">
      <p><span class="label">Booking Reference:</span> ${booking.order_id || booking.id}</p>
      <p><span class="label">Service:</span> ${booking.service_name || 'N/A'}</p>
      <p><span class="label">Date:</span> ${booking.booking_date ? new Date(booking.booking_date).toDateString() : 'N/A'}</p>
      <p><span class="label">Time:</span> ${booking.booking_time || 'N/A'}</p>
      <p><span class="label">Cancellation Reason:</span> ${booking.cancellation_reason || 'Customer request'}</p>
    </div>
    <p>We're sorry to see your appointment cancelled. If you'd like to rebook, we'd love to welcome you back.</p>
    <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/services" class="cta-button">Book Again</a>
    <div class="divider"></div>
    <p style="font-size:13px; color:#999;">If you did not request this cancellation, please contact us immediately at support@sunderdikho.com</p>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: user.email,
    subject: `Booking Cancelled – ${booking.order_id || booking.id}`,
    html,
  });
};

// ---------------------------------------------------------------------------
// sendBookingCompletion
// ---------------------------------------------------------------------------

const sendBookingCompletion = async (user, booking) => {
  const html = emailWrapper(`
    <h2>Thank You for Visiting Beauty World!</h2>
    <p>Dear ${user.name}, we hope you enjoyed your experience with us. It was our pleasure to serve you.</p>
    <div class="info-box">
      <p><span class="label">Booking Reference:</span> ${booking.order_id || booking.id}</p>
      <p><span class="label">Service:</span> ${booking.service_name || 'N/A'}</p>
      <p><span class="label">Staff:</span> ${booking.staff_name || 'N/A'}</p>
      <p><span class="label">Date:</span> ${booking.booking_date ? new Date(booking.booking_date).toDateString() : 'N/A'}</p>
      <p><span class="label">Amount Paid:</span> ₹${parseFloat(booking.total_price || 0).toFixed(2)}</p>
    </div>
    <p>We'd love to hear your thoughts! Share your experience and help others discover the Beauty World difference.</p>
    <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/testimonials" class="cta-button">Leave a Review</a>
    <div class="divider"></div>
    <p>Ready for your next visit? Book your next appointment online anytime.</p>
    <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/services" style="color:#d4af37; text-decoration:none;">Browse Services →</a>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: user.email,
    subject: 'Thank You for Your Visit – Beauty World',
    html,
  });
};

// ---------------------------------------------------------------------------
// sendContactQueryNotification  (to admin)
// ---------------------------------------------------------------------------

const sendContactQueryNotification = async (query) => {
  const html = emailWrapper(`
    <h2 style="color:#d4af37;">📩 New Contact Query</h2>
    <p>A new message has been submitted via the Beauty World contact form.</p>
    <div class="info-box">
      <p><span class="label">Name:</span> ${query.name}</p>
      <p><span class="label">Email:</span> ${query.email}</p>
      ${query.mobile ? `<p><span class="label">Mobile:</span> ${query.mobile}</p>` : ''}
      ${query.subject ? `<p><span class="label">Subject:</span> ${query.subject}</p>` : ''}
    </div>
    <p style="color:#b0b0b0;font-size:13px;font-weight:bold;margin-bottom:6px;">Message:</p>
    <div style="background:#2d2d2d;border-left:4px solid #d4af37;padding:16px 20px;border-radius:4px;color:#e0e0e0;line-height:1.8;white-space:pre-wrap;">${query.message}</div>
    <div class="divider"></div>
    <p style="font-size:12px;color:#666;">Submitted at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
    <a href="${process.env.FRONTEND_URL || 'https://sunderdikho.com'}/admin/contact" class="cta-button">View in Admin Panel</a>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: process.env.ADMIN_EMAIL || 'support@sunderdikho.com',
    replyTo: query.email,
    subject: `New Query: ${query.subject || query.name} – Beauty World`,
    html,
  });
};

// ---------------------------------------------------------------------------
// sendContactAutoReply  (to user)
// ---------------------------------------------------------------------------

const sendContactAutoReply = async (query) => {
  const html = emailWrapper(`
    <h2>We've received your message!</h2>
    <p>Dear <strong style="color:#d4af37;">${query.name}</strong>, thank you for reaching out to Beauty World.</p>
    <p>We have received your query and our team will get back to you within <strong>24 hours</strong>.</p>
    <div class="info-box">
      ${query.subject ? `<p><span class="label">Subject:</span> ${query.subject}</p>` : ''}
      <p><span class="label">Your Message:</span></p>
      <p style="color:#c0c0c0;white-space:pre-wrap;margin:4px 0 0;">${query.message}</p>
    </div>
    <p>In the meantime, feel free to explore our services or reach us directly:</p>
    <ul style="color:#c0c0c0;line-height:2;font-size:14px;">
      <li>📞 Call us: <a href="tel:+918340433268" style="color:#d4af37;">+91 83404 33268</a></li>
      <li>📧 Email: <a href="mailto:support@sunderdikho.com" style="color:#d4af37;">support@sunderdikho.com</a></li>
    </ul>
    <a href="${process.env.FRONTEND_URL || 'https://sunderdikho.com'}/services" class="cta-button">Explore Services</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#999;">Please do not reply to this email directly — use the contact details above to reach us.</p>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: query.email,
    subject: `We received your message – Beauty World`,
    html,
  });
};

// ---------------------------------------------------------------------------
// sendOtpEmail
// ---------------------------------------------------------------------------

const sendOtpEmail = async (user, otp) => {
  const html = emailWrapper(`
    <h2>Password Reset OTP</h2>
    <p>Dear ${user.name}, we received a request to reset your Beauty World account password.</p>
    <div class="info-box" style="text-align:center;">
      <p style="color:#b0b0b0;font-size:13px;margin-bottom:8px;">Your One-Time Password</p>
      <p style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#d4af37;margin:0;">${otp}</p>
      <p style="color:#888;font-size:12px;margin-top:10px;">Valid for 10 minutes</p>
    </div>
    <p>Enter this OTP on the password reset page to continue. Do not share this code with anyone.</p>
    <div class="divider"></div>
    <p style="font-size:13px;color:#999;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: user.email,
    subject: `${otp} – Your Beauty World Password Reset OTP`,
    html,
  });
};

// ---------------------------------------------------------------------------
// sendRegistrationOtpEmail
// ---------------------------------------------------------------------------

const sendRegistrationOtpEmail = async (user, otp) => {
  const html = emailWrapper(`
    <h2>Verify Your Email</h2>
    <p>Thank you for signing up with Beauty World! Use the code below to verify your email and complete your registration.</p>
    <div class="info-box" style="text-align:center;">
      <p style="color:#b0b0b0;font-size:13px;margin-bottom:8px;">Your Verification Code</p>
      <p style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#d4af37;margin:0;">${otp}</p>
      <p style="color:#888;font-size:12px;margin-top:10px;">Valid for 10 minutes</p>
    </div>
    <p>Enter this code on the registration page to activate your account. Do not share this code with anyone.</p>
    <div class="divider"></div>
    <p style="font-size:13px;color:#999;">If you did not attempt to create an account at Beauty World, please ignore this email.</p>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: user.email,
    subject: `${otp} – Verify your Beauty World account`,
    html,
  });
};

// ---------------------------------------------------------------------------
// sendAdminReply  (admin replies to a contact query)
// ---------------------------------------------------------------------------

const sendAdminReply = async (query, replyMessage) => {
  const html = emailWrapper(`
    <h2>Reply from Beauty World</h2>
    <p>Dear <strong style="color:#d4af37;">${query.name}</strong>, our team has responded to your query.</p>
    ${query.subject ? `<div class="info-box"><p><span class="label">Your Subject:</span> ${query.subject}</p></div>` : ''}
    <p style="color:#b0b0b0;font-size:13px;font-weight:bold;margin-bottom:6px;">Our Reply:</p>
    <div style="background:#2d2d2d;border-left:4px solid #d4af37;padding:16px 20px;border-radius:4px;color:#e0e0e0;line-height:1.8;white-space:pre-wrap;">${replyMessage}</div>
    <div class="divider"></div>
    <p>If you have further questions, feel free to reach us:</p>
    <ul style="color:#c0c0c0;line-height:2;font-size:14px;">
      <li>📞 Call us: <a href="tel:+918340433268" style="color:#d4af37;">+91 83404 33268</a></li>
      <li>📧 Email: <a href="mailto:support@sunderdikho.com" style="color:#d4af37;">support@sunderdikho.com</a></li>
    </ul>
    <a href="${process.env.FRONTEND_URL || 'https://sunderdikho.com'}/services" class="cta-button">Explore Services</a>
  `);

  await transporter.sendMail({
    from: `Beauty World <${process.env.EMAIL_FROM || 'support@sunderdikho.com'}>`,
    to: query.email,
    subject: `Re: ${query.subject || 'Your Query'} – Beauty World`,
    html,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingCompletion,
  sendContactQueryNotification,
  sendContactAutoReply,
  sendOtpEmail,
  sendRegistrationOtpEmail,
  sendAdminReply,
  transporter,
};
