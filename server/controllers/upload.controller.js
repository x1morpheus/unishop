import path from "path";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse, createError } from "../utils/apiResponse.js";

/**
 * Converts a multer file object to a public-facing URL.
 * Files are served at /uploads/filename from the Express static middleware.
 *
 * @param {Express.Multer.File} file
 * @param {import('express').Request} req
 * @returns {string}
 */
const fileToUrl = (file, req) => {
  const protocol = req.protocol;
  const host     = req.get("host");
  return `${protocol}://${host}/uploads/${file.filename}`;
};

/* ── POST /api/upload/image ─────────────────────────────────────────────────── */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw createError(400, "No image file provided");

  const url = fileToUrl(req.file, req);
  apiResponse(res, 201, { url, filename: req.file.filename }, "Image uploaded");
});

/* ── POST /api/upload/images ────────────────────────────────────────────────── */
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw createError(400, "No image files provided");

  const urls = req.files.map((file) => ({
    url:      fileToUrl(file, req),
    filename: file.filename,
  }));

  apiResponse(res, 201, { urls }, `${urls.length} image(s) uploaded`);
});

/* ── DELETE /api/upload/:filename ───────────────────────────────────────────── */
export const deleteImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  // Sanitise filename — prevent path traversal
  const safe = path.basename(filename);
  const filePath = path.resolve("uploads", safe);

  if (!fs.existsSync(filePath)) throw createError(404, "File not found");

  fs.unlinkSync(filePath);
  apiResponse(res, 200, null, "Image deleted");
});
