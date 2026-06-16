FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
# Django va PostgreSQL uchun kerakli paketlarni qo'shamiz
RUN pip install --no-cache-dir -r requirements.txt psycopg2-binary gunicorn dj-database-url
COPY . .
CMD ["gunicorn", "Academy.wsgi:application", "--bind", "0.0.0.0:8000"]
