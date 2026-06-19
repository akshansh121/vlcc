const { validationResult } = require('express-validator');

/**
 * Run express-validator checks and short-circuit with 422 if any fail.
 * Call this inside route handlers before business logic.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Global error-handling middleware.
 * Must be registered as the last app.use() call.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // express-validator errors forwarded manually
  if (err.type === 'validation') {
    return res.status(422).json({
      success: false,
      message: 'Validation error.',
      errors: err.errors || [],
    });
  }

  // PostgreSQL unique-constraint violation (23505)
  if (err.code === '23505') {
    const field = err.detail
      ? err.detail.match(/Key \((.+?)\)/)?.[1] || 'field'
      : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
      errors: [{ field, message: `Duplicate value for ${field}.` }],
    });
  }

  // PostgreSQL foreign-key violation (23503)
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
      errors: [],
    });
  }

  // PostgreSQL not-null violation (23502)
  if (err.code === '23502') {
    const field = err.column || 'field';
    return res.status(400).json({
      success: false,
      message: `${field} is required.`,
      errors: [{ field, message: `${field} cannot be null.` }],
    });
  }

  // PostgreSQL connection / general DB errors
  if (err.code && err.code.startsWith('08')) {
    return res.status(503).json({
      success: false,
      message: 'Database connection error. Please try again later.',
      errors: [],
    });
  }

  // JWT errors (should normally be caught in auth middleware)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      errors: [],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please login again.',
      errors: [],
    });
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 5 MB limit.',
        errors: [],
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      errors: [],
    });
  }

  // SyntaxError from express.json() body parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
      errors: [],
    });
  }

  // HTTP errors with an explicit status code
  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    return res.status(status).json({
      success: false,
      message: err.message || 'An error occurred.',
      errors: [],
    });
  }

  // Fallback — 500 Internal Server Error
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error.'
        : err.message || 'Internal server error.',
    errors:
      process.env.NODE_ENV === 'production'
        ? []
        : [{ stack: err.stack }],
  });
};

/**
 * 404 handler — mount before errorHandler but after all routes.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    errors: [],
  });
};

module.exports = { validateRequest, errorHandler, notFoundHandler };
