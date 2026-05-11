---
title: Обзор проекта SMETIKA
category: overview
updated: 2026-05-11
sources: [index.html, backend/, .github/workflows/, wiki/SCHEMA.md]
---

# SMETIKA — Обзор проекта

Автоматический расчёт материалов для подвесных потолков Armstrong. Лендинг генерирует лиды; заявки поступают через n8n в Telegram и на email владельца.

---

## Архитектура

```
Пользователь (smetika.pro)
        │
        ▼
[GitHub Pages]          ← статичный index.html (Tailwind CDN)
        │
        │ POST /webhook/landing-form        (текст + pdf_name)
        ▼
[n8n Cloud]             ← aimarketer3.app.n8n.cloud
  ├─ Workflow: Landing Page Leads (GWG1ClTX3Dprtxxk)
  │     → Telegram: уведомление о заявке
  │     → Email: daniil@smetika.pro (SMTP purelymail)
  └─ Workflow: PDF Upload (lDDhi4nob5g1EOrX)
        → Telegram: документ PDF

        │ (nginx proxy /api/* → :3000)
        ▼
[VPS Express Backend]   ← порт 3000, systemd: smetika-landing-backend
  └─ storage/uploads/   ← PDF файлы (не используется в текущем flow)
```

---

## Слои системы

| Слой | Технология | Назначение |
|------|-----------|-----------|
| Фронтенд | HTML + Tailwind CDN | Лендинг, форма заявки |
| Хостинг | GitHub Pages + CNAME smetika.pro | Статичный сайт |
| Автоматизация | n8n Cloud | Обработка заявок, уведомления |
| Уведомления | Telegram Bot | Мгновенные уведомления |
| Email | purelymail SMTP | Дублирование уведомлений |
| VPS | Ubuntu + nginx + Node.js | Backend API, хранилище PDF |
| CI/CD | GitHub Actions | Авто-деплой при push в main |

---

## Ключевые URL и идентификаторы

| Ресурс | Значение |
|--------|---------|
| Сайт | https://smetika.pro |
| GitHub repo | https://github.com/theamarant27-cloud/SMETIKA |
| n8n Cloud | https://aimarketer3.app.n8n.cloud |
| Webhook (заявка) | https://aimarketer3.app.n8n.cloud/webhook/landing-form |
| Webhook (PDF) | https://aimarketer3.app.n8n.cloud/webhook/landing-form-pdf |
| VPS IP | 185.161.70.46 |
| Email | daniil@smetika.pro |

---

## Связанные страницы

- [[entities/landing-page]] — структура и логика index.html
- [[entities/n8n-workflows]] — детали воркфлоу
- [[entities/vps-backend]] — Express сервис и nginx
- [[entities/integrations]] — Telegram, email, MCP
- [[concepts/lead-flow]] — полный путь заявки
- [[concepts/pdf-flow]] — отдельный поток загрузки PDF
