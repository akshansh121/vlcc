const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createOrder } = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/auth');

// POST /api/payments/create-order
router.post(
  '/create-order',
  authenticateUser,
  [body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least ₹1')],
  createOrder
);

module.exports = router;
