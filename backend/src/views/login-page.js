const { renderLayout } = require("./layout");

function renderLoginPage({ csrfToken, errorMessage = "" }) {
  const body = `
    <div style="max-width:420px;margin:24px auto;">
      <h1>Вход в админку</h1>
      <p class="muted">Только для внутренней обработки заявок Smetika.</p>
      ${errorMessage ? `<div class="alert">${errorMessage}</div>` : ""}
      <form method="post" action="/admin/login" class="grid">
        <input type="hidden" name="_csrf" value="${csrfToken}" />
        <label>
          <div style="margin-bottom:8px;">Логин</div>
          <input type="text" name="username" autocomplete="username" required />
        </label>
        <label>
          <div style="margin-bottom:8px;">Пароль</div>
          <input type="password" name="password" autocomplete="current-password" required />
        </label>
        <button type="submit">Войти</button>
      </form>
    </div>
  `;

  return renderLayout({
    title: "Вход в админку Smetika",
    body
  });
}

module.exports = {
  renderLoginPage
};
