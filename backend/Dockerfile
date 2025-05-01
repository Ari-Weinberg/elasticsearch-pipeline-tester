FROM python:3.9-slim

WORKDIR /app

# Set environment variables
ENV PORT=5000
ENV ELASTICSEARCH_TIMEOUT=30
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE ${PORT}

# Command to run the application with gunicorn
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} app:app"] 