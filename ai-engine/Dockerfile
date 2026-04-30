FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

EXPOSE 8080

# Use shell form of CMD to allow environment variable expansion
# Hugging Face Spaces defaults to 7860
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860} --workers 2

