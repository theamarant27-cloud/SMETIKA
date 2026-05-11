---
title: Интеграции
category: entity
updated: 2026-05-11
sources: [n8n Cloud credentials, backend/.env]
---

# Интеграции

---

## Telegram

### Бот и чат

| Параметр | Значение |
|---------|---------|
| Username | @DAmarketolog |
| Chat ID | `5761230330` |
| n8n credential | "Telegram account" (`SBz56Vsr8fg4VBlv`) |

### Что получает бот

1. **Текстовое уведомление** (Workflow: Landing Page Leads)
   ```
   🔔 Новая заявка с лендинга Smetika
   👤 Имя: ...
   📞 Контакт: ...
   🏢 Компания: ...
   📎 PDF: имя_файла.pdf (или 'нет')
   🕐 дата время
   ```

2. **PDF документ** (Workflow: PDF Upload, только если файл прикреплён)
   ```
   Подпись: 📎 PDF от Имя (телефон)
   ```

---

## Email (purelymail)

### Настройки SMTP

| Параметр | Значение |
|---------|---------|
| Host | `smtp.purelymail.com` |
| Port | `465` (SSL) |
| User | `daniil@smetika.pro` |
| From | `leads@smetika.pro` |
| To | `daniil@smetika.pro` |

### Статус в n8n

Нода **"Email: Уведомление"** в Workflow "Landing Page Leads" — **DISABLED**.  
Причина: была создана без credentials; пользователь их добавил и включил ноду вручную.

> ⚠️ Проверить: активна ли нода после добавления credentials?

### Содержимое письма

HTML-таблица с полями: Имя, Телефон, Компания, PDF (имя файла).  
Тема: `Новая заявка: {name} — {contact}`

---

## n8n MCP

Локальный MCP-сервер для управления n8n из Claude Code.

| Параметр | Значение |
|---------|---------|
| Пакет | `/root/.claude/mcp-servers/n8n-mcp/` (v2.36.1) |
| Конфиг | `/root/.mcp.json` (ключ `n8n-mcp`) |
| Протокол | stdio |
| N8N_API_URL | `https://aimarketer3.app.n8n.cloud` |
| API ключ | Бессрочный `public-api` JWT (выдан 2026-05-09) |

Доступные инструменты: `n8n_create_workflow`, `n8n_update_partial_workflow`, `n8n_get_workflow`, `n8n_list_workflows`, `n8n_executions`, `search_nodes`, `get_node` и др.

---

## Связанные страницы

- [[entities/n8n-workflows]] — воркфлоу, использующие эти интеграции
- [[overview]] — общая архитектура
