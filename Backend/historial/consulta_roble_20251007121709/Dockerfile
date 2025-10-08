
FROM python:3.10-slim
WORKDIR /app
COPY main.py /app/main.py
COPY .env /app/.env
RUN pip install flask requests python-dotenv
EXPOSE 8000
CMD ["python", "main.py"]
