const crypto = require('crypto');

// ---------------------------------------------------------------------------
// generateOrderId
// ---------------------------------------------------------------------------

/**
 * Generate a unique booking reference in the format BW-YYYYMMDD-XXXXXXXX.
 * @returns {string}
 */
const generateOrderId = () => {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `BW-${datePart}-${randomPart}`;
};

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------

/**
 * Format a numeric amount as Indian Rupees.
 * @param {number|string} amount
 * @returns {string}  e.g. "₹1,250.00"
 */
const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

// ---------------------------------------------------------------------------
// calculateDiscount
// ---------------------------------------------------------------------------

/**
 * Calculate the discounted price for a given offer.
 *
 * @param {number} originalPrice
 * @param {{ discount_type: 'percentage'|'fixed', discount_value: number }} offer
 * @returns {{ discountAmount: number, finalPrice: number }}
 */
const calculateDiscount = (originalPrice, offer) => {
  const price = parseFloat(originalPrice) || 0;

  if (!offer || !offer.discount_value) {
    return { discountAmount: 0, finalPrice: price };
  }

  const value = parseFloat(offer.discount_value) || 0;
  let discountAmount = 0;

  if (offer.discount_type === 'percentage') {
    discountAmount = (price * Math.min(value, 100)) / 100;
  } else {
    // fixed amount discount
    discountAmount = Math.min(value, price);
  }

  discountAmount = parseFloat(discountAmount.toFixed(2));
  const finalPrice = parseFloat((price - discountAmount).toFixed(2));

  return { discountAmount, finalPrice };
};

// ---------------------------------------------------------------------------
// getPaginationParams
// ---------------------------------------------------------------------------

/**
 * Extract and normalise pagination parameters from an Express query object.
 *
 * @param {object} queryParams - req.query
 * @param {number} [defaultLimit=10]
 * @returns {{ page: number, limit: number, offset: number }}
 */
const getPaginationParams = (queryParams, defaultLimit = 10) => {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(queryParams.limit, 10) || defaultLimit)
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// ---------------------------------------------------------------------------
// sanitizeUser
// ---------------------------------------------------------------------------

/**
 * Return a copy of the user object with sensitive fields removed.
 * @param {object} user - Raw user row from the database
 * @returns {object}
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { password, password_hash, reset_token, reset_token_expires, ...safe } = user;
  return safe;
};

// ---------------------------------------------------------------------------
// buildSortClause
// ---------------------------------------------------------------------------

/**
 * Build a safe SQL ORDER BY clause from query params.
 *
 * @param {object} queryParams  - req.query
 * @param {string[]} allowedColumns - Columns that may be sorted on
 * @param {string} defaultColumn
 * @param {string} defaultDirection
 * @returns {string}  e.g. "ORDER BY created_at DESC"
 */
const buildSortClause = (
  queryParams,
  allowedColumns,
  defaultColumn = 'created_at',
  defaultDirection = 'DESC'
) => {
  const sortBy = allowedColumns.includes(queryParams.sort_by)
    ? queryParams.sort_by
    : defaultColumn;
  const direction =
    queryParams.order && queryParams.order.toUpperCase() === 'ASC'
      ? 'ASC'
      : defaultDirection;
  return `ORDER BY ${sortBy} ${direction}`;
};

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------

/**
 * Convert a string to a URL-safe slug.
 * @param {string} text
 * @returns {string}
 */
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ---------------------------------------------------------------------------
// isValidUUID
// ---------------------------------------------------------------------------

/**
 * Check whether a string is a valid UUID v4.
 * @param {string} str
 * @returns {boolean}
 */
const isValidUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str
  );

module.exports = {
  generateOrderId,
  formatCurrency,
  calculateDiscount,
  getPaginationParams,
  sanitizeUser,
  buildSortClause,
  slugify,
  isValidUUID,
};
