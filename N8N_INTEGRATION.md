# Интеграция лендинга с n8n Cloud

## Workflow

- **ID:** `GWG1ClTX3Dprtxxk`
- **Ссылка:** https://aimarketer3.app.n8n.cloud/workflow/GWG1ClTX3Dprtxxk
- **Статус:** создан через MCP, требует активации

## Webhook URL

```
Production: https://aimarketer3.app.n8n.cloud/webhook/landing-form
Test:       https://aimarketer3.app.n8n.cloud/webhook-test/landing-form
```

Этот URL уже прописан в `index.html` (строка 592).

---

## Шаг 1: Открыть Workflow

Перейдите по ссылке: https://aimarketer3.app.n8n.cloud/workflow/GWG1ClTX3Dprtxxk

(Файл `n8n-workflow.json` в репозитории — резервная копия для ручного импорта, если понадобится.)

---

## Шаг 2: Добавить Telegram credentials

Две ноды требуют учётных данных Telegram: **"Telegram: уведомление"** и **"Telegram: отправить PDF"**.

### 2a. Создать Telegram Bot

1. Откройте Telegram → найдите **@BotFather**
2. Отправьте `/newbot` → придумайте имя и username бота
3. BotFather вернёт **Bot Token** вида `1234567890:AAFxxxxxxxxxxxxxxxxxxxxxx`

### 2b. Узнать ваш Telegram Chat ID

1. Найдите бота **@userinfobot** в Telegram
2. Отправьте ему любое сообщение → он ответит вашим Chat ID (число, например `123456789`)
3. Если нужно получать уведомления в группу/канал — добавьте бота туда и узнайте ID группы через **@getidsbot**

### 2c. Добавить credential в n8n

1. В n8n: **Settings → Credentials → New Credential → Telegram Bot**
2. Назовите credential **"Telegram Bot"** (именно так — это имя уже указано в нодах)
3. Заполните:
   - **Access Token**: ваш Bot Token от BotFather
4. Нажмите **Save**

### 2d. Добавить Chat ID в ноду

Откройте ноду **"Telegram: уведомление"** → в поле **Chat ID** введите ваш Chat ID.

Повторите для ноды **"Telegram: отправить PDF"** (поле Chat ID).

---

## Шаг 3: Активировать Workflow

1. В правом верхнем углу Workflow переключите тумблер **Inactive → Active**
2. Workflow станет активным — webhook начнёт принимать запросы

---

## Шаг 4: Проверка

1. Откройте лендинг → заполните форму → нажмите **"Получить мой бесплатный расчёт"**
2. Проверьте вкладку **Executions** в n8n — должен появиться успешный запуск
3. В Telegram должно прийти уведомление:

```
🔔 Новая заявка с лендинга Smetika

👤 Имя: Иван Иванов
📞 Контакт: +7 999 123-45-67
🏢 Компания: ООО Ромашка
📎 PDF: нет

🕐 09.05.2026 14:30
```

Если прикреплён PDF — придёт второе сообщение с файлом.

---

## Структура Workflow

```
[Webhook POST /landing-form]
        ↓
[IF: поле website пустое?]  ← антиспам (honeypot)
   Да ↓          Нет → (стоп, тихо игнорируем)
[Set: форматируем данные]
        ↓
[Telegram: Send Message]  ← нужен credential "Telegram Bot"
        ↓
[IF: прикреплён PDF?]
   Да ↓          Нет → (конец)
[Telegram: Send Document] ← нужен credential "Telegram Bot"
```

---

## Файлы проекта

| Файл | Назначение |
|------|-----------|
| `n8n-workflow.json` | Workflow для импорта в n8n |
| `index.html` строка 592 | Webhook URL (заменить после активации) |
| `/root/.claude/settings.json` | Конфигурация n8n MCP для Claude Code |

---

## n8n MCP для Claude Code

Конфигурация MCP-сервера записана в `/root/.claude/settings.json`.
После **перезапуска Claude Code** инструменты n8n станут доступны напрямую —
можно будет создавать, редактировать и активировать Workflow через AI без браузера.
