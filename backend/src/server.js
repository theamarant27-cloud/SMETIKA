require("dotenv").config();

const { buildConfig, getMissingConfig } = require("./config");
const { createPool, initializeDatabase, PostgresLeadRepository } = require("./db");
const { LeadService } = require("./services/lead-service");
const { LeadEvents } = require("./services/lead-events");
const { TelegramIntegration } = require("./services/integrations/telegram");
const { EmailIntegration } = require("./services/integrations/email");
const { createApp } = require("./app");
const { startRetentionJob } = require("./jobs/retention");

async function startServer() {
  const config = buildConfig();
  const missing = getMissingConfig(config);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const pool = createPool(config);
  await initializeDatabase(pool);

  const repository = new PostgresLeadRepository(pool, config.paginationPageSize);
  const integrations = [
    new TelegramIntegration(config),
    new EmailIntegration(config)
  ];
  const leadEvents = new LeadEvents(integrations);
  const leadService = new LeadService({
    config,
    repository,
    leadEvents
  });

  const app = await createApp({
    config,
    pool,
    leadService
  });

  startRetentionJob({ repository, config });

  app.listen(config.port, () => {
    console.log(`Smetika landing backend listening on ${config.port}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
