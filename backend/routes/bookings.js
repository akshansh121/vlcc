const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');

// GET /api/bookings/stats/overview - must be before /:id to avoid route conflict
router.get('/stats/overview', authenticateAdmin, bookingController.getStats);

// GET /api/bookings/slots?date=YYYY-MM-DD
router.get('/slots', bookingController.getAvailableSlots);

// GET /api/bookings/all - admin view all bookings
router.get('/all', authenticateAdmin, bookingController.getAllBookings);

// GET /api/bookings - user's own bookings
router.get('/', authenticateUser, bookingController.getUserBookings);

// GET /api/bookings/:id
router.get('/:id', authenticateUser, bookingController.getBooking);

// POST /api/bookings
router.post(
  '/',
  authenticateUser,
  [
    body('booking_date').notEmpty().withMessage('Booking date is required').isISO8601().withMessage('Invalid date format'),
    body('booking_time').notEmpty().withMessage('Booking time is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one service is required'),
    body('items.*.service_id').isInt({ gt: 0 }).withMessage('Valid service ID is required'),
    body('payment_method')
      .optional()
      .isIn(['pay_after_service', 'online'])
      .withMessage('Invalid payment method'),
  ],
  bookingController.createBooking
);

// PUT /api/bookings/:id/status
router.put(
  '/:id/status',
  authenticateAdmin,
  [
    body('status')
      .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
      .withMessage('Invalid status value'),
  ],
  bookingController.updateBookingStatus
);

// DELETE /api/bookings/:id - cancel booking
router.delete('/:id', authenticateUser, bookingController.cancelBooking);

module.exports = router;
