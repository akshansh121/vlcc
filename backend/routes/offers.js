const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const offerController = require('../controllers/offerController');
const { authenticateAdmin } = require('../middleware/auth');

// POST /api/offers/validate - public, must be before /:id
router.post(
  '/validate',
  [
    body('coupon_code').trim().notEmpty().withMessage('Coupon code is required'),
    body('cart_total').isFloat({ gt: 0 }).withMessage('Valid cart total is required'),
  ],
  offerController.validateCoupon
);

// GET /api/offers/all - admin, all offers including expired, must be before /:id
router.get('/all', authenticateAdmin, offerController.getAllOffers);

// GET /api/offers - public active offers
router.get('/', offerController.getActiveOffers);

// GET /api/offers/:id
router.get('/:id', [param('id').isInt().withMessage('Valid offer id is required')], offerController.getOffer);

// POST /api/offers - admin create
router.post(
  '/',
  authenticateAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('coupon_code').trim().notEmpty().withMessage('Coupon code is required'),
    body('discount_type').isIn(['percentage', 'flat']).withMessage('Discount type must be percentage or flat'),
    body('discount_value').isFloat({ gt: 0 }).withMessage('Discount value must be greater than 0'),
    body('min_amount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Minimum amount must be non-negative'),
    body('max_discount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Maximum discount must be non-negative'),
    body('usage_limit').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
    body('start_date').isISO8601().withMessage('Valid start date is required'),
    body('end_date').isISO8601().withMessage('Valid end date is required'),
  ],
  offerController.createOffer
);

// PUT /api/offers/:id - admin update
router.put(
  '/:id',
  authenticateAdmin,
  [
    param('id').isInt().withMessage('Valid offer id is required'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('coupon_code').optional().trim().notEmpty().withMessage('Coupon code cannot be empty'),
    body('discount_type').optional().isIn(['percentage', 'flat']).withMessage('Invalid discount type'),
    body('discount_value').optional().isFloat({ gt: 0 }).withMessage('Discount value must be greater than 0'),
    body('min_amount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Minimum amount must be non-negative'),
    body('max_discount').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Maximum discount must be non-negative'),
    body('usage_limit').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
    body('start_date').optional().isISO8601().withMessage('Invalid start date'),
    body('end_date').optional().isISO8601().withMessage('Invalid end date'),
  ],
  offerController.updateOffer
);

// DELETE /api/offers/:id - admin delete
router.delete(
  '/:id',
  authenticateAdmin,
  [param('id').isInt().withMessage('Valid offer id is required')],
  offerController.deleteOffer
);

module.exports = router;
