FROM python:3.10
ENV PYTHONUNBUFFERED 1
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/
EXPOSE 8000
CMD ["python3", "manage.py", "runserver"]

# Install netcat
RUN apt-get update && apt-get install -y netcat-openbsd && apt-get clean


# Copy the start script
COPY compose/django/start.sh /app/compose/django/start.sh
COPY compose/celery/worker/start.sh /app/compose/celery/worker/start.sh

# Command to run the application (this will be overridden by docker-compose)
CMD ["bash", "/app/compose/django/start.sh"]

