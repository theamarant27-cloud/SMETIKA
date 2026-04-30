const path = require("path");
const { AppError } = require("./app-error");

const LEAD_STATUSES = new Set(["new", "in_progress", "closed"]);

function normalizeOptionalString(value) {
  if (value == null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeRequiredString(value) {
  return String(value ?? "").trim();
}

function assertStringLength(fieldName, value, min, max, required = false) {
  if (!value) {
    if (required) {
      throw new AppError(422, `${fieldName} is required`);
    }

    return;
  }

  if (value.length < min || value.length > max) {
    throw new AppError(422, `${fieldName} must be between ${min} and ${max} characters`);
  }
}

function validateLeadPayload(payload) {
  const name = normalizeRequiredString(payload.name);
  const contact = normalizeRequiredString(payload.contact);
  const company = normalizeOptionalString(payload.company);
  const website = normalizeOptionalString(payload.website);

  assertStringLength("name", name, 2, 80, true);
  assertStringLength("contact", contact, 5, 120, true);
  assertStringLength("company", company, 0, 120, false);

  if (website) {
    throw new AppError(400, "Spam check failed");
  }

  return {
    name,
    contact,
    company
  };
}

function validateLeadUpdate(payload) {
  const status = normalizeRequiredString(payload.status);
  const adminNotes = normalizeOptionalString(payload.adminNotes) || "";

  if (!LEAD_STATUSES.has(status)) {
    throw new AppError(422, "Invalid lead status");
  }

  if (adminNotes.length > 5000) {
    throw new AppError(422, "adminNotes must be 5000 characters or fewer");
  }

  return {
    status,
    adminNotes
  };
}

function validateDateFilter(value, fieldName) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(422, `${fieldName} must be a valid date`);
  }

  return date.toISOString();
}

function validatePdfMetadata(file) {
  if (!file) {
    return;
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  const allowedMimeTypes = new Set(["application/pdf", "application/x-pdf"]);

  if (extension !== ".pdf") {
    throw new AppError(422, "Only PDF files are allowed");
  }

  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new AppError(422, "Invalid PDF MIME type");
  }
}

module.exports = {
  LEAD_STATUSES,
  validateLeadPayload,
  validateLeadUpdate,
  validateDateFilter,
  validatePdfMetadata
};
