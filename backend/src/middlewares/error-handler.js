const multer = require("multer");
const { AppError } = require("../utils/app-error");

function notFoundHandler(_req, _res, next) {
  next(new AppError(404, "Route not found"));
}

function errorHandler(error, req, res, _next) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      error = new AppError(413, "PDF file exceeds the maximum allowed size");
    } else {
      error = new AppError(400, error.message);
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.expose === false ? "Internal server error" : error.message;

  if (req.path.startsWith("/admin") && req.accepts(["html", "json"]) === "html") {
    res.status(statusCode).send(`
      <!doctype html>
      <html lang="ru">
        <head>
          <meta charset="utf-8" />
          <title>Ошибка</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f6f8fc; color: #1c2230; }
            .card { max-width: 640px; background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 8px 30px rgba(28,34,48,.08); }
            a { color: #c94436; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Ошибка</h1>
            <p>${message}</p>
            <p><a href="/admin/leads">Вернуться в админку</a></p>
          </div>
        </body>
      </html>
    `);
    return;
  }

  res.status(statusCode).json({
    error: message
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
