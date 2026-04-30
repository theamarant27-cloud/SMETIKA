const { renderLayout } = require("./layout");
const { escapeHtml, formatDate } = require("../utils/html");

function renderLeadsPage({ leads, filters, pagination, csrfToken }) {
  const rows = leads
    .map(
      (lead) => `
        <tr>
          <td><a href="/admin/leads/${lead.id}">${escapeHtml(lead.name)}</a></td>
          <td>${escapeHtml(lead.contact)}</td>
          <td>${escapeHtml(lead.company || "—")}</td>
          <td><span class="status ${lead.status}">${escapeHtml(lead.status)}</span></td>
          <td>${lead.pdfOriginalName ? escapeHtml(lead.pdfOriginalName) : "—"}</td>
          <td>${formatDate(lead.createdAt)}</td>
        </tr>
      `
    )
    .join("");

  const previousPage = pagination.page > 1 ? pagination.page - 1 : null;
  const nextPage =
    pagination.page * pagination.pageSize < pagination.total ? pagination.page + 1 : null;

  const toolbar = `
    <div>
      <h2 style="margin-bottom:4px;">Заявки Smetika</h2>
      <div class="muted">Всего: ${pagination.total}</div>
    </div>
    <form method="post" action="/admin/logout">
      <input type="hidden" name="_csrf" value="${csrfToken}" />
      <button type="submit" class="button secondary">Выйти</button>
    </form>
  `;

  const body = `
    <form method="get" action="/admin/leads" class="filters">
      <label>
        <div style="margin-bottom:8px;">Статус</div>
        <select name="status">
          <option value="">Все</option>
          <option value="new" ${filters.status === "new" ? "selected" : ""}>new</option>
          <option value="in_progress" ${filters.status === "in_progress" ? "selected" : ""}>in_progress</option>
          <option value="closed" ${filters.status === "closed" ? "selected" : ""}>closed</option>
        </select>
      </label>
      <label>
        <div style="margin-bottom:8px;">Дата от</div>
        <input type="date" name="date_from" value="${escapeHtml(filters.dateFrom || "")}" />
      </label>
      <label>
        <div style="margin-bottom:8px;">Дата до</div>
        <input type="date" name="date_to" value="${escapeHtml(filters.dateTo || "")}" />
      </label>
      <label style="align-self:end;">
        <button type="submit">Применить фильтры</button>
      </label>
    </form>
    <table>
      <thead>
        <tr>
          <th>Имя</th>
          <th>Контакт</th>
          <th>Компания</th>
          <th>Статус</th>
          <th>PDF</th>
          <th>Создана</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="6">Пока заявок нет.</td></tr>'}
      </tbody>
    </table>
    <div class="pagination">
      <div class="muted">Страница ${pagination.page}</div>
      <div style="display:flex;gap:8px;">
        ${
          previousPage
            ? `<a class="button secondary" href="/admin/leads?status=${encodeURIComponent(
                filters.status || ""
              )}&date_from=${encodeURIComponent(filters.dateFrom || "")}&date_to=${encodeURIComponent(
                filters.dateTo || ""
              )}&page=${previousPage}">Назад</a>`
            : ""
        }
        ${
          nextPage
            ? `<a class="button secondary" href="/admin/leads?status=${encodeURIComponent(
                filters.status || ""
              )}&date_from=${encodeURIComponent(filters.dateFrom || "")}&date_to=${encodeURIComponent(
                filters.dateTo || ""
              )}&page=${nextPage}">Вперёд</a>`
            : ""
        }
      </div>
    </div>
  `;

  return renderLayout({
    title: "Заявки Smetika",
    body,
    toolbar
  });
}

module.exports = {
  renderLeadsPage
};
