const { ensureCsrfToken } = require("../utils/security");
const { AppError } = require("../utils/app-error");

function attachCsrfToken(req, res, next) {
  res.locals.csrfToken = ensureCsrfToken(req.session);
  next();
}

function requireCsrf(req, _res, next) {
  const expected = ensureCsrfToken(req.session);
  const provided =
    req.get("x-csrf-token") ||
    req.body?._csrf ||
    req.query?._csrf ||
    req.get("csrf-token");

  if (!provided || provided !== expected) {
    return next(new AppError(403, "Invalid CSRF token"));
  }

  return next();
}

module.exports = {
  attachCsrfToken,
  requireCsrf
};
