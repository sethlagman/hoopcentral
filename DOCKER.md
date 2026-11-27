# Docker

Compose runs Postgres, the API, the Vite dev server, and a one-shot ingest job. Application behavior, environment variables, and the ingestion pipeline are in [README.md](README.md). This file is only the container workflow.

Requires Docker Compose v2 (`docker compose version`).

## Environment file

Compose reads `.env` from the repository root (same directory as `docker-compose.yml`). Postgres and Django both use `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. `DB_PASSWORD` has no default; `up` fails without it.

```env
SECRET_KEY=change-me
DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=hoopcentral
DB_USER=postgres
DB_PASSWORD=change-me
END_YEAR=2025
SEASON=2025-26
```

The backend and ingest services override `DB_HOST=db`, `DB_PORT=5432`, and `DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0`. Do not point those containers at `localhost` for Postgres. The host port is **5433**, mapped to 5432 in the `db` container, so a tool on the machine uses `localhost:5433`.

The `db` healthcheck runs `pg_isready -U postgres`. If `DB_USER` is not `postgres`, the check can fail while the server is up, and `ingest` will wait until the check is healthy.

`DEBUG=False` belongs on a real deployment. Compose still uses `hoopcentral.settings`, not `hoopcentral.settings_prod`, so SSL redirect and the production CORS list are not applied here.

## Services

`docker compose up -d --build` the first time, and again after `backend/Dockerfile` or `backend/requirements.txt` changes. Later Python edits do not need a rebuild: `./backend` is mounted on `/app`, and Compose starts Gunicorn with `--workers 1 --reload`. Installed packages stay in the image. The image's own `CMD` (4 workers, no reload) is not what Compose runs.

The frontend service has no Dockerfile. It is `node:20-alpine`, with `./frontend` mounted at `/app` and an anonymous volume on `/app/node_modules`. The command is `npm install && npm run dev`. `VITE_API_URL` is `http://localhost:8000/api`. The profile block in `docker-compose.yml` is commented out, so the frontend starts with the rest of the stack.

| Service | Container | Role |
|---|---|---|
| `db` | `hoopcentral-db` | Postgres 16. Host `5433` → container `5432`. Volume `postgres_data`. |
| `backend` | `hoopcentral-backend` | `migrate`, then Gunicorn on `8000`. Working directory `/app/hoopcentral`. |
| `frontend` | `hoopcentral-frontend` | Vite on `5173`. |
| `ingest` | `<project>-ingest-1` | `sh /app/data_ingestion/ingest.sh`, then exit. `restart: "no"`. |

`<project>` is the Compose project name, the directory name by default (`hoopcentral-ingest-1` in this checkout).

`ingest` waits until `db` is healthy. It does not wait for `backend`. Both run `migrate`. The API process never starts the pipeline, and restarting `backend` does not rerun it.

`up` starts `ingest`. When the script exits, the daemon does not restart it. A later `up` starts that stopped container, which runs the script again. To run a separate one-off container:

```bash
docker compose run --rm ingest
```

`seed_stat` prints nothing until every row is written. A log that stops after players were seeded is still inside that command. Fetcher timeouts and the `stats.nba.com` headers are described in the README ingestion section. `set -eu` means the first failed command skips every later seed.

## Commands

```bash
docker compose up -d --build    # first run, or after Dockerfile / requirements.txt changes
docker compose up -d            # start without rebuilding
docker compose ps
docker compose logs -f backend
docker compose logs -f ingest
docker compose run --rm ingest
docker compose restart backend
docker compose down             # stop and remove containers; keep the volume
docker compose down -v          # also delete postgres_data
```

`manage.py` is on the backend working directory:

```bash
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py ingestion_status
```

`docker compose exec backend python manage.py test` uses the Compose Postgres database and `hoopcentral.settings`. The SQLite suite does not:

```bash
docker exec -w /app/hoopcentral \
  -e DJANGO_SETTINGS_MODULE=hoopcentral.settings_test \
  hoopcentral-backend python manage.py test
```

One fetcher, without a full ingest:

```bash
docker compose exec backend sh -c "cd /app && python data_ingestion/fetcher/get_nba_schedule.py"
```

That writes raw JSON only. Processing and `seed_schedule` still have to run before `/api/schedule` changes. Seed order, when invoked by hand: `seed_team`, `seed_standing`, `seed_player`, `seed_stat`, `seed_schedule`.

## URLs

- API: http://localhost:8000
- API root: http://localhost:8000/api/
- Health: http://localhost:8000/api/health
- Frontend: http://localhost:5173
- Postgres from the host: `localhost:5433`

The Vite proxy inside the frontend container targets `127.0.0.1:8000`, which is not the `backend` service. The browser must use `VITE_API_URL`.

## Failures

**Backend exits on database connection.** `docker compose ps` should show `db` as healthy. The first boot needs a few seconds for Postgres to initialize. `DB_HOST` inside the backend container must stay `db`. Changing the host port mapping does not change that.

**`db` never becomes healthy.** The healthcheck user is `postgres`. Match `DB_USER`, or change the check.

**Port in use.** Host mappings are `5433:5432`, `8000:8000`, and `5173:5173`. Change the left-hand port in `docker-compose.yml`. If the API moves off 8000, change `VITE_API_URL` as well. The frontend reads that value in the browser.

**Ingest exits before `seed_schedule`.** Read the ingest log. A `stats.nba.com` read timeout fails the fetcher and `ingest.sh` stops. If the log already printed that players were seeded and the container is still running, `seed_stat` has not finished.

**Code changes are not in the API.** The bind mount covers `/app`. New pip dependencies are not in the mount; rebuild after `requirements.txt` changes. Gunicorn `--reload` watches Python files, not new packages.

**Empty API after a fresh volume.** `ingest` has to finish, including `seed_stat`. `GET /api/health` returns `data_updated_at: null` until a seed command records a successful `IngestionRun`.

Rebuild including the database:

```bash
docker compose down -v
docker compose up -d --build
```

`docker compose exec backend env` prints the environment the API process sees.

## Paths inside the backend container

Working directory `/app/hoopcentral` (`manage.py`, `core/`, project package `hoopcentral/`). Fetchers and `ingest.sh` are under `/app/data_ingestion/`. `requirements.txt` is `/app/requirements.txt`. The image creates `/app/data_ingestion/output/processed` at build time; at runtime the bind mount replaces `/app` with the host `backend/` directory.
