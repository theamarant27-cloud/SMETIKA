const nodemailer = require("nodemailer");

class EmailIntegration {
  constructor(config) {
    this.config = config;
    this.transporter = null;
  }

  isEnabled() {
    return Boolean(
      this.config.smtpHost &&
        this.config.notificationEmailTo &&
        this.config.smtpFrom
    );
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpSecure,
        auth: this.config.smtpUser
          ? {
              user: this.config.smtpUser,
              pass: this.config.smtpPass
            }
          : undefined
      });
    }

    return this.transporter;
  }

  async sendLeadCreated(lead) {
    if (!this.isEnabled()) {
      return;
    }

    const adminUrl = `${this.config.appBaseUrl}/admin/leads/${lead.id}`;
    const transporter = this.getTransporter();

    await transporter.sendMail({
      from: this.config.smtpFrom,
      to: this.config.notificationEmailTo,
      subject: `Новая заявка Smetika: ${lead.name}`,
      text: [
        "Новая заявка с лендинга Smetika",
        `ID: ${lead.id}`,
        `Имя: ${lead.name}`,
        `Контакт: ${lead.contact}`,
        `Компания: ${lead.company || "—"}`,
        `PDF: ${lead.pdfOriginalName ? `да (${lead.pdfOriginalName})` : "нет"}`,
        `Открыть: ${adminUrl}`
      ].join("\n"),
      html: `
        <h2>Новая заявка с лендинга Smetika</h2>
        <p><strong>ID:</strong> ${lead.id}</p>
        <p><strong>Имя:</strong> ${lead.name}</p>
        <p><strong>Контакт:</strong> ${lead.contact}</p>
        <p><strong>Компания:</strong> ${lead.company || "—"}</p>
        <p><strong>PDF:</strong> ${
          lead.pdfOriginalName ? `да (${lead.pdfOriginalName})` : "нет"
        }</p>
        <p><a href="${adminUrl}">Открыть заявку в админке</a></p>
      `
    });
  }
}

module.exports = {
  EmailIntegration
};
