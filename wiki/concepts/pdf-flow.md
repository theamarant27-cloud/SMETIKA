---
title: Путь PDF файла (PDF Flow)
category: concept
updated: 2026-05-11
sources: [index.html, n8n workflow lDDhi4nob5g1EOrX]
---

# Путь PDF файла (PDF Flow)

PDF отправляется **отдельно** от текстовых данных заявки. Это намеренное архитектурное решение: если файл не загрузился, заявка всё равно принята.

---

## Диаграмма

```
После успешной отправки заявки (Шаг 1):
        │
        ▼
hasPdf? (pdfFile && pdfFile.size > 0)
  ✗ → конец, показать "Заявка отправлена."
  ✓ → продолжить
        │
        ▼
setStatus("Заявка принята! Загружаем файл...")
        │
        ▼
FormData: { name, contact, pdf (binary) }

POST https://aimarketer3.app.n8n.cloud/webhook/landing-form-pdf
        │
        ├─ Ошибка → "Заявка отправлена. Файл не загрузился — пришлите в Telegram."
        │
        └─ HTTP 200 → "Заявка и файл успешно отправлены."
                │
                ▼
        [n8n: Webhook /landing-form-pdf]
                │
                ▼
        [n8n: IF — Есть PDF?]
          Object.keys($binary ?? {}).length > 0
          ✗ → завершить
          ✓ → продолжить
                │
                ▼
        [n8n: Telegram — sendDocument]
          chatId: 5761230330
          caption: "📎 PDF от {name} ({contact})"
          binaryPropertyName: "pdf"
```

---

## Ключевая деталь реализации

```js
// Захватываем File-объект ДО form.reset()
const pdfFile = fileInput?.files?.[0] ?? null;

// ...после form.reset() pdfFile всё ещё валиден
// File-объект в JS остаётся в памяти независимо от reset()
```

---

## Ограничения Telegram

| Параметр | Лимит |
|---------|------|
| Отправка документа через Bot API | 50 МБ |
| Скачивание через Bot API (getFile) | 20 МБ |
| Скачивание из приложения Telegram | до 50 МБ |

Форма ограничивает загрузку на 45 МБ (указано в label: "Прикрепить PDF (макс. 45 МБ)").

---

## Хранение файлов

Файлы **не хранятся** в текущей реализации постоянно:
- Telegram хранит их на своих серверах (доступны в чате)
- VPS `storage/uploads/` — не используется в текущем flow

---

## Связанные страницы

- [[concepts/lead-flow]] — Шаг 1 (заявка), после которого запускается PDF flow
- [[entities/n8n-workflows]] — Workflow "PDF Upload" (lDDhi4nob5g1EOrX)
- [[entities/vps-backend]] — альтернативное хранилище PDF (не активно)
