# In flower.Dockerfile

FROM python:3.10

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/logs

RUN pip install --no-cache-dir django-allauth

# Copy the rest of your application's code into the container
COPY . /app/

# The command to run flower will be specified in docker-compose.yml
