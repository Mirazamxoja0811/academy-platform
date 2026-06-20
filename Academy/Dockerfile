# Stage 1: Build Next.js frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Django app
FROM python:3.11-slim
WORKDIR /app

COPY Academy/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt psycopg2-binary gunicorn python-dotenv

COPY Academy/ .
COPY --from=frontend-build /frontend/out ./frontend_out

ENV FRONTEND_DIR=/app/frontend_out

EXPOSE 8000
CMD ["gunicorn", "Academy.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
