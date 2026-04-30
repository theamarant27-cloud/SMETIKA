const { renderLayout } = require("./layout");
const { escapeHtml, formatDate } = require("../utils/html");

function renderLeadPage({ lead, csrfToken }) {
  const toolbar = `
    <div>
      <a href="/admin/leads">← Назад к списку</a>
    </div>
    <form method="post" action="/admin/logout">
      <input type="hidden" name="_csrf" value="${csrfToken}" />
      <button type="submit" class="button secondary">Выйти</button>
    </form>
  `;

  const body = `
    <h1 style="margin-bottom:8px;">Заявка ${escapeHtml(lead.name)}</h1>
    <p class="muted" style="margin-bottom:24px;">Создана ${formatDate(lead.createdAt)}</p>
    <div class="grid cols-2" style="margin-bottom:24px;">
      <div>
        <h3>Контакты</h3>
        <p><strong>Имя:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong>Контакт:</strong> ${escapeHtml(lead.contact)}</p>
        <p><strong>Компания:</strong> ${escapeHtml(lead.company || "—")}</p>
      </div>
      <div>
        <h3>Технические данные</h3>
        <p><strong>ID:</strong> ${escapeHtml(lead.id)}</p>
        <p><strong>Источник:</strong> ${escapeHtml(lead.messageSource)}</p>
        <p><strong>IP hash:</strong> <span class="muted">${escapeHtml(lead.submitIpHash || "—")}</span></p>
        <p><strong>User-Agent:</strong> <span class="muted">${escapeHtml(lead.userAgent || "—")}</span></p>
      </div>
    </div>
    <div class="grid cols-2">
      <div>
        <h3>Файл</h3>
        <p><strong>Исходное имя:</strong> ${escapeHtml(lead.pdfOriginalName || "—")}</p>
        <p><strong>Размер:</strong> ${
          lead.pdfSizeBytes ? `${Math.round(lead.pdfSizeBytes / 1024)} KB` : "—"
        }</p>
        <p><strong>Статус файла:</strong> ${
          lead.pdfStoragePath
            ? "доступен"
            : lead.filePurgedAt
              ? `очищен ${formatDate(lead.filePurgedAt)}`
              : "не прикреплён"
        }</p>
        ${
          lead.pdfStoragePath
            ? `<a class="button secondary" href="/admin/leads/${lead.id}/file">Скачать PDF</a>`
            : ""
        }
      </div>
      <div>
        <h3>Обработка</h3>
        <div id="save-feedback" class="alert" style="display:none;"></div>
        <form id="lead-update-form" class="grid">
          <input type="hidden" name="_csrf" value="${csrfToken}" />
          <label>
            <div style="margin-bottom:8px;">Статус</div>
            <select name="status">
              <option value="new" ${lead.status === "new" ? "selected" : ""}>new</option>
              <option value="in_progress" ${lead.status === "in_progress" ? "selected" : ""}>in_progress</option>
              <option value="closed" ${lead.status === "closed" ? "selected" : ""}>closed</option>
            </select>
          </label>
          <label>
            <div style="margin-bottom:8px;">Заметки</div>
            <textarea name="adminNotes">${escapeHtml(lead.adminNotes || "")}</textarea>
          </label>
          <button type="submit">Сохранить изменения</button>
        </form>
      </div>
    </div>
    <script>
      const form = document.getElementById("lead-update-form");
      const feedback = document.getElementById("save-feedback");

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
          status: form.status.value,
          adminNotes: form.adminNotes.value
        };

        const response = await fetch("/admin/leads/${lead.id}", {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-csrf-token": form._csrf.value
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        feedback.style.display = "block";
        feedback.textContent = response.ok ? "Изменения сохранены." : result.error || "Не удалось сохранить изменения.";
      });
    </script>
  `;

  return renderLayout({
    title: `Заявка ${escapeHtml(lead.name)}`,
    body,
    toolbar
  });
}

module.exports = {
  renderLeadPage
};
