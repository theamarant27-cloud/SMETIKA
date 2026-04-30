class AppError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = options.expose ?? true;
    this.details = options.details;
  }
}

module.exports = {
  AppError
};
