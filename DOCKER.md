# Docker Setup Guide

This guide covers configuring and running HoopCentral with Docker. The project is split into:
- **backend/** — Django API + data ingestion
- **frontend/** — React (Vite) app

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)

Verify installation:

```bash
docker --version
docker compose version
```

---

## Configuration

### 1. Create a `.env` file

Create a `.env` file in the **project root** (same directory as `docker-compose.yml`). Docker Compose reads this file to configure the database and backend.

**Required variables:**

```env
# Django - generate a secret key for production
SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database - these are used by both the Postgres container and Django
DB_NAME=hoopcentral
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Data ingestion (optional - for fetcher scripts)
END_YEAR=2025
SEASON=2025-26
```

**Notes:**

- `DB_HOST` and `DB_PORT` are **automatically overridden** by Docker Compose when the backend connects to the database (no need to set them).
- For production, set `DEBUG=False` and use a strong `SECRET_KEY`.
- Add your domain to `DJANGO_ALLOWED_HOSTS` in production (comma-separated).

---

## Running with Docker

### Start everything

From the project root:

```bash
docker compose up -d --build
```

- `-d` runs containers in the background
- `--build` builds the image (use on first run or after code changes)

### Access the application

- **Backend API:** http://localhost:8000
- **API base:** http://localhost:8000/api/

### Frontend

The React frontend can be run in a separate container. Start it with:

```bash
docker compose --profile frontend up -d
```

- **Frontend:** http://localhost:5173

Or run the frontend locally for development: `cd frontend && npm run dev`

### View logs

```bash
# Backend logs (Django/Gunicorn)
docker compose logs -f backend

# Database logs
docker compose logs -f db

# All services
docker compose logs -f
```

Press `Ctrl+C` to stop following logs.

---

## Common Commands

| Command | Description |
|--------|-------------|
| `docker compose up -d --build` | Start and build (first run or after changes) |
| `docker compose up -d` | Start without rebuilding |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop and remove containers **and volumes** (deletes database data) |
| `docker compose restart backend` | Restart only the backend |
| `docker compose ps` | List running containers |

---

## Running Django Commands

Execute management commands inside the backend container:

```bash
# Create a superuser
docker compose exec backend python manage.py createsuperuser

# Run migrations manually (normally done on startup)
docker compose exec backend python manage.py migrate

# Run the test suite
docker compose exec backend python manage.py test
```

---

## Data Ingestion (from inside the container)

To run fetcher or processor scripts:

```bash
# Enter the backend container
docker compose exec backend sh

# From inside the container (WORKDIR is /app/hoopcentral, project root is /app)
cd /app
python data_ingestion/fetcher/get_nba_player.py
python data_ingestion/processer/process_nba_player.py

# Seed the database
cd hoopcentral
python manage.py seed_team
python manage.py seed_player
# ... etc.
```

Or run a single command:

```bash
docker compose exec backend sh -c "cd /app && python data_ingestion/fetcher/get_nba_player.py"
```

---

## Troubleshooting

### Backend won't start / database connection errors

1. Ensure the database is healthy:
   ```bash
   docker compose ps
   ```
   The `db` service should show "healthy".

2. Wait a few seconds on first run—PostgreSQL may need time to initialize.

3. Restart everything:
   ```bash
   docker compose down
   docker compose up -d
   ```

### Port already in use

If ports are in use, change them in `docker-compose.yml`. The database already uses **5433** on the host (to avoid conflict with local PostgreSQL). For the backend:

```yaml
# backend service
ports:
  - "8001:8000"   # Use 8001 on host instead
```

Then use http://localhost:8001 for the API.

### Rebuild from scratch

To clear the database and rebuild:

```bash
docker compose down -v
docker compose up -d --build
```

### View environment variables

Check what the backend sees:

```bash
docker compose exec backend env
```

---

## Project Layout (Docker)

**On host:**
```
hoopcentral/
├── backend/           # Docker build context for backend
├── frontend/          # Mounted into frontend container
├── docker-compose.yml
└── .env
```

**Inside backend container (`/app`):**
```
/app/
├── data_ingestion/    # Fetchers and processors
├── hoopcentral/       # Django project (WORKDIR for manage.py)
│   ├── manage.py
│   ├── core/
│   └── hoopcentral/
└── requirements.txt
```

The backend container runs from `/app/hoopcentral` so `manage.py` and other Django commands work directly.
