const { validationResult } = require('express-validator');
const db = require('../config/database');

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT ci.id, ci.service_id, ci.quantity,
              s.name AS service_name, s.description, s.original_price, s.discounted_price,
              s.duration, s.image_url,
              (COALESCE(s.discounted_price, s.original_price) * ci.quantity) AS item_total
       FROM cart_items ci
       JOIN services s ON ci.service_id = s.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at ASC`,
      [userId]
    );

    const items = result.rows;
    const cartTotal = items.reduce((sum, item) => sum + parseFloat(item.item_total), 0);

    res.json({
      success: true,
      data: {
        items,
        cart_total: parseFloat(cartTotal.toFixed(2)),
        item_count: items.length,
      },
    });
  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/cart/add
exports.addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const userId = req.user.id;
    const { service_id, quantity = 1 } = req.body;

    // Verify service exists and is active
    const serviceResult = await db.query(
      `SELECT id FROM services WHERE id = $1 AND is_active = true`,
      [service_id]
    );
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found or inactive' });
    }

    // Insert or update quantity if item already exists
    const result = await db.query(
      `INSERT INTO cart_items (user_id, service_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, service_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
       RETURNING *`,
      [userId, service_id, quantity]
    );

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('addToCart error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/cart/:serviceId
exports.updateCartItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const userId = req.user.id;
    const { serviceId } = req.params;
    const { quantity } = req.body;

    const result = await db.query(
      `UPDATE cart_items SET quantity = $1, updated_at = NOW()
       WHERE user_id = $2 AND service_id = $3
       RETURNING *`,
      [quantity, userId, serviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.json({ success: true, message: 'Cart item updated', data: result.rows[0] });
  } catch (err) {
    console.error('updateCartItem error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/cart/:serviceId
exports.removeFromCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const userId = req.user.id;
    const { serviceId } = req.params;

    const result = await db.query(
      `DELETE FROM cart_items WHERE user_id = $1 AND service_id = $2 RETURNING id`,
      [userId, serviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('removeFromCart error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('clearCart error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/cart/apply-offer
exports.applyOffer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const userId = req.user.id;
    const { coupon_code } = req.body;

    // Get current cart total
    const cartResult = await db.query(
      `SELECT SUM(COALESCE(s.discounted_price, s.original_price) * ci.quantity) AS cart_total
       FROM cart_items ci
       JOIN services s ON ci.service_id = s.id
       WHERE ci.user_id = $1`,
      [userId]
    );

    const cartTotal = parseFloat(cartResult.rows[0].cart_total) || 0;

    if (cartTotal === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Validate offer by coupon code
    const offerResult = await db.query(
      `SELECT id, title, coupon_code, discount_type, discount_value, min_amount, max_discount, end_date
       FROM offers
       WHERE coupon_code = $1 AND is_active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE`,
      [coupon_code.toUpperCase()]
    );

    if (offerResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const offer = offerResult.rows[0];

    // Check minimum amount requirement
    if (offer.min_amount && cartTotal < parseFloat(offer.min_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${offer.min_amount} required for this coupon`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (offer.discount_type === 'percentage') {
      discountAmount = (cartTotal * parseFloat(offer.discount_value)) / 100;
      if (offer.max_discount) {
        discountAmount = Math.min(discountAmount, parseFloat(offer.max_discount));
      }
    } else {
      discountAmount = parseFloat(offer.discount_value);
    }

    discountAmount = Math.min(discountAmount, cartTotal);
    const finalAmount = cartTotal - discountAmount;

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        offer_id: offer.id,
        offer_title: offer.title,
        coupon_code: offer.coupon_code,
        cart_total: parseFloat(cartTotal.toFixed(2)),
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        final_amount: parseFloat(finalAmount.toFixed(2)),
        valid_until: offer.end_date,
      },
    });
  } catch (err) {
    console.error('applyOffer error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
