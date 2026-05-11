# Wiki Log

Append-only хронологический лог. Формат: `## [YYYY-MM-DD] тип | описание`

Фильтр последних записей: `grep "^## \[" wiki/log.md | tail -10`

---

## [2026-05-11] ingest | Инициализация вики по паттерну Karpathy

Создана начальная структура вики на основе Karpathy LLM Wiki pattern.

**Созданные страницы:**
- `overview.md` — общая архитектура проекта
- `entities/landing-page.md` — index.html, форма, JS-логика
- `entities/n8n-workflows.md` — два workflow в n8n Cloud
- `entities/vps-backend.md` — Express backend, nginx, сервисы
- `entities/integrations.md` — Telegram, email, n8n MCP
- `concepts/lead-flow.md` — полный путь заявки
- `concepts/pdf-flow.md` — отдельный путь PDF
- `index.md` — каталог
- `log.md` — этот файл
- `SCHEMA.md` — схема и конвенции

**Охват:** вся работа по интеграции n8n, выполненная в сессии 2026-05-09/11:
- Форма лендинга → n8n webhook
- Telegram + email уведомления
- Раздельная отправка заявки и PDF
- Валидация телефона
- n8n MCP подключение

---

## [2026-05-11] ingest | Иконки в футере

Добавлены иконки в футер (`index.html`):
- Material Symbol `mail` перед `daniil@smetika.pro`
- SVG Telegram logo перед `@DAmarketolog`
- Заменён внешний аватар (Google CDN) на inline SVG Telegram в секции "Или напишите нам"

Обновлена страница: `entities/landing-page.md`
