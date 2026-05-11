---
title: Лендинг (index.html)
category: entity
updated: 2026-05-11
sources: [index.html]
---

# Лендинг — index.html

Единственный HTML-файл ~50 КБ. Нет сборки — правится напрямую, деплоится GitHub Actions на GitHub Pages.

---

## Технологии

- **Tailwind CDN** — `https://cdn.tailwindcss.com` (без сборки)
- **Material Symbols** — Google Fonts (иконки)
- **Vanilla JS** — inline `<script>` в конце файла

---

## Форма заявки

```html
<form data-lead-form="">
  <input name="name"    required>          <!-- Имя -->
  <input name="contact" data-contact-input required>  <!-- Телефон -->
  <input name="company">                   <!-- Компания (опц.) -->
  <input name="website" class="hidden">    <!-- Honeypot (антиспам) -->
  <input name="pdf"     type="file" accept=".pdf">    <!-- PDF (опц.) -->
</form>
```

### Валидация телефона

```js
/^\d{10,15}$/.test(value.replace(/[\s\-\(\)\+]/g, ""))
```

Принимает любой формат с 10–15 цифрами. Срабатывает на `blur` и блокирует submit при невалидном значении.

---

## Логика отправки (двухшаговая)

```
Шаг 1: POST WEBHOOK_URL
  FormData: name, contact, company, website, pdf_name (если PDF выбран)
  PDF поле УДАЛЕНО из FormData

Шаг 2 (только если PDF выбран):
  POST PDF_WEBHOOK_URL
  FormData: name, contact, pdf (бинарный файл)
```

**Важно:** `pdfFile` захватывается до `form.reset()` — File-объект остаётся валидным.

### Константы (строки ~595–597)

```js
const WEBHOOK_URL     = "https://aimarketer3.app.n8n.cloud/webhook/landing-form";
const PDF_WEBHOOK_URL = "https://aimarketer3.app.n8n.cloud/webhook/landing-form-pdf";
```

### Статусы UI

| Состояние | Сообщение |
|-----------|----------|
| Шаг 1 идёт | "Отправляем заявку..." |
| Шаг 1 ок, нет PDF | "Заявка отправлена. Мы свяжемся..." |
| Шаг 1 ок, PDF загружается | "Заявка принята! Загружаем файл..." |
| Шаг 2 ок | "Заявка и файл успешно отправлены. Мы свяжемся с вами!" |
| Шаг 2 ошибка | "Заявка отправлена. Файл не загрузился — пришлите в Telegram." |
| Шаг 1 ошибка | "Не удалось отправить заявку." |

---

## Футер — контакты

Строки ~572–575:
- `daniil@smetika.pro` — Material Symbol `mail` (18px) + flex
- `@DAmarketolog` — inline SVG Telegram logo (22px) + flex

---

## Деплой

GitHub Actions (`.github/workflows/deploy-pages.yml`):
- Триггер: push в `main`
- Деплоит весь корень репо (`path: '.'`) на GitHub Pages
- CNAME: `smetika.pro`

---

## Известные quirks

- n8n возвращает 500 при получении пустого `pdf` поля → решение: `formData.delete("pdf")` перед отправкой
- `window.SMETIKA_API_BASE_URL` — устаревший механизм старого Express-бэкенда, больше не используется

---

## Связанные страницы

- [[concepts/lead-flow]] — полный путь заявки
- [[concepts/pdf-flow]] — поток PDF
- [[entities/n8n-workflows]] — куда уходят данные
