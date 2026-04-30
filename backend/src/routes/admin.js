const express = require("express");
const argon2 = require("argon2");
const { requireAdmin } = require("../middlewares/auth");
const { requireCsrf } = require("../middlewares/csrf");
const { sanitizeDownloadName, isPathInside } = require("../services/file-service");
const { renderLoginPage } = require("../views/login-page");
const { renderLeadsPage } = require("../views/leads-page");
const { renderLeadPage } = require("../views/lead-page");
const { AppError } = require("../utils/app-error");

function wantsJson(req) {
  return req.accepts(["html", "json"]) === "json";
}

function createAdminRouter({ config, leadService }) {
  const router = express.Router();

  router.get("/", (req, res) => {
    if (!req.session?.isAdmin) {
      return res.redirect("/admin/login");
    }

    return res.redirect("/admin/leads");
  });

  router.get("/login", (req, res) => {
    if (req.session?.isAdmin) {
      return res.redirect("/admin/leads");
    }

    return res.send(
      renderLoginPage({
        csrfToken: res.locals.csrfToken
      })
    );
  });

  router.post("/login", requireCsrf, async (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    const isValidUser = username === config.adminUsername;
    const isValidPassword = isValidUser
      ? await argon2.verify(config.adminPasswordHash, password)
      : false;

    if (!isValidUser || !isValidPassword) {
      const errorMessage = "Неверный логин или пароль.";

      if (wantsJson(req)) {
        res.status(401).json({ error: errorMessage });
        return;
      }

      res.status(401).send(
        renderLoginPage({
          csrfToken: res.locals.csrfToken,
          errorMessage
        })
      );
      return;
    }

    req.session.isAdmin = true;
    req.session.adminUsername = config.adminUsername;

    if (wantsJson(req)) {
      res.json({ ok: true });
      return;
    }

    res.redirect("/admin/leads");
  });

  router.post("/logout", requireAdmin, requireCsrf, (req, res, next) => {
    req.session.destroy((error) => {
      if (error) {
        next(error);
        return;
      }

      res.clearCookie(config.sessionCookieName);

      if (wantsJson(req)) {
        res.json({ ok: true });
        return;
      }

      res.redirect("/admin/login");
    });
  });

  router.get("/leads", requireAdmin, async (req, res, next) => {
    try {
      const result = await leadService.listLeads(req.query);

      if (wantsJson(req)) {
        res.json(result);
        return;
      }

      res.send(
        renderLeadsPage({
          leads: result.items,
          filters: {
            status: req.query.status || "",
            dateFrom: req.query.date_from || "",
            dateTo: req.query.date_to || ""
          },
          pagination: result,
          csrfToken: res.locals.csrfToken
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/leads/:id", requireAdmin, async (req, res, next) => {
    try {
      const lead = await leadService.getLeadById(req.params.id);

      if (wantsJson(req)) {
        res.json(lead);
        return;
      }

      res.send(
        renderLeadPage({
          lead,
          csrfToken: res.locals.csrfToken
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/leads/:id/file", requireAdmin, async (req, res, next) => {
    try {
      const lead = await leadService.getLeadById(req.params.id);

      if (!lead.pdfStoragePath) {
        throw new AppError(404, "PDF file is not available");
      }

      if (!isPathInside(config.uploadDir, lead.pdfStoragePath)) {
        throw new AppError(400, "Invalid file path");
      }

      res.download(
        lead.pdfStoragePath,
        sanitizeDownloadName(lead.pdfOriginalName, lead.id)
      );
    } catch (error) {
      next(error);
    }
  });

  router.patch("/leads/:id", requireAdmin, requireCsrf, async (req, res, next) => {
    try {
      const lead = await leadService.updateLead(req.params.id, req.body);
      res.json(lead);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createAdminRouter
};
