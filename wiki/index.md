# Wiki Index — SMETIKA

Каталог всех страниц. LLM обновляет этот файл при каждом ingest.

---

## Overview

| Страница | Описание |
|----------|---------|
| [overview](overview.md) | Архитектура проекта, ключевые URL, стек технологий |

---

## Entities (компоненты)

| Страница | Описание |
|----------|---------|
| [entities/landing-page](entities/landing-page.md) | index.html: форма, JS-логика, деплой, валидация |
| [entities/n8n-workflows](entities/n8n-workflows.md) | Два workflow: Landing Page Leads + PDF Upload |
| [entities/vps-backend](entities/vps-backend.md) | Express API, nginx, systemd-сервисы, PostgreSQL |
| [entities/integrations](entities/integrations.md) | Telegram, email (purelymail), n8n MCP |

---

## Concepts (процессы)

| Страница | Описание |
|----------|---------|
| [concepts/lead-flow](concepts/lead-flow.md) | Полный путь заявки от кнопки до Telegram |
| [concepts/pdf-flow](concepts/pdf-flow.md) | Отдельный поток загрузки PDF с fallback |

---

## Meta

| Файл | Описание |
|------|---------|
| [SCHEMA.md](SCHEMA.md) | Конвенции, операции, структура вики |
| [log.md](log.md) | Хронологический лог изменений |
