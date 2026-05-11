---
title: n8n Workflows
category: entity
updated: 2026-05-11
sources: [n8n Cloud aimarketer3.app.n8n.cloud]
---

# n8n Workflows

Инстанс: `https://aimarketer3.app.n8n.cloud`  
MCP подключён через `/root/.mcp.json` (stdio, локальный пакет `/root/.claude/mcp-servers/n8n-mcp`)

---

## Workflow 1: Landing Page Leads

**ID:** `GWG1ClTX3Dprtxxk`  
**Статус:** Active  
**Webhook:** `POST https://aimarketer3.app.n8n.cloud/webhook/landing-form`

### Граф нод

```
[Webhook]
    ↓
[IF: Антиспам]          ← проверяет body.website == "" (honeypot)
    ↓ (true)
[Set: Форматировать данные]   ← строит telegramText
    ↓
[Telegram: Уведомление]       ← sendMessage, chatId: 5761230330
    ↓
[Email: Уведомление]          ← emailSend, DISABLED (нужна SMTP конфигурация)
```

### Нода Set — поля telegramText

```
🔔 Новая заявка с лендинга Smetika

👤 Имя: {{ body.name }}
📞 Контакт: {{ body.contact }}
🏢 Компания: {{ body.company }}
📎 PDF: {{ body.pdf_name ?? 'нет' }}

🕐 {{ now }}
```

### Нода Email: Уведомление

- **ID:** `node-email`
- **Статус:** DISABLED — нужно добавить SMTP credential (purelymail) и включить
- **To:** `daniil@smetika.pro`
- **From:** `leads@smetika.pro`
- Показывает `pdf_name` в HTML-таблице

### Telegram credential

- **ID:** `SBz56Vsr8fg4VBlv`
- **Имя:** "Telegram account"
- **Chat ID:** `5761230330`

---

## Workflow 2: PDF Upload

**ID:** `lDDhi4nob5g1EOrX`  
**Статус:** Active  
**Webhook:** `POST https://aimarketer3.app.n8n.cloud/webhook/landing-form-pdf`

### Граф нод

```
[Webhook]
    ↓
[IF: Есть PDF?]         ← Object.keys($binary ?? {}).length > 0
    ↓ (true)
[Telegram: Файл]        ← sendDocument, тот же chatId: 5761230330
                           caption: "📎 PDF от {{ body.name }} ({{ body.contact }})"
```

### Поля входящего запроса

| Поле | Тип | Откуда |
|------|-----|--------|
| `name` | text | из формы |
| `contact` | text | из формы |
| `pdf` | binary | файл пользователя |

---

## n8n MCP

Конфиг в `/root/.mcp.json`:
```json
{
  "n8n-mcp": {
    "command": "node",
    "args": ["/root/.claude/mcp-servers/n8n-mcp/dist/mcp/index.js"],
    "env": {
      "N8N_API_URL": "https://aimarketer3.app.n8n.cloud",
      "N8N_API_KEY": "eyJ...бессрочный public-api ключ..."
    }
  }
}
```

> ⚠️ Предыдущий API ключ истёк 2026-04-08. Текущий — бессрочный, выдан 2026-05-09.

---

## Связанные страницы

- [[concepts/lead-flow]] — полный путь заявки через эти воркфлоу
- [[concepts/pdf-flow]] — путь PDF
- [[entities/integrations]] — Telegram и email credentials
</content>
