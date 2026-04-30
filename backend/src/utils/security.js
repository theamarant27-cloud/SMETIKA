const crypto = require("crypto");

function hashIpAddress(ipAddress, salt) {
  return crypto.createHash("sha256").update(`${salt}:${ipAddress || "unknown"}`).digest("hex");
}

function createCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}

function ensureCsrfToken(session) {
  if (!session.csrfToken) {
    session.csrfToken = createCsrfToken();
  }

  return session.csrfToken;
}

module.exports = {
  hashIpAddress,
  ensureCsrfToken
};
