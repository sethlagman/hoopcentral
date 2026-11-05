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
- `--build` is required on the first run, and again only after `backend/Dockerfile` or `backend/requirements.txt` changes

Later code edits do not need a rebuild. Compose bind-mounts `./backend` onto `/app`, and the backend command runs Gunicorn with `--reload`. Packages stay in the `hoopcentral-backend` image. `COPY . .` still runs at build time, but the mount hides that copy while the container is up.

`docker compose up -d` starts four services:

| Service | Container | What it does |
|---------|-----------|--------------|
| `db` | `hoopcentral-db` | Postgres 16. Host port **5433** maps to container port 5432 |
| `backend` | `hoopcentral-backend` | Migrates, then Gunicorn on port 8000 with 1 worker and `--reload` |
| `frontend` | `hoopcentral-frontend` | `npm install && npm run dev` on port 5173. `VITE_API_URL` is `http://localhost:8000/api` |
| `ingest` | `hoopcentral-ingest-1` | One-shot. Runs `ingest.sh`, then exits. `restart: "no"` |

The frontend profile lines in `docker-compose.yml` are commented out, so the frontend starts with the rest of the stack. It is not a separate `--profile frontend` command.

### Access the application

- **Backend API:** http://localhost:8000
- **API base:** http://localhost:8000/api/
- **Frontend:** http://localhost:5173
- **Postgres from the host:** `localhost:5433`

Inside the Compose network the backend uses `DB_HOST=db` and `DB_PORT=5432`.

### Ingest

Ingestion is not part of the API process. A long fetch does not block Gunicorn, and restarting the API does not rerun the pipeline. On AWS, run `backend/data_ingestion/ingest.sh` as its own task.

`docker compose up` starts ingest once. To run it again:

```bash
docker compose run --rm ingest
```

The ingest service waits until Postgres is healthy, then `ingest.sh`:

1. If `nba_player_data.json` or `nba_standing_data.json` is missing, run the matching historical fetcher and rename the historical file to the standard name. If the standard file exists, skip history and refresh the current season in place.
2. Refresh teams and the season schedule on every run.
3. Process player, team, standing, and schedule JSON.
4. Migrate, then seed in this order: team, standing, player, stat, schedule.

`seed_stat` writes one database row at a time and prints nothing until the loop finishes. The log can sit on "NBA players seeded successfully" for a long time. `seed_schedule` runs only after that command exits. `set -eu` stops the script on the first failed command, so a fetcher timeout never reaches the seeds.

`stats.nba.com` accepts a connection and then sends no body when the request looks like a bot. Python reports that as a read timeout. Player and standing fetchers send a Chrome 140 `User-Agent` and `Origin: https://www.nba.com`. The schedule fetcher copies the `nba_api` headers and adds that `Origin`. Passing `headers` into `ScheduleLeagueV2` replaces the library defaults, so the full header set has to be passed. `get_nba_team.py` reads a static team list inside `nba_api` and does not call `stats.nba.com`.

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
| `docker compose up -d --build` | Start and build (first run, or after Dockerfile / `requirements.txt` changes) |
| `docker compose up -d` | Start without rebuilding. Local backend code is already mounted |
| `docker compose run --rm ingest` | Run the ingestion pipeline again |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop and remove containers **and volumes** (deletes database data) |
| `docker compose restart backend` | Restart only the backend |
| `docker compose logs -f ingest` | Follow the one-shot ingest log |
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

# Schedule tests without touching the Compose Postgres database
docker exec -w /app/hoopcentral -e DJANGO_SETTINGS_MODULE=hoopcentral.settings_test hoopcentral-backend python manage.py test core.tests.test_schedule
```

The backend working directory is `/app/hoopcentral`, so `manage.py` runs without a `cd`.

---

## Data Ingestion (from inside the container)

Prefer the one-shot service:

```bash
docker compose run --rm ingest
```

To run one script by hand:

```bash
docker compose exec backend sh -c "cd /app && python data_ingestion/fetcher/get_nba_schedule.py"
```

Seed commands, in pipeline order:

```bash
docker compose exec backend python manage.py seed_team
docker compose exec backend python manage.py seed_standing
docker compose exec backend python manage.py seed_player
docker compose exec backend python manage.py seed_stat
docker compose exec backend python manage.py seed_schedule
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

If ports are in use, change them in `docker-compose.yml`. The database uses **5433** on the host so it does not collide with a local Postgres on 5432. The frontend uses **5173**. For the backend:

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

### Ingest stops before the schedule seed

`ingest.sh` exits on the first failed command. A `stats.nba.com` read timeout in a fetcher means the Chrome `User-Agent` or `Origin` header was rejected. See the ingest section above.

If the log has already printed "NBA players seeded successfully" and the container is still running, `seed_stat` is still writing rows. `seed_schedule` has not started yet.

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
