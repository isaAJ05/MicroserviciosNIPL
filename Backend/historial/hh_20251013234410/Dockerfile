
FROM python:3.10-slim
WORKDIR /app
COPY main.py /app/main.py
RUN pip install flask requests flask-cors
EXPOSE 8000
CMD ["python", "main.py"]
