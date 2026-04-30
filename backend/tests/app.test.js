const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const argon2 = require("argon2");
const request = require("supertest");
const session = require("express-session");
const { createApp } = require("../src/app");
const { LeadService } = require("../src/services/lead-service");
const { LeadEvents } = require("../src/services/lead-events");

class InMemoryLeadRepository {
  constructor() {
    this.leads = [];
  }

  async createLead(lead) {
    const createdAt = new Date().toISOString();
    const created = {
      ...lead,
      createdAt,
      updatedAt: createdAt,
      closedAt: null,
      filePurgedAt: null
    };

    this.leads.unshift(created);
    return created;
  }

  async listLeads({ status, page }) {
    const filtered = status ? this.leads.filter((lead) => lead.status === status) : this.leads;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    return {
      items: filtered.slice(offset, offset + pageSize),
      total: filtered.length,
      page,
      pageSize
    };
  }

  async getLeadById(id) {
    return this.leads.find((lead) => lead.id === id) || null;
  }

  async updateLead(id, updates) {
    const lead = await this.getLeadById(id);

    if (!lead) {
      return null;
    }

    Object.assign(lead, updates, {
      updatedAt: new Date().toISOString(),
      closedAt: updates.status === "closed" ? new Date().toISOString() : null
    });

    return lead;
  }

  async listLeadsForRetention() {
    return [];
  }

  async markFilePurged(id) {
    return this.getLeadById(id);
  }
}

function extractCsrfToken(html) {
  const match = html.match(/name="_csrf" value="([^"]+)"/);
  return match?.[1];
}

async function buildTestApp() {
  const baseDir = await fs.mkdtemp(path.join(os.tmpdir(), "smetika-backend-"));
  const tempDir = path.join(baseDir, "tmp");
  const uploadDir = path.join(baseDir, "uploads");
  await fs.mkdir(tempDir, { recursive: true });
  await fs.mkdir(uploadDir, { recursive: true });

  const config = {
    nodeEnv: "test",
    isProduction: false,
    port: 0,
    appBaseUrl: "http://localhost:3000",
    publicOrigin: "http://localhost:3000",
    sessionSecret: "test-secret",
    sessionCookieName: "test.sid",
    adminUsername: "admin",
    adminPasswordHash: await argon2.hash("password123"),
    ipHashSalt: "test-salt",
    trustProxy: false,
    tempDir,
    uploadDir,
    maxPdfSizeBytes: 45 * 1024 * 1024,
    rateLimitWindowMs: 15 * 60 * 1000,
    rateLimitMax: 50,
    paginationPageSize: 20
  };
  const repository = new InMemoryLeadRepository();
  const leadEvents = new LeadEvents([]);
  const leadService = new LeadService({ config, repository, leadEvents });

  const app = await createApp({
    config,
    leadService,
    sessionStore: new session.MemoryStore()
  });

  return { app, repository, baseDir };
}

test("POST /api/leads accepts a valid form without PDF", async () => {
  const { app } = await buildTestApp();

  const response = await request(app)
    .post("/api/leads")
    .field("name", "Ivan")
    .field("contact", "@ivan")
    .field("company", "Smetika");

  assert.equal(response.status, 201);
  assert.equal(response.body.status, "new");
  assert.ok(response.body.id);
});

test("POST /api/leads rejects non-PDF uploads", async () => {
  const { app } = await buildTestApp();

  const response = await request(app)
    .post("/api/leads")
    .field("name", "Ivan")
    .field("contact", "@ivan")
    .attach("pdf", Buffer.from("not a pdf"), {
      filename: "bad.txt",
      contentType: "text/plain"
    });

  assert.equal(response.status, 422);
});

test("admin flow requires login and supports lead updates", async () => {
  const { app } = await buildTestApp();
  const agent = request.agent(app);

  const createResponse = await agent
    .post("/api/leads")
    .field("name", "Ivan")
    .field("contact", "@ivan");

  const leadId = createResponse.body.id;

  const deniedResponse = await agent.get("/admin/leads").set("accept", "application/json");
  assert.equal(deniedResponse.status, 401);

  const loginPage = await agent.get("/admin/login");
  const loginToken = extractCsrfToken(loginPage.text);

  const loginResponse = await agent
    .post("/admin/login")
    .type("form")
    .set("accept", "application/json")
    .send({
      username: "admin",
      password: "password123",
      _csrf: loginToken
    });

  assert.equal(loginResponse.status, 200);

  const leadPage = await agent.get(`/admin/leads/${leadId}`);
  const csrfToken = extractCsrfToken(leadPage.text);

  const patchResponse = await agent
    .patch(`/admin/leads/${leadId}`)
    .set("x-csrf-token", csrfToken)
    .send({
      status: "closed",
      adminNotes: "done"
    });

  assert.equal(patchResponse.status, 200);
  assert.equal(patchResponse.body.status, "closed");
  assert.equal(patchResponse.body.adminNotes, "done");
});
