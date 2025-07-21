FROM python:3.10

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        curl \
        git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Create directories for static and media files
RUN mkdir -p /app/static /app/staticfiles /app/media /app/logs

# Set permissions
RUN chmod +x /app/manage.py

# Expose port
EXPOSE 8001

# Install netcat
RUN apt-get update && apt-get install -y netcat-openbsd && apt-get clean

# Copy the start script
COPY compose/django/start.sh /app/compose/django/start.sh
COPY compose/celery/worker/start.sh /app/compose/celery/worker/start.sh

# Default command
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8001"]

# Command to run the application (this will be overridden by docker-compose)
CMD ["bash", "/app/compose/django/start.sh"]

