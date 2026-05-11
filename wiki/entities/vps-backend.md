---
title: VPS Backend
category: entity
updated: 2026-05-11
sources: [backend/src/, backend/.env, /etc/nginx/sites-enabled/]
---

# VPS Backend

IP: `185.161.70.46`  
Домен: `smetika.pro` (DNS → GitHub Pages, но nginx на VPS обслуживает API)

---

## Запущенные сервисы

| Сервис | Порт | Описание |
|--------|------|---------|
| `smetika-landing-backend` | 3000 | Express.js API для лидов |
| `smetika-api` | 8100 | Основное приложение (app.smetika.pro) |
| `smetika-bot` | — | Telegram Bot |
| `nginx` | 80/443 | Reverse proxy |

---

## Express Landing Backend

**Путь:** `/root/projects/SMETIKA/SMETIKA-repo/backend/`  
**Точка входа:** `src/server.js`  
**Запуск:** `systemd: smetika-landing-backend.service`

### Ключевые зависимости

- `express` — веб-фреймворк
- `multer` — загрузка PDF (max 45 МБ)
- `argon2` — хэширование пароля админа
- `pg` — PostgreSQL клиент
- `express-rate-limit` — 10 заявок / 15 мин

### Роуты

| Метод | Путь | Описание |
|-------|------|---------|
| `POST` | `/api/leads` | Приём заявки + PDF → БД + Telegram |
| `GET` | `/admin/leads` | Список лидов (требует авторизации) |
| `GET` | `/health` | `{"status":"ok"}` |

### Хранилище

```
backend/storage/
  tmp/       ← временные файлы при загрузке
  uploads/   ← сохранённые PDF (ротация через 30 дней)
```

### .env (ключевые переменные)

```
PORT=3000
APP_BASE_URL=https://smetika.pro
DATABASE_URL=postgresql://smetika_landing:...@localhost:5432/smetika_landing
STORAGE_ROOT=storage
MAX_PDF_SIZE_MB=45
LEAD_RETENTION_DAYS=30
```

---

## nginx конфигурация

**Файл:** `/etc/nginx/sites-enabled/smetika.pro`

```nginx
server_name smetika.pro www.smetika.pro;

location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;  # → Express backend
}

# Остальное → статика / GitHub Pages redirect
```

**Файл:** `/etc/nginx/sites-enabled/app.smetika.pro`

```nginx
server_name app.smetika.pro;
location / {
    proxy_pass http://127.0.0.1:8100;       # → основное приложение
}
```

---

## Текущее состояние

> ⚠️ Express backend (`POST /api/leads`) больше **не используется** лендингом — форма отправляет данные напрямую в n8n. Сервис запущен, но заявки через него не поступают.

Возможное будущее использование: хранение PDF файлов, полученных от n8n через `/api/save-pdf` endpoint.

---

## Связанные страницы

- [[entities/n8n-workflows]] — текущий путь заявок
- [[concepts/lead-flow]] — архитектурное решение о переходе на n8n
