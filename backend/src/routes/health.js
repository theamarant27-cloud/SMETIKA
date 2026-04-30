const { Router } = require("express");

function createHealthRouter() {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ status: "ok" });
  });

  return router;
}

module.exports = {
  createHealthRouter
};
