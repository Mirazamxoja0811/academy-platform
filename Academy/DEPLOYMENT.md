# Production Settings Guide

## Environment Variables

Create a `.env` file in the project root:

```
DEBUG=False
SECRET_KEY=your-super-secret-key-here-change-this
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://user:password@host:port/dbname
```

## settings.py Changes

Replace hardcoded values with environment variables:

```python
import os
from pathlib import Path

DEBUG = os.getenv('DEBUG', 'False') == 'True'
SECRET_KEY = os.getenv('SECRET_KEY', 'change-me-in-production')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Database
if os.getenv('DATABASE_URL'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
    }
else:
    # SQLite for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Static files for production
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

## PostgreSQL Setup

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE mentor_academy;
CREATE USER academy_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE mentor_academy TO academy_user;
```

3. Install dependencies:
```bash
pip install psycopg2-binary dj-database-url
```

## Static Files

```bash
python manage.py collectstatic --no-input
```

## Gunicorn Setup

1. Install:
```bash
pip install gunicorn
```

2. Create `gunicorn_config.py`:
```python
bind = "0.0.0.0:8000"
workers = 3
timeout = 120
```

3. Run:
```bash
gunicorn -c gunicorn_config.py Academy.wsgi:application
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /path/to/Academy;
    }
    
    location /media/ {
        root /path/to/Academy;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Systemd Service

Create `/etc/systemd/system/mentor-academy.service`:

```ini
[Unit]
Description=Mentor Academy Django Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/Academy
Environment="PATH=/path/to/.venv/bin"
ExecStart=/path/to/.venv/bin/gunicorn -c gunicorn_config.py Academy.wsgi:application

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable mentor-academy
sudo systemctl start mentor-academy
sudo systemctl status mentor-academy
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Monitoring & Logging

1. Enable Django logging in settings.py
2. Use tools like Sentry for error tracking
3. Set up log rotation for application logs

## Backup Strategy

1. Database backups:
```bash
pg_dump mentor_academy > backup_$(date +%Y%m%d).sql
```

2. Media files backup
3. Automated daily/weekly backups

## Performance Optimization

1. Enable caching (Redis)
2. Use CDN for static files
3. Database indexing
4. Query optimization
5. Load balancing if needed

---

**Important**: Never commit `.env` file to version control!
