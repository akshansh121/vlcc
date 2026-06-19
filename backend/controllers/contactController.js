const { validationResult } = require('express-validator');
const db = require('../config/database');
const { sendContactQueryNotification, sendContactAutoReply, sendAdminReply } = require('../utils/email');

// Auto-migrate: add missing columns to contact_queries if they don't exist
(async () => {
  try {
    await db.query(`ALTER TABLE contact_queries ADD COLUMN IF NOT EXISTS subject VARCHAR(255)`);
    await db.query(`ALTER TABLE contact_queries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  } catch (e) {
    console.error('contact_queries migration error:', e.message);
  }
})();

// POST /api/contact
exports.submitQuery = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, mobile, subject, message } = req.body;

    const result = await db.query(
      `INSERT INTO contact_queries (name, email, mobile, subject, message, is_read)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, name, email, subject, created_at`,
      [name, email, mobile || null, subject || null, message]
    );

    const savedQuery = result.rows[0];

    // Fire both emails after response — never block the API
    setImmediate(async () => {
      try {
        await sendContactQueryNotification({ name, email, mobile, subject, message });
      } catch (err) {
        console.error('Contact admin email error:', err.message);
      }
      try {
        await sendContactAutoReply({ name, email, subject, message });
      } catch (err) {
        console.error('Contact auto-reply email error:', err.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted. We will get back to you soon.',
      data: savedQuery,
    });
  } catch (err) {
    console.error('submitQuery error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/contact - admin
exports.getQueries = async (req, res) => {
  try {
    const { unread, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (unread === 'true') {
      conditions.push(`is_read = false`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(
      `SELECT COUNT(*) FROM contact_queries ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const unreadCount = await db.query(
      `SELECT COUNT(*) FROM contact_queries WHERE is_read = false`
    );

    const result = await db.query(
      `SELECT id, name, email, mobile, subject, message, is_read, created_at
       FROM contact_queries ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: result.rows,
      unread_count: parseInt(unreadCount.rows[0].count),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getQueries error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/contact/:id/read
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE contact_queries SET is_read = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    res.json({ success: true, message: 'Query marked as read', data: result.rows[0] });
  } catch (err) {
    console.error('markRead error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/contact/:id/reply
exports.replyToQuery = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { message } = req.body;

    const result = await db.query(
      `SELECT id, name, email, subject FROM contact_queries WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    const query = result.rows[0];

    await sendAdminReply(query, message);

    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (err) {
    console.error('replyToQuery error:', err);
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
};

// DELETE /api/contact/:id
exports.deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM contact_queries WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    res.json({ success: true, message: 'Query deleted successfully' });
  } catch (err) {
    console.error('deleteQuery error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
