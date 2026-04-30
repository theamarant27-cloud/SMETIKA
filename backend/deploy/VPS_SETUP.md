# VPS setup

Target domain: `smetika.pro`

## 1. PostgreSQL

The backend expects a local Postgres database:

```bash
sudo -u postgres psql
CREATE USER smetika_landing WITH PASSWORD 'KnNB_sFMvXi3rJQ4nck1ksYV';
CREATE DATABASE smetika_landing OWNER smetika_landing;
\q
```

## 2. systemd install

```bash
sudo cp /root/projects/ADV_CAMPAGN/landing_page/backend/deploy/smetika-landing-backend.service /etc/systemd/system/smetika-landing-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now smetika-landing-backend
sudo systemctl status smetika-landing-backend --no-pager
```

## 3. Logs

```bash
journalctl -u smetika-landing-backend -f
```

## 4. Static landing files

`nginx` should serve the landing from `/var/www/smetika.pro`, not from `/root/...`.

```bash
sudo mkdir -p /var/www/smetika.pro
sudo cp /root/projects/ADV_CAMPAGN/landing_page/code.html /var/www/smetika.pro/code.html
sudo chown -R www-data:www-data /var/www/smetika.pro
```

## 5. nginx

Stage 1: plain HTTP config for initial launch and Let's Encrypt validation.

```bash
sudo mkdir -p /var/www/certbot
sudo cp /root/projects/ADV_CAMPAGN/landing_page/backend/deploy/nginx/smetika.pro.http.conf /etc/nginx/sites-available/smetika.pro.conf
sudo ln -sf /etc/nginx/sites-available/smetika.pro.conf /etc/nginx/sites-enabled/smetika.pro.conf
sudo nginx -t
sudo systemctl reload nginx
```

Issue the certificate:

```bash
sudo certbot --nginx -d smetika.pro -d www.smetika.pro
```

Stage 2: switch to the SSL config after the certificate exists.

```bash
sudo cp /root/projects/ADV_CAMPAGN/landing_page/backend/deploy/nginx/smetika.pro.ssl.conf /etc/nginx/sites-available/smetika.pro.conf
sudo nginx -t
sudo systemctl reload nginx
```
