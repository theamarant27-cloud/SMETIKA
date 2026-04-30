const fs = require("fs/promises");
const path = require("path");
const { AppError } = require("../utils/app-error");

async function ensureStorageDirectories(config) {
  await fs.mkdir(config.tempDir, { recursive: true });
  await fs.mkdir(config.uploadDir, { recursive: true });
}

async function removeFile(filePath) {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function sanitizeDownloadName(originalName, fallbackId) {
  const baseName = path.basename(originalName || `lead-${fallbackId}.pdf`);
  return baseName.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

async function assertPdfSignature(filePath) {
  const handle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(5);
    await handle.read(buffer, 0, buffer.length, 0);

    if (buffer.toString() !== "%PDF-") {
      throw new AppError(422, "Uploaded file is not a valid PDF");
    }
  } finally {
    await handle.close();
  }
}

async function promoteUploadedFile(tempPath, leadId, uploadDir) {
  const finalPath = path.join(uploadDir, `${leadId}.pdf`);
  await fs.rename(tempPath, finalPath);
  return finalPath;
}

function isPathInside(parentPath, targetPath) {
  const relative = path.relative(parentPath, targetPath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

module.exports = {
  ensureStorageDirectories,
  removeFile,
  sanitizeDownloadName,
  assertPdfSignature,
  promoteUploadedFile,
  isPathInside
};
