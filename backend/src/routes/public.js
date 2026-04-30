const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { removeFile } = require("../services/file-service");

function createPublicRouter({ config, upload, leadService }) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many submissions from this IP. Please try again later."
    }
  });

  router.post("/leads", limiter, upload.single("pdf"), async (req, res, next) => {
    try {
      const lead = await leadService.createLead({
        body: req.body,
        file: req.file,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      });

      res.status(201).json({
        id: lead.id,
        status: lead.status
      });
    } catch (error) {
      await removeFile(req.file?.path);
      next(error);
    }
  });

  return router;
}

module.exports = {
  createPublicRouter
};
