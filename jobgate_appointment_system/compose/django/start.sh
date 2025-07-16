#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Start the Django application
echo "Starting Django application..."
exec gunicorn jobgate_appointment_system.wsgi:application --bind 0.0.0.0:8000