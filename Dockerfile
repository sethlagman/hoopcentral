# Use official Python image - matches typical development Python version
FROM python:3.13-slim

# -----------------------------------------------------------------------------
# Prevent Python from creating .pyc files and buffering output
# -----------------------------------------------------------------------------
# PYTHONDONTWRITEBYTECODE: Don't write bytecode (.pyc) to disk (saves space, faster)
# PYTHONUNBUFFERED: Send Python output directly to terminal (no buffering)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# -----------------------------------------------------------------------------
# Install system dependencies
# -----------------------------------------------------------------------------
# libpq-dev: Required for psycopg2 (PostgreSQL driver) to compile
# build-essential: Compilers needed for some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# -----------------------------------------------------------------------------
# Set working directory - Django project lives in hoopcentral/ subfolder
# -----------------------------------------------------------------------------
WORKDIR /app

# -----------------------------------------------------------------------------
# Install Python dependencies first (better layer caching)
# -----------------------------------------------------------------------------
# Copy only requirements first so pip install is cached when code changes
COPY requirements.txt .

# Upgrade pip and install dependencies (no cache to reduce image size)
# gunicorn is in requirements.txt for production WSGI serving
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# -----------------------------------------------------------------------------
# Copy application code into container
# -----------------------------------------------------------------------------
# Note: .dockerignore excludes unnecessary files (see .dockerignore)
COPY . .

# -----------------------------------------------------------------------------
# Switch to Django project directory
# -----------------------------------------------------------------------------
# manage.py and settings are in hoopcentral/ subdirectory
WORKDIR /app/hoopcentral

# -----------------------------------------------------------------------------
# Expose port 8000 for Django/Gunicorn
# -----------------------------------------------------------------------------
EXPOSE 8000

# -----------------------------------------------------------------------------
# Run Gunicorn (production WSGI server)
# -----------------------------------------------------------------------------
# 0.0.0.0 = listen on all interfaces (required for Docker port mapping)
# 4 workers = typical for small-medium apps (adjust based on CPU)
# Use runserver for development: CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "hoopcentral.wsgi:application"]
