class LeadEvents {
  constructor(integrations) {
    this.integrations = integrations;
  }

  async emitLeadCreated(lead) {
    const results = await Promise.allSettled(
      this.integrations.map((integration) => integration.sendLeadCreated(lead))
    );

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Integration error:", result.reason);
      }
    });
  }
}

module.exports = {
  LeadEvents
};
