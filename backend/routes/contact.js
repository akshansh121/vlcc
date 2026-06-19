const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { authenticateAdmin } = require('../middleware/auth');

// POST /api/contact - public submit
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('mobile').optional().trim().isMobilePhone().withMessage('Valid mobile number required'),
    body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  contactController.submitQuery
);

// GET /api/contact - admin get all queries
router.get('/', authenticateAdmin, contactController.getQueries);

// PUT /api/contact/:id/read - admin mark as read
router.put('/:id/read', authenticateAdmin, contactController.markRead);

// DELETE /api/contact/:id - admin delete
router.delete('/:id', authenticateAdmin, contactController.deleteQuery);

// POST /api/contact/:id/reply - admin reply to a query via SMTP
router.post(
  '/:id/reply',
  authenticateAdmin,
  [body('message').trim().notEmpty().withMessage('Reply message is required')],
  contactController.replyToQuery
);

module.exports = router;
