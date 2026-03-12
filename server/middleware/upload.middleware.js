import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "../../shared/constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to the uploads directory */
const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads");

/**
 * Disk storage — saves files to /server/uploads with a unique name.
 * Format: {timestamp}-{random}.{ext}
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const unique   = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

/**
 * Validates that the uploaded file is an allowed image type.
 */
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    );
    err.statusCode = 400;
    cb(err, false);
  }
};

/**
 * Single image upload — field name "image".
 * Max size: MAX_UPLOAD_BYTES (5 MB).
 *
 * @example
 * router.post("/upload", uploadSingle, uploadController.uploadImage);
 */
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_BYTES },
}).single("image");

/**
 * Multiple image upload — field name "images", max 5 files.
 *
 * @example
 * router.post("/upload/multiple", uploadMultiple, uploadController.uploadImages);
 */
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_BYTES },
}).array("images", 5);
