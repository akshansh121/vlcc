const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure the uploads directory exists at startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organise uploads into sub-folders by resource type derived from the route
    let subDir = 'general';
    const url = req.originalUrl || '';

    if (url.includes('/services')) subDir = 'services';
    else if (url.includes('/packages')) subDir = 'packages';
    else if (url.includes('/staff')) subDir = 'staff';
    else if (url.includes('/offers')) subDir = 'offers';
    else if (url.includes('/testimonials')) subDir = 'testimonials';

    const dest = path.join(UPLOAD_DIR, subDir);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 40);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        'Only JPEG, PNG, and WebP images are allowed.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 10,
  },
});

/**
 * Upload a single image.
 * @param {string} fieldName - The form-data field name (default: 'image')
 */
const uploadSingle = (fieldName = 'image') => upload.single(fieldName);

/**
 * Upload multiple images.
 * @param {string} fieldName - The form-data field name (default: 'images')
 * @param {number} maxCount  - Maximum number of files (default: 5)
 */
const uploadArray = (fieldName = 'images', maxCount = 5) =>
  upload.array(fieldName, maxCount);

/**
 * Upload images for multiple distinct fields.
 * @param {Array<{name: string, maxCount: number}>} fields
 */
const uploadFields = (fields) => upload.fields(fields);

module.exports = { uploadSingle, uploadArray, uploadFields, upload };
