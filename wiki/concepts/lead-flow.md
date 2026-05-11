---
title: Путь заявки (Lead Flow)
category: concept
updated: 2026-05-11
sources: [index.html, n8n workflows GWG1ClTX3Dprtxxk]
---

# Путь заявки (Lead Flow)

Полный жизненный цикл заявки — от нажатия кнопки до получения уведомления.

---

## Диаграмма

```
Пользователь нажимает "Получить мой бесплатный расчёт"
        │
        ▼
[Валидация телефона (JS)]
  ✗ → показать ошибку под полем, не отправлять
  ✓ → продолжить
        │
        ▼
[FormData: name, contact, company, website, pdf_name?]
FormData.delete("pdf")  ← PDF удаляется из основного запроса
        │
        ▼
POST https://aimarketer3.app.n8n.cloud/webhook/landing-form
        │
        ├─ HTTP 500 → "Не удалось отправить заявку."
        │
        └─ HTTP 200 → form.reset(), кнопка разблокирована
                │
                ▼
        [n8n: Webhook нода]
                │
                ▼
        [n8n: IF Антиспам]
          body.website == ""?
          ✗ → тихо завершить (спам)
          ✓ → продолжить
                │
                ▼
        [n8n: Set — форматировать telegramText]
                │
                ▼
        [n8n: Telegram — sendMessage]
          → уведомление в чат 5761230330
                │
                ▼
        [n8n: Email — emailSend] (если включена)
          → письмо на daniil@smetika.pro
```

---

## Honeypot (антиспам)

Поле `<input name="website" class="hidden">` — скрытое от пользователей. Боты заполняют его; n8n проверяет в IF-ноде. Если `website != ""` — запрос тихо игнорируется.

---

## Поля в n8n из `$json.body`

| Поле | Обязательное | Описание |
|------|-------------|---------|
| `name` | да | Имя пользователя |
| `contact` | да | Номер телефона |
| `company` | нет | Название компании |
| `website` | нет | Honeypot (должно быть пустым) |
| `pdf_name` | нет | Имя прикреплённого файла |

---

## История архитектурного решения

До: форма → Express `/api/leads` → PostgreSQL → Telegram  
После: форма → n8n webhook → Telegram + Email

Причина перехода: упростить инфраструктуру, убрать необходимость в работающем Express-бэкенде для базового сбора лидов.

---

## Связанные страницы

- [[concepts/pdf-flow]] — отдельный путь PDF файла
- [[entities/landing-page]] — JS-логика отправки
- [[entities/n8n-workflows]] — воркфлоу на стороне n8n
