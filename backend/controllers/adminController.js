const db = require('../config/database');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Run all stat queries in parallel
    const [
      totalUsersResult,
      totalBookingsResult,
      totalRevenueResult,
      todayBookingsResult,
      monthRevenueResult,
      recentBookingsResult,
      popularServicesResult,
      monthlyRevenueResult,
    ] = await Promise.all([
      // Total registered users (non-admin)
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'user'`),

      // Total bookings
      db.query(`SELECT COUNT(*) FROM bookings`),

      // Total revenue from completed bookings
      db.query(
        `SELECT COALESCE(SUM(final_amount), 0) AS total FROM bookings WHERE status = 'completed'`
      ),

      // Today's booking count
      db.query(
        `SELECT COUNT(*) FROM bookings WHERE booking_date = CURRENT_DATE`
      ),

      // This month's revenue
      db.query(
        `SELECT COALESCE(SUM(final_amount), 0) AS total
         FROM bookings
         WHERE status = 'completed'
           AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)`
      ),

      // Recent 5 bookings with user info
      db.query(
        `SELECT b.id, b.booking_date, b.booking_time, b.status, b.final_amount, b.created_at,
                u.name AS user_name, u.email AS user_email
         FROM bookings b
         LEFT JOIN users u ON b.user_id = u.id
         ORDER BY b.created_at DESC
         LIMIT 5`
      ),

      // Popular services (top 5 by booking count)
      db.query(
        `SELECT bi.service_id, s.name AS service_name,
                COUNT(*) AS booking_count,
                SUM(bi.quantity) AS total_quantity
         FROM booking_items bi
         JOIN services s ON bi.service_id = s.id
         GROUP BY bi.service_id, s.name
         ORDER BY booking_count DESC
         LIMIT 5`
      ),

      // Monthly revenue for last 12 months
      db.query(
        `SELECT TO_CHAR(booking_date, 'YYYY-MM') AS month,
                COALESCE(SUM(final_amount), 0) AS revenue,
                COUNT(*) AS bookings_count
         FROM bookings
         WHERE status = 'completed'
           AND booking_date >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
         GROUP BY TO_CHAR(booking_date, 'YYYY-MM')
         ORDER BY month ASC`
      ),
    ]);

    res.json({
      success: true,
      data: {
        total_users: parseInt(totalUsersResult.rows[0].count),
        total_bookings: parseInt(totalBookingsResult.rows[0].count),
        total_revenue: parseFloat(totalRevenueResult.rows[0].total),
        today_bookings: parseInt(todayBookingsResult.rows[0].count),
        this_month_revenue: parseFloat(monthRevenueResult.rows[0].total),
        recent_bookings: recentBookingsResult.rows,
        popular_services: popularServicesResult.rows,
        monthly_revenue: monthlyRevenueResult.rows,
      },
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, is_blocked } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [`u.role = 'user'`];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(
        `(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.mobile ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (is_blocked !== undefined) {
      conditions.push(`u.is_blocked = $${paramIndex}`);
      params.push(is_blocked === 'true');
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await db.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.mobile, u.is_blocked, u.created_at,
              COUNT(b.id) AS booking_count
       FROM users u
       LEFT JOIN bookings b ON u.id = b.user_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
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
    console.error('getUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/users/:id
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await db.query(
      `SELECT id, name, email, mobile, is_blocked, created_at FROM users WHERE id = $1 AND role = 'user'`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bookingsResult = await db.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.status, b.total_amount,
              b.discount_amount, b.final_amount, b.created_at,
              json_agg(
                json_build_object(
                  'service_id', bi.service_id,
                  'service_name', s.name,
                  'quantity', bi.quantity,
                  'price', bi.price
                )
              ) AS items
       FROM bookings b
       LEFT JOIN booking_items bi ON b.id = bi.booking_id
       LEFT JOIN services s ON bi.service_id = s.id
       WHERE b.user_id = $1
       GROUP BY b.id
       ORDER BY b.created_at DESC`,
      [id]
    );

    const statsResult = await db.query(
      `SELECT
         COUNT(*) AS total_bookings,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed_bookings,
         COALESCE(SUM(final_amount) FILTER (WHERE status = 'completed'), 0) AS total_spent
       FROM bookings WHERE user_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        stats: statsResult.rows[0],
        bookings: bookingsResult.rows,
      },
    });
  } catch (err) {
    console.error('getUserDetails error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await db.query(
      `SELECT id, is_blocked FROM users WHERE id = $1 AND role = 'user'`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentStatus = userResult.rows[0].is_blocked;
    const newStatus = !currentStatus;

    const result = await db.query(
      `UPDATE users SET is_blocked = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, is_blocked`,
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `User has been ${newStatus ? 'blocked' : 'unblocked'} successfully`,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('toggleBlockUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await db.query(
      `SELECT id FROM users WHERE id = $1 AND role = 'user'`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db.query(`DELETE FROM users WHERE id = $1`, [id]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/revenue
exports.getRevenue = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let revenueResult;
    let periodLabel;

    if (period === 'weekly') {
      // Last 12 weeks
      periodLabel = 'week';
      revenueResult = await db.query(
        `SELECT TO_CHAR(DATE_TRUNC('week', booking_date), 'YYYY-MM-DD') AS period,
                COALESCE(SUM(final_amount), 0) AS revenue,
                COUNT(*) AS bookings_count,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
                COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count
         FROM bookings
         WHERE booking_date >= DATE_TRUNC('week', NOW() - INTERVAL '11 weeks')
         GROUP BY DATE_TRUNC('week', booking_date)
         ORDER BY period ASC`
      );
    } else {
      // Last 12 months (default)
      periodLabel = 'month';
      revenueResult = await db.query(
        `SELECT TO_CHAR(booking_date, 'YYYY-MM') AS period,
                COALESCE(SUM(final_amount), 0) AS revenue,
                COUNT(*) AS bookings_count,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
                COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_count
         FROM bookings
         WHERE booking_date >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
         GROUP BY TO_CHAR(booking_date, 'YYYY-MM')
         ORDER BY period ASC`
      );
    }

    // Overall revenue summary
    const summaryResult = await db.query(
      `SELECT
         COALESCE(SUM(final_amount) FILTER (WHERE status = 'completed'), 0) AS total_revenue,
         COALESCE(SUM(final_amount) FILTER (WHERE status = 'completed' AND DATE_TRUNC('month', booking_date) = DATE_TRUNC('month', CURRENT_DATE)), 0) AS this_month_revenue,
         COALESCE(SUM(final_amount) FILTER (WHERE status = 'completed' AND DATE_TRUNC('week', booking_date) = DATE_TRUNC('week', CURRENT_DATE)), 0) AS this_week_revenue,
         COALESCE(SUM(discount_amount) FILTER (WHERE status = 'completed'), 0) AS total_discounts_given
       FROM bookings`
    );

    res.json({
      success: true,
      data: {
        period: periodLabel,
        breakdown: revenueResult.rows,
        summary: summaryResult.rows[0],
      },
    });
  } catch (err) {
    console.error('getRevenue error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
