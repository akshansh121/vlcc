require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { swaggerDocs } = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// ---------------------------------------------------------------------------
// Route imports
// ---------------------------------------------------------------------------

// Guards against missing route files during incremental development
const safeRequire = (modulePath) => {
  try {
    return require(modulePath);
  } catch (err) {
    const stub = express.Router();
    stub.all('*', (_req, res) =>
      res.status(501).json({ success: false, message: `Route module '${modulePath}' not yet implemented.` })
    );
    return stub;
  }
};

const authRoutes        = safeRequire('./routes/auth');
const servicesRoutes    = safeRequire('./routes/services');
const packagesRoutes    = safeRequire('./routes/packages');
const staffRoutes       = safeRequire('./routes/staff');
const bookingsRoutes    = safeRequire('./routes/bookings');
const cartRoutes        = safeRequire('./routes/cart');
const offersRoutes      = safeRequire('./routes/offers');
const testimonialsRoutes = safeRequire('./routes/testimonials');
const contactRoutes     = safeRequire('./routes/contact');
const adminRoutes       = safeRequire('./routes/admin');
const paymentRoutes     = safeRequire('./routes/payments');

// ---------------------------------------------------------------------------
// App initialisation
// ---------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image serving
  })
);

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy does not allow origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------------------------------------------------------
// Compression (gzip) — early, after security/cors, before routes
// ---------------------------------------------------------------------------

app.use(compression());

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

app.use('/api/', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// ---------------------------------------------------------------------------
// Body parsers
// ---------------------------------------------------------------------------

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------------------
// Static file serving
// ---------------------------------------------------------------------------

const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// ---------------------------------------------------------------------------
// Swagger documentation
// ---------------------------------------------------------------------------

swaggerDocs(app);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    service: 'Beauty World API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ---------------------------------------------------------------------------
// Public cache headers
// ---------------------------------------------------------------------------

// Sets Cache-Control on PUBLIC, non-personalized GET responses only.
// Never applied to auth/admin/user-specific/booking/cart endpoints.
// `skip` lists path suffixes (relative to the mount point) that must NOT be
// cached because they are admin-protected (e.g. offers' GET /all).
const publicCache = (skip = []) => (req, res, next) => {
  if (req.method === 'GET' && !skip.includes(req.path)) {
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  next();
};

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/services',     publicCache(), servicesRoutes);
app.use('/api/packages',     publicCache(), packagesRoutes);
app.use('/api/staff',        publicCache(), staffRoutes);
app.use('/api/bookings',     bookingsRoutes);
app.use('/api/cart',         cartRoutes);
app.use('/api/offers',       publicCache(['/all']), offersRoutes);
app.use('/api/testimonials', publicCache(), testimonialsRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/payments',     paymentRoutes);

// ---------------------------------------------------------------------------
// 404 & global error handler
// ---------------------------------------------------------------------------

app.use(notFoundHandler);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

// Fire-and-forget performance index creation. Must never crash boot.
try {
  require('./config/perfIndexes');
} catch (err) {
  console.error('Performance index setup failed (non-fatal):', err.message);
}

app.listen(PORT, () => {
  console.log(`\n  Beauty World API running on port ${PORT}`);
  console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`  API docs    : http://localhost:${PORT}/api/docs\n`);
});

module.exports = app; // for testing
