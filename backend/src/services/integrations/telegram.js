const { AppError } = require("../../utils/app-error");

class TelegramIntegration {
  constructor(config) {
    this.config = config;
  }

  isEnabled() {
    return Boolean(this.config.telegramBotToken && this.config.telegramChatId);
  }

  async sendLeadCreated(lead) {
    if (!this.isEnabled()) {
      return;
    }

    const adminUrl = `${this.config.appBaseUrl}/admin/leads/${lead.id}`;
    const lines = [
      "Новая заявка с лендинга Smetika",
      "",
      `ID: ${lead.id}`,
      `Имя: ${lead.name}`,
      `Контакт: ${lead.contact}`,
      `Компания: ${lead.company || "—"}`,
      `PDF: ${lead.pdfOriginalName ? `да (${lead.pdfOriginalName})` : "нет"}`,
      `Открыть: ${adminUrl}`
    ];

    const response = await fetch(
      `https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          chat_id: this.config.telegramChatId,
          text: lines.join("\n"),
          disable_web_page_preview: true
        })
      }
    );

    if (!response.ok) {
      throw new AppError(502, "Telegram notification failed", { expose: false });
    }
  }
}

module.exports = {
  TelegramIntegration
};
