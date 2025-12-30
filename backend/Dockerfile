# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Install system dependencies (needed for some python packages like opencv if used)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create directory for SQLite db
RUN mkdir -p /app/data

# Expose port 8000
EXPOSE 8080

# Run the command to start uvicorn
# Cloud Run expects the app to listen on PORT environment variable (default 8080)
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
