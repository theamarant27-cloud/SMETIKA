const { removeFile } = require("../services/file-service");

async function purgeExpiredFiles({ repository, config }) {
  const cutoffDate = new Date(Date.now() - config.leadRetentionDays * 24 * 60 * 60 * 1000);
  const expiredLeads = await repository.listLeadsForRetention(cutoffDate.toISOString());

  for (const lead of expiredLeads) {
    try {
      await removeFile(lead.pdfStoragePath);
      await repository.markFilePurged(lead.id);
    } catch (error) {
      console.error(`Retention cleanup failed for lead ${lead.id}:`, error);
    }
  }
}

function startRetentionJob({ repository, config }) {
  const run = () => purgeExpiredFiles({ repository, config }).catch((error) => {
    console.error("Retention job failed:", error);
  });

  run();
  const intervalId = setInterval(run, 12 * 60 * 60 * 1000);
  intervalId.unref?.();
  return intervalId;
}

module.exports = {
  purgeExpiredFiles,
  startRetentionJob
};
