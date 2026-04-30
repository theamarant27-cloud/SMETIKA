const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const cors = require("cors");
const helmet = require("helmet");
const { attachCsrfToken } = require("./middlewares/csrf");
const { errorHandler, notFoundHandler } = require("./middlewares/error-handler");
const { ensureStorageDirectories } = require("./services/file-service");
const { createUploadMiddleware } = require("./middlewares/upload");
const { createPublicRouter } = require("./routes/public");
const { createAdminRouter } = require("./routes/admin");
const { createHealthRouter } = require("./routes/health");

async function createApp({ config, pool, leadService, sessionStore }) {
  await ensureStorageDirectories(config);

  const app = express();

  if (config.trustProxy) {
    app.set("trust proxy", 1);
  }

  const store =
    sessionStore ||
    new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true
    });

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origin === config.publicOrigin) {
          callback(null, true);
          return;
        }

        const error = new Error("CORS origin is not allowed");
        error.statusCode = 403;
        error.expose = true;
        callback(error);
      },
      credentials: true
    })
  );
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(
    session({
      name: config.sessionCookieName,
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.isProduction,
        maxAge: 24 * 60 * 60 * 1000
      }
    })
  );
  app.use(attachCsrfToken);

  const upload = createUploadMiddleware(config);

  app.use("/health", createHealthRouter());
  app.use("/api", createPublicRouter({ config, upload, leadService }));

  const adminRouter = createAdminRouter({
    config,
    leadService
  });
  app.use("/admin", adminRouter);

  app.get("/", (_req, res) => {
    res.redirect("/admin");
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
