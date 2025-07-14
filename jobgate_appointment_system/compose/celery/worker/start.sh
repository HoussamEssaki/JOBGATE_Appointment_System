#!/bin/bash

# Wait for Redis to be ready
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis started"

# Start the Celery worker
echo "Starting Celery worker..."
exec celery -A jobgate_appointment_system worker -l info