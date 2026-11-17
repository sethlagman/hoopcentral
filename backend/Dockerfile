FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# libpq-dev and build-essential are needed to compile psycopg2.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Copy requirements alone so the pip layer stays cached across code changes.
COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

# output/ is excluded from the build, so the host processed folder is not copied in.
# Compose bind-mounts ./backend over /app and uses the folder that already exists there.
RUN mkdir -p /app/data_ingestion/output/processed

WORKDIR /app/hoopcentral

EXPOSE 8000

# Adjust --workers to the host's CPU count.
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "hoopcentral.wsgi:application"]
