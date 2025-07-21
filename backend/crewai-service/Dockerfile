FROM python:3.10

WORKDIR /app

COPY . .
COPY main.py .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "main.py"]


