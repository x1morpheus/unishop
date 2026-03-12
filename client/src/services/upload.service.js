import api from "./api.js";

export const uploadService = {
  /**
   * Upload a single image file.
   * @param {File} file
   * @returns {Promise<{ url: string, filename: string }>}
   */
  uploadImage: async (file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await api.post("/upload/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data; // { url, filename }
  },

  /**
   * Upload multiple image files (max 5).
   * @param {File[]} files
   * @returns {Promise<Array<{ url: string, filename: string }>>}
   */
  uploadImages: async (files) => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    const res = await api.post("/upload/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.urls; // [{ url, filename }]
  },

  /**
   * Delete an uploaded image by filename.
   * @param {string} filename
   */
  deleteImage: (filename) =>
    api.delete(`/upload/${encodeURIComponent(filename)}`).then((r) => r.data),
};
