const crypto = require("crypto");
const {
  assertPdfSignature,
  promoteUploadedFile,
  removeFile
} = require("./file-service");
const {
  validateLeadPayload,
  validateLeadUpdate,
  validatePdfMetadata,
  validateDateFilter,
  LEAD_STATUSES
} = require("../utils/validation");
const { AppError } = require("../utils/app-error");
const { hashIpAddress } = require("../utils/security");

class LeadService {
  constructor({ config, repository, leadEvents }) {
    this.config = config;
    this.repository = repository;
    this.leadEvents = leadEvents;
  }

  async createLead({ body, file, ipAddress, userAgent }) {
    const payload = validateLeadPayload(body);
    let finalFilePath = null;
    let createdLead = null;

    try {
      if (file) {
        validatePdfMetadata(file);
        await assertPdfSignature(file.path);
      }

      const leadId = crypto.randomUUID();

      if (file) {
        finalFilePath = await promoteUploadedFile(file.path, leadId, this.config.uploadDir);
      }

      createdLead = await this.repository.createLead({
        id: leadId,
        name: payload.name,
        contact: payload.contact,
        company: payload.company,
        messageSource: "landing_page",
        status: "new",
        pdfOriginalName: file ? file.originalname : null,
        pdfStoragePath: finalFilePath,
        pdfSizeBytes: file ? file.size : null,
        adminNotes: "",
        submitIpHash: hashIpAddress(ipAddress, this.config.ipHashSalt),
        userAgent: userAgent || null
      });
    } catch (error) {
      await removeFile(finalFilePath || file?.path);
      throw error;
    }

    this.leadEvents
      .emitLeadCreated(createdLead)
      .catch((error) => console.error("Lead notification failed:", error));

    return createdLead;
  }

  async listLeads(filters) {
    const status = filters.status ? String(filters.status) : null;

    if (status && !LEAD_STATUSES.has(status)) {
      throw new AppError(422, "Invalid lead status filter");
    }

    const page = Math.max(Number.parseInt(filters.page || "1", 10) || 1, 1);

    return this.repository.listLeads({
      status,
      dateFrom: validateDateFilter(filters.date_from, "date_from"),
      dateTo: validateDateFilter(filters.date_to, "date_to"),
      page
    });
  }

  async getLeadById(id) {
    const lead = await this.repository.getLeadById(id);

    if (!lead) {
      throw new AppError(404, "Lead not found");
    }

    return lead;
  }

  async updateLead(id, payload) {
    const updates = validateLeadUpdate(payload);
    const lead = await this.repository.updateLead(id, updates);

    if (!lead) {
      throw new AppError(404, "Lead not found");
    }

    return lead;
  }
}

module.exports = {
  LeadService
};
