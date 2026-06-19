const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const cartController = require('../controllers/cartController');
const { authenticateUser } = require('../middleware/auth');

// GET /api/cart
router.get('/', authenticateUser, cartController.getCart);

// POST /api/cart/add
router.post(
  '/add',
  authenticateUser,
  [
    body('service_id').isInt({ gt: 0 }).withMessage('Valid service ID is required'),
    body('quantity').optional().isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
  ],
  cartController.addToCart
);

// POST /api/cart/apply-offer - must be before /:serviceId
router.post(
  '/apply-offer',
  authenticateUser,
  [
    body('coupon_code').trim().notEmpty().withMessage('Coupon code is required'),
  ],
  cartController.applyOffer
);

// PUT /api/cart/:serviceId
router.put(
  '/:serviceId',
  authenticateUser,
  [
    param('serviceId').isInt({ gt: 0 }).withMessage('Valid service ID is required'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
  ],
  cartController.updateCartItem
);

// DELETE /api/cart/:serviceId
router.delete(
  '/:serviceId',
  authenticateUser,
  [param('serviceId').isInt({ gt: 0 }).withMessage('Valid service ID is required')],
  cartController.removeFromCart
);

// DELETE /api/cart
router.delete('/', authenticateUser, cartController.clearCart);

module.exports = router;
