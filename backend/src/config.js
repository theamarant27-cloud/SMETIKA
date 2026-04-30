const path = require("path");

function readInt(name, fallback) {
  const raw = process.env[name];

  if (!raw) {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

function readBool(name, fallback) {
  const raw = process.env[name];

  if (raw == null || raw === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function normalizeOrigin(origin) {
  return origin ? origin.replace(/\/+$/, "") : "";
}

function buildConfig() {
  const rootDir = path.resolve(__dirname, "..");
  const port = readInt("PORT", 3000);
  const publicOrigin = normalizeOrigin(
    process.env.PUBLIC_ORIGIN || `http://localhost:${port}`
  );
  const appBaseUrl = normalizeOrigin(
    process.env.APP_BASE_URL || publicOrigin || `http://localhost:${port}`
  );
  const storageRoot = path.resolve(rootDir, process.env.STORAGE_ROOT || "storage");
  const tempDir = path.join(storageRoot, "tmp");
  const uploadDir = path.join(storageRoot, "uploads");
  const maxPdfSizeMb = readInt("MAX_PDF_SIZE_MB", 45);

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: (process.env.NODE_ENV || "development") === "production",
    port,
    appBaseUrl,
    publicOrigin,
    databaseUrl: process.env.DATABASE_URL || "",
    sessionSecret: process.env.SESSION_SECRET || "",
    sessionCookieName: process.env.SESSION_COOKIE_NAME || "smetika.sid",
    adminUsername: process.env.ADMIN_USERNAME || "admin",
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
    ipHashSalt: process.env.IP_HASH_SALT || "development-ip-salt",
    trustProxy: readBool("TRUST_PROXY", false),
    storageRoot,
    tempDir,
    uploadDir,
    maxPdfSizeMb,
    maxPdfSizeBytes: maxPdfSizeMb * 1024 * 1024,
    leadRetentionDays: readInt("LEAD_RETENTION_DAYS", 30),
    rateLimitWindowMs: readInt("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
    rateLimitMax: readInt("RATE_LIMIT_MAX", 5),
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
    telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: readInt("SMTP_PORT", 587),
    smtpSecure: readBool("SMTP_SECURE", false),
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
    smtpFrom: process.env.SMTP_FROM || "hello@smetika.pro",
    notificationEmailTo: process.env.NOTIFICATION_EMAIL_TO || "",
    paginationPageSize: 20
  };
}

function getMissingConfig(config) {
  const missing = [];

  if (!config.databaseUrl) {
    missing.push("DATABASE_URL");
  }

  if (!config.sessionSecret) {
    missing.push("SESSION_SECRET");
  }

  if (!config.adminPasswordHash) {
    missing.push("ADMIN_PASSWORD_HASH");
  }

  return missing;
}

module.exports = {
  buildConfig,
  getMissingConfig
};
