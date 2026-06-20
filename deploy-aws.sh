#!/bin/bash
# AWS serverda loyihani qayta deploy qilish
set -e

echo "=== 1. Frontend build ==="
cd "$(dirname "$0")/frontend"
npm install
npm run build

echo "=== 2. Docker rebuild ==="
cd ..
docker compose build django_admin

echo "=== 3. Restart ==="
docker compose up -d django_admin

echo "=== Tayyor! Tekshiring: http://YOUR_IP/login/ ==="
