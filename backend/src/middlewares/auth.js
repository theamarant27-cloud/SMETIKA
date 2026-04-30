const { AppError } = require("../utils/app-error");

function requireAdmin(req, res, next) {
  if (!req.session?.isAdmin) {
    if (req.accepts(["html", "json"]) === "html") {
      res.redirect("/admin/login");
      return;
    }

    return next(new AppError(401, "Authentication required"));
  }

  return next();
}

module.exports = {
  requireAdmin
};
