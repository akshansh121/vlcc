const { validationResult } = require('express-validator');
const db = require('../config/database');

// GET /api/offers - active non-expired offers (public)
exports.getActiveOffers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, description, coupon_code, discount_type, discount_value,
              min_amount, max_discount, start_date, end_date, usage_limit, used_count, is_active
       FROM offers
       WHERE is_active = true AND end_date >= CURRENT_DATE AND start_date <= CURRENT_DATE
       ORDER BY created_at DESC`
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getActiveOffers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/offers/all - admin, all offers with pagination
exports.getAllOffers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR coupon_code ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await db.query(
      `SELECT COUNT(*) FROM offers ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT id, title, description, coupon_code, discount_type, discount_value,
              min_amount, max_discount, start_date, end_date, usage_limit, used_count, is_active, created_at
       FROM offers ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getAllOffers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/offers/:id
exports.getOffer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { id } = req.params;

    const result = await db.query(
      `SELECT id, title, description, coupon_code, discount_type, discount_value,
              min_amount, max_discount, start_date, end_date, usage_limit, used_count, is_active, created_at
       FROM offers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('getOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/offers
exports.createOffer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      coupon_code,
      discount_type,
      discount_value,
      min_amount,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      is_active = true,
    } = req.body;

    // Ensure coupon_code is unique
    const normalizedCoupon = coupon_code.toUpperCase();
    const existingResult = await db.query(`SELECT id FROM offers WHERE coupon_code = $1`, [normalizedCoupon]);
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const result = await db.query(
      `INSERT INTO offers (title, description, coupon_code, discount_type, discount_value, min_amount, max_discount, start_date, end_date, usage_limit, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        description || null,
        normalizedCoupon,
        discount_type,
        discount_value,
        min_amount || null,
        max_discount || null,
        start_date,
        end_date,
        usage_limit || 100,
        is_active,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('createOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/offers/:id
exports.updateOffer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;

    // Check offer exists
    const existingResult = await db.query(`SELECT id, start_date, end_date FROM offers WHERE id = $1`, [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const allowedFields = [
      'title', 'description', 'coupon_code', 'discount_type',
      'discount_value', 'min_amount', 'max_discount', 'start_date', 'end_date', 'usage_limit', 'is_active',
    ];

    if (req.body.coupon_code) {
      const duplicateResult = await db.query(
        `SELECT id FROM offers WHERE coupon_code = $1 AND id <> $2`,
        [req.body.coupon_code.toUpperCase(), id]
      );
      if (duplicateResult.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists' });
      }
    }

    const startDate = req.body.start_date || existingResult.rows[0].start_date;
    const endDate = req.body.end_date || existingResult.rows[0].end_date;
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const updates = [];
    const params = [];
    let paramIndex = 1;

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'coupon_code') {
          updates.push(`${field} = $${paramIndex}`);
          params.push(req.body[field].toUpperCase());
        } else {
          updates.push(`${field} = $${paramIndex}`);
          params.push(req.body[field]);
        }
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await db.query(
      `UPDATE offers SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    res.json({ success: true, message: 'Offer updated successfully', data: result.rows[0] });
  } catch (err) {
    console.error('updateOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/offers/:id
exports.deleteOffer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { id } = req.params;

    const result = await db.query(`DELETE FROM offers WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    console.error('deleteOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/offers/validate
exports.validateCoupon = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { coupon_code, cart_total } = req.body;

    const result = await db.query(
      `SELECT id, title, coupon_code, discount_type, discount_value, min_amount, max_discount, end_date
       FROM offers
       WHERE coupon_code = $1 AND is_active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE`,
      [coupon_code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const offer = result.rows[0];
    const cartTotalNum = parseFloat(cart_total);

    if (offer.min_amount && cartTotalNum < parseFloat(offer.min_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${offer.min_amount} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (offer.discount_type === 'percentage') {
      discountAmount = (cartTotalNum * parseFloat(offer.discount_value)) / 100;
      if (offer.max_discount) {
        discountAmount = Math.min(discountAmount, parseFloat(offer.max_discount));
      }
    } else {
      discountAmount = parseFloat(offer.discount_value);
    }

    discountAmount = Math.min(discountAmount, cartTotalNum);
    const finalAmount = cartTotalNum - discountAmount;

    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        offer_id: offer.id,
        offer_title: offer.title,
        coupon_code: offer.coupon_code,
        discount_type: offer.discount_type,
        discount_value: parseFloat(offer.discount_value),
        cart_total: parseFloat(cartTotalNum.toFixed(2)),
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        final_amount: parseFloat(finalAmount.toFixed(2)),
        valid_until: offer.end_date,
      },
    });
  } catch (err) {
    console.error('validateCoupon error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
