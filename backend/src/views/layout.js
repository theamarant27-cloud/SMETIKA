function renderLayout({ title, body, toolbar = "" }) {
  return `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        <style>
          :root {
            --bg: #f4f6fb;
            --card: #ffffff;
            --text: #182030;
            --muted: #69707d;
            --accent: #cf4d40;
            --accent-soft: #ffe8e4;
            --border: #d9dfeb;
            --success: #1e7b5b;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: radial-gradient(circle at top left, #eff4ff, transparent 30%), var(--bg);
            color: var(--text);
            font-family: Inter, Arial, sans-serif;
          }
          .shell {
            width: min(1120px, calc(100vw - 32px));
            margin: 24px auto 48px;
          }
          .toolbar {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
            margin-bottom: 20px;
          }
          .card {
            background: var(--card);
            border-radius: 24px;
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
            border: 1px solid var(--border);
            padding: 24px;
          }
          h1, h2, h3, p {
            margin-top: 0;
          }
          a { color: var(--accent); text-decoration: none; }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 14px 12px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
          }
          th { color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: .04em; }
          input, textarea, select, button {
            font: inherit;
          }
          input, textarea, select {
            width: 100%;
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 12px 14px;
            background: #fff;
            color: var(--text);
          }
          textarea { min-height: 140px; resize: vertical; }
          button, .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 14px;
            padding: 12px 18px;
            background: var(--accent);
            color: #fff;
            cursor: pointer;
            font-weight: 700;
          }
          .button.secondary {
            background: #eef2fb;
            color: var(--text);
          }
          .grid {
            display: grid;
            gap: 16px;
          }
          .grid.cols-2 {
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          }
          .filters {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin: 20px 0 28px;
          }
          .status {
            display: inline-flex;
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 13px;
            font-weight: 700;
            background: #eef2fb;
          }
          .status.new { background: #e9f0ff; color: #355ec9; }
          .status.in_progress { background: #fff3d8; color: #9b6b00; }
          .status.closed { background: #daf3e8; color: var(--success); }
          .muted { color: var(--muted); }
          .alert {
            border-radius: 14px;
            padding: 12px 14px;
            margin-bottom: 16px;
            background: var(--accent-soft);
            color: #91392f;
          }
          .pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 18px;
            gap: 12px;
          }
          @media (max-width: 720px) {
            .toolbar {
              flex-direction: column;
              align-items: stretch;
            }
            th:nth-child(4), td:nth-child(4),
            th:nth-child(5), td:nth-child(5) {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="shell">
          ${toolbar ? `<div class="toolbar">${toolbar}</div>` : ""}
          <div class="card">${body}</div>
        </div>
      </body>
    </html>
  `;
}

module.exports = {
  renderLayout
};
