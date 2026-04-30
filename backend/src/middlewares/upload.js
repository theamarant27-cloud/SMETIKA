const path = require("path");
const multer = require("multer");

function createUploadMiddleware(config) {
  const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, config.tempDir),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname || ".pdf").toLowerCase() || ".pdf";
      callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
    }
  });

  return multer({
    storage,
    limits: {
      fileSize: config.maxPdfSizeBytes,
      files: 1
    }
  });
}

module.exports = {
  createUploadMiddleware
};
