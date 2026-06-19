# Deployment Guide — Beauty World

This guide covers deploying Beauty World to a production Linux server using Docker Compose, with Nginx as a reverse proxy and Let's Encrypt for SSL.

---

## Prerequisites

- A Linux server (Ubuntu 22.04 LTS recommended) with at least 2 GB RAM
- A registered domain name with DNS A records pointing to your server IP
- Docker Engine 24+ and Docker Compose v2 installed
- A Gmail account (or other SMTP provider) for transactional email

---

## 1. Server Preparation

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

---

## 2. Clone the Repository

```bash
git clone <repo-url> /opt/beauty-world
cd /opt/beauty-world
```

---

## 3. Production Environment Variables

Create a `.env` file at the project root. Never commit this file to version control.

```bash
cp .env.example .env
nano .env
```

Minimum required values for production:

```dotenv
# ── Database ──────────────────────────────────────────────────────────────────
POSTGRES_DB=beauty_world
POSTGRES_USER=beauty_admin
# Use a strong, randomly generated password (e.g. openssl rand -base64 32)
POSTGRES_PASSWORD=CHANGE_ME_STRONG_DB_PASSWORD

# ── JWT ───────────────────────────────────────────────────────────────────────
# Must be a long random string — never reuse the example value
# Generate: openssl rand -base64 64
JWT_SECRET=CHANGE_ME_LONG_RANDOM_JWT_SECRET

# ── Email (Gmail App Password) ────────────────────────────────────────────────
# Create an App Password at https://myaccount.google.com/apppasswords
EMAIL_USER=your-business-email@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password

# ── Frontend ──────────────────────────────────────────────────────────────────
# Set this to your public domain after Nginx is configured
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

Update `CORS_ORIGIN` inside `docker-compose.yml` (or override it in `.env`) to match your production domain:

```yaml
CORS_ORIGIN: https://yourdomain.com
```

---

## 4. Production Docker Compose

The root `docker-compose.yml` is suitable for production with the environment variables above. For an explicit production override, create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      NODE_ENV: production
      CORS_ORIGIN: https://yourdomain.com
    restart: always

  frontend:
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com/api
    restart: always

  postgres:
    restart: always
```

Start with:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 5. Nginx Reverse Proxy

Install Nginx and Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Frontend configuration

Create `/etc/nginx/sites-available/beauty-world-frontend`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Backend / API configuration

Create `/etc/nginx/sites-available/beauty-world-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Increase body size limit for file uploads
    client_max_body_size 20M;

    location / {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Serve uploaded files directly from Nginx for better performance
    location /uploads/ {
        alias /opt/beauty-world/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable both sites:

```bash
sudo ln -s /etc/nginx/sites-available/beauty-world-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/beauty-world-api     /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

Certbot automatically edits your Nginx configs to add HTTPS and redirects. Certificates auto-renew via a systemd timer — verify it is active:

```bash
sudo systemctl status certbot.timer
```

After obtaining certificates, ensure your `.env` and CORS settings reference `https://` URLs.

---

## 7. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Block direct container port access from the internet
# Docker exposes ports on 0.0.0.0 by default; restrict with explicit binds in compose:
# ports:
#   - "127.0.0.1:3000:3000"
#   - "127.0.0.1:5000:5000"
#   - "127.0.0.1:5432:5432"
```

> It is strongly recommended to bind Docker ports to `127.0.0.1` in production so traffic must pass through Nginx.

---

## 8. Database Backup Strategy

### Automated daily backup with cron

```bash
sudo mkdir -p /opt/beauty-world-backups
sudo crontab -e
```

Add the following cron entry to run a backup every day at 2 AM:

```cron
0 2 * * * docker exec beauty-world-db pg_dump -U beauty_admin beauty_world | gzip > /opt/beauty-world-backups/beauty_world_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Retain the last 30 days only

```cron
0 3 * * * find /opt/beauty-world-backups -name "*.sql.gz" -mtime +30 -delete
```

### Manual backup

```bash
docker exec beauty-world-db pg_dump -U beauty_admin beauty_world | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore from backup

```bash
gunzip -c backup_20260101.sql.gz | docker exec -i beauty-world-db psql -U beauty_admin -d beauty_world
```

### Offsite backup (recommended)

Copy backups to an S3-compatible bucket or a separate server using `rclone` or `aws s3 cp`. Store credentials in a restricted file outside the project directory.

---

## 9. Monitoring Basics

### Container health

```bash
docker compose ps
docker stats --no-stream
```

### Application logs

```bash
# All containers
docker compose logs -f

# Single container
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Nginx logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Simple uptime monitoring

For lightweight uptime monitoring, point a free service such as [UptimeRobot](https://uptimerobot.com) or [Better Stack](https://betterstack.com) at the health endpoint:

```
https://api.yourdomain.com/api/health
```

The endpoint returns `200 OK` with a JSON body when the API is healthy.

---

## 10. Updating the Application

```bash
cd /opt/beauty-world
git pull origin main

# Rebuild and restart affected containers (zero-downtime for unaffected services)
docker compose build backend frontend
docker compose up -d backend frontend
```

To apply database schema changes, run migration SQL directly:

```bash
docker exec -i beauty-world-db psql -U beauty_admin -d beauty_world < database/migration_YYYYMMDD.sql
```

---

## 11. Production Security Checklist

- [ ] `JWT_SECRET` is a unique random string of at least 64 characters
- [ ] `POSTGRES_PASSWORD` is strong and not the default value
- [ ] `.env` file has permissions `600` (`chmod 600 .env`)
- [ ] Docker ports are bound to `127.0.0.1` only
- [ ] UFW firewall is enabled; only ports 22, 80, 443 are open
- [ ] HTTPS is enforced (HTTP redirects to HTTPS via Certbot)
- [ ] `NODE_ENV` is set to `production` in the backend container
- [ ] Email credentials use an App Password, not your account password
- [ ] Automated daily database backups are configured and tested
- [ ] Admin password changed from the default `Admin@123`
- [ ] `CORS_ORIGIN` is set to the exact production frontend URL

---

## 12. Rollback

If a deployment introduces a regression:

```bash
# Identify the previous image tag or git commit
git log --oneline -10

# Revert to the previous commit
git checkout <previous-commit-hash>

# Rebuild
docker compose build backend frontend
docker compose up -d backend frontend
```

Alternatively, Docker image tags can be pinned in `docker-compose.yml` for fine-grained version control.

---

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---|---|---|
| `502 Bad Gateway` from Nginx | Container not running or wrong port | `docker compose ps`; check container logs |
| Database connection refused | PostgreSQL container unhealthy | `docker compose logs postgres`; check `POSTGRES_PASSWORD` |
| JWT errors after deploy | `JWT_SECRET` changed | All existing tokens are invalid — users must log in again |
| Emails not sending | Wrong `EMAIL_PASS` or less-secure apps disabled | Use a Gmail App Password; check SMTP logs |
| Large file uploads failing | Nginx `client_max_body_size` too low | Increase limit in the Nginx server block |
| CORS errors in browser | `CORS_ORIGIN` mismatch | Ensure the value exactly matches the frontend origin including scheme |
