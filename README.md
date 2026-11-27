# HoopCentral

NBA teams, players, per-game averages, standings, and schedule, served by a Django REST API and a React frontend. The database is PostgreSQL. NBA is the only sport this repository loads or displays.

The API, the current frontend routes, Docker Compose, and the ingestion job are in the tree. Terraform, ECS, and deploy workflows are not. `plan/roadmap.md` is the plan for that work, not a description of what is deployed.

## Layout

```text
hoopcentral/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── data_ingestion/          # fetchers, processors, ingest.sh
│   └── hoopcentral/             # Django project; manage.py lives here
│       ├── hoopcentral/         # settings, root URLs
│       └── core/                # models, API, seed commands
├── frontend/                    # Vite + React
├── docker-compose.yml
├── DOCKER.md
└── plan/roadmap.md
```

Python dependencies are `backend/requirements.txt` (Django 6.0, djangorestframework 3.16.1, nba_api 1.11.3, gunicorn). Frontend dependencies are `frontend/package.json` (React 19, React Router 7, Vite 7).

The backend image is `python:3.13-slim`. GitHub Actions installs Python 3.12 for tests. The frontend image and CI both use Node 20. Compose runs Postgres 16.

## Configuration

Settings load a `.env` from the repository root (`backend/hoopcentral` → parent → parent) with `override=True`. Inside the backend image that path is `/.env`, which is not in the image, so Compose variables are what the process sees. `.env` is listed in `backend/.dockerignore` and must not be baked into the image.

| Variable | Used by | Behavior |
|---|---|---|
| `SECRET_KEY` | Django | No default. Production settings refuse to boot without it. |
| `DEBUG` | Django | `True` only when the value is exactly `True`. Anything else, including unset, is false. |
| `DJANGO_ALLOWED_HOSTS` | Django | Comma-separated. Empty means no hosts allowed. |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Django | Passed straight through. No defaults in `settings.py`. |
| `DB_CONN_MAX_AGE` | Django | Seconds. Default `0` in dev settings, `60` under `settings_prod`. Non-integers fall back to the default in dev and abort startup in production. |
| `CORS_ALLOWED_ORIGINS` | django-cors-headers | Comma-separated. Default `http://localhost:5173,http://127.0.0.1:5173`. Production settings do not keep that default; an empty value allows no browser origins. |
| `CSRF_TRUSTED_ORIGINS` | production settings | Comma-separated. Read only when `DJANGO_SETTINGS_MODULE=hoopcentral.settings_prod`. |
| `SECURE_SSL_REDIRECT` | production settings | Default on. Set `false`, `0`, or `no` to disable. |
| `SECURE_HSTS_SECONDS` | production settings | Default `3600`. |
| `SEASON` | API and schedule fetcher | Current campaign, for example `2025-26`. The API reads it once, at import. Restart the process after changing it. Default `2025-26` when unset. |
| `END_YEAR` | Historical fetchers | Last season start year to request. Default is last calendar year (`today.year - 1`). |
| `VITE_API_URL` | Frontend | See below. |

`VITE_API_URL` is resolved in `frontend/src/config/api.js`. Unset means requests go to `/api` on the Vite origin (the dev server proxies `/api` to `http://127.0.0.1:8000`). A value that does not already end in `/api` gets `/api` appended, so `http://localhost:8000` and `http://localhost:8000/api` hit the same root. Compose sets `http://localhost:8000/api` because the browser, not the frontend container, calls the API.

Local example:

```env
SECRET_KEY=change-me
DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=hoopcentral
DB_USER=postgres
DB_PASSWORD=change-me
DB_HOST=localhost
DB_PORT=5432
SEASON=2025-26
END_YEAR=2025
```

Compose overwrites `DB_HOST=db` and `DB_PORT=5432` on the backend and ingest services, and sets `DJANGO_ALLOWED_HOSTS` to `localhost,127.0.0.1,0.0.0.0`. Postgres is published on the host as `localhost:5433`. A client on the machine does not use `DB_PORT` from `.env` to reach that container.

## Local setup

Python 3.13 matches the image. Create the database before migrating (`CREATE DATABASE hoopcentral`).

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd hoopcentral
python manage.py migrate
python manage.py runserver
```

Frontend, from `frontend/`:

```bash
npm install
npm run dev
```

API: `http://localhost:8000`. Frontend dev server: `http://localhost:5173`. Admin: `http://localhost:8000/admin/`. Only `IngestionRun` is registered, and the admin is read-only (no add).

```bash
cd backend/hoopcentral
python manage.py createsuperuser
```

Docker commands, bind mounts, and the one-shot ingest service are in [DOCKER.md](DOCKER.md).

## Data model

Seasons are stored as `YYYY-YY` (`2025` and `2025-2026` both become `2025-26` in `canonical_season`). Lookups also accept a bare start year: `season_lookup_variants` queries both `2025` and `2025-26`.

`Statistic` and `Standing` are unique on `(player, season)` and `(team, season)`. Seeds upsert on those keys. A repeated ingest updates changed fields and leaves identical rows alone. Each model records `created_at` and `updated_at` except where a serializer omits them.

**Team.** `team_id` (PK, string), `full_name`, `abbreviation`, `nickname`, `city`, `state`, `year_founded`, `logo`. No conference or division column. Conference for a season is on `Standing`.

**Player.** `player_id` (PK, string), `full_name`, `first_name`, `last_name`, `team` (FK, cascade), `jersey`, `is_active`, `headshot`, `year_start`, `year_end`. No position, height, weight, or birth date. `is_active` is the current roster flag from the latest player fetch, not a per-season fact.

**Statistic.** `player` (FK), `team` (FK, nullable: franchise that stat line belongs to), `season`, `ppg`, `rpg`, `apg` (`Decimal`, one decimal place). Those are the only stat columns. No games played, minutes, shooting percentages, steals, blocks, or season totals.

**Standing.** `team`, `season`, `conference`, `conference_record`, `division_record`, `wins`, `losses`, `winrate` (three decimal places), `home`, `road`, `last10`, `overtime`, `winstreak`. No games-behind or playoff-seed column. The standings table computes games behind in the browser from wins and losses against the wins leader in that conference.

**Game.** `game_id` (PK), `season`, `game_date`, `tip_time_est`, `status`, `status_text`, `arena_name`, `arena_city`, `home_team`, `away_team`, `home_score`, `away_score`. `tip_time_est` is the raw `gameTimeEst` string. That feed uses a placeholder date (`1900-01-01T12:00:00Z` is the shape called out in the processor). `status` is the raw `gameStatus` integer. The UI treats `3`, or `status_text` starting with "Final", as final, and `2` as in progress. No quarter scores and no box score.

**IngestionRun.** One row per seed command invocation: `source`, `status` (`running`, `success`, `failed`), `started_at`, `finished_at`, `created_count`, `updated_count`, `unchanged_count`, `skipped_count`, `error`. Not a public list endpoint. `GET /api/health` exposes the latest successful `finished_at` as `data_updated_at`.

## API

Every route is `GET` under `/api/`. Other methods return 405. Paths have no trailing slash except `GET /api/player/search/`. Django registers `player/<player_id>` first, so `/api/player/search` (no slash) is a player lookup for id `search`, not the search view. A trailing slash on the other routes redirects to the canonical path.

Decimal fields are JSON strings (`"22.0"`, `"0.583"`). Foreign keys serialize as the related primary key (`team`, `player`, `home_team`, `away_team`).

Validation errors from these views use `{"error": "<message>"}` and HTTP 400. Missing rows from `get_object_or_404` and from `Http404` use DRF's `{"detail": "..."}` and HTTP 404. List filters that match nothing return an empty collection and HTTP 200, including when the id does not exist (`/api/statistic/<player_id>`, `/api/standing/<team_id>`).

`SEASON` in the descriptions below is the environment value, default `2025-26`.

### Pagination

`/api/player`, `/api/statistic`, and `/api/standing` use page-number pagination: `page` (default 1), `page_size` (default 20, max 100).

```json
{ "count": 0, "next": null, "previous": null, "results": [] }
```

`next` and `previous` are absolute URLs when set. A page past the end is 404.

`/api/team` is a JSON array. It is not paginated.

`/api/schedule` has its own page object, documented with that route. `page_size` default 40, max 200. `limit` is the old name and is ignored when `page_size` is present.

### `GET /api/health`

Database probe (`SELECT 1`) plus the latest successful ingestion time.

```json
{
  "status": "ok",
  "database": "ok",
  "season": "2025-26",
  "data_updated_at": null
}
```

HTTP 200 when the query succeeds, 503 when it does not (`status` and `database` are then `unavailable` and `error`, and `data_updated_at` is null).

### Teams

`GET /api/team` returns every team ordered by `team_id`, including `created_at` and `updated_at`. Optional `search` matches `team_id`, abbreviation (case-insensitive exact), or a case-insensitive substring of full name, nickname, or city.

`GET /api/team/<team_id>` returns one team or 404.

`GET /api/team/<team_id>/roster` returns players whose `Player.team` is that id, any season, ordered by name. Unknown team ids return 200 with `"team": null` and an empty roster.

```json
{ "team": {}, "roster": [], "roster_size": 0 }
```

`GET /api/team/<team_id>/roster/current` returns active players on that team who have a stat row for `SEASON`. Inactive players are omitted even if that stat row exists. `roster_scope` is `active_only`. `season` is the `SEASON` string, not a normalized label.

`GET /api/team/<team_id>/roster/<season>` returns players with a `Statistic.team` row for that franchise and season, then keeps players whose `year_start`/`year_end` window includes the season start year. This follows the stat line's franchise, not `Player.team`, so a traded player stays on the roster they played for. Inactive players are included. `roster_scope` is `stat_team_season`. The response `season` prefers the `YYYY-YY` form.

`GET /api/team/compare/<team_id_1>/<team_id_2>/<season>` returns `{ "team_1": <standing>, "team_2": <standing> }`. 404 when either team has no standing in that season. No page calls this route.

### Players

`GET /api/player` is paginated, ordered by `full_name`, then `player_id`.

| Query | Behavior |
|---|---|
| `name` | Case-insensitive substring of full, first, or last name. Accents are folded (`José` matches `jose`). |
| `team` | `team_id`, abbreviation (exact, any case), or a substring of full name or nickname. |
| `active` | `1`, `true`, `yes` or `0`, `false`, `no`. Any other non-empty value is 400: `active must be true or false`. |

`GET /api/player/<player_id>` returns one player. Fields: `player_id`, `full_name`, `last_name`, `first_name`, `team`, `team_name`, `jersey`, `is_active`, `headshot`, `year_start`, `year_end`. Timestamps are not serialized. 404 if missing.

`GET /api/player/search/` (trailing slash required) returns a JSON array, not a page. Optional `name` uses the same accent-folded match. Optional `team` is a substring of full name, nickname, or abbreviation (not `team_id`). The header search box does not call this route. It calls `GET /api/player?name=` and filters the team list in the browser.

`GET /api/player/<player_id>/career-summary` averages `ppg`, `apg`, and `rpg` across season rows whose season start year falls inside `year_start`..`year_end`. That is a mean of per-season averages, not a games-weighted career rate. `best_scoring_season` is the row with the highest `ppg`. 404 `{"error": "No stats found"}` when the player exists but nothing falls in that window. 404 `detail` when the player id does not exist. `avg_*` and `best_scoring_season.ppg` are numbers rounded to one decimal. `season_breakdown` entries are statistic objects. The values below are only there to show those types.

```json
{
  "player_id": "1629029",
  "year_start": "2019",
  "year_end": "2026",
  "career_summary": {
    "avg_points": 25.3,
    "avg_assists": 4.6,
    "avg_rebounds": 7.1,
    "best_scoring_season": { "season": "2024-25", "ppg": 27.0 },
    "seasons_count": 4
  },
  "season_breakdown": []
}
```

### Statistics

Statistic object (the numbers show the JSON types, not a live row):

```json
{
  "id": 1,
  "player": "1629029",
  "player_name": "Zion Williamson",
  "team": "1610612740",
  "club_id": "1610612740",
  "team_name": "New Orleans Pelicans",
  "team_abbreviation": "NOP",
  "season": "2024-25",
  "ppg": "25.3",
  "rpg": "7.2",
  "apg": "4.6"
}
```

`club_id`, `team_name`, and `team_abbreviation` come from `Statistic.team` when set, otherwise from the player's current team.

`GET /api/statistic` is paginated. Optional `season` (`2025` or `2025-26`). For the campaign that matches `SEASON`, only active players are included. For any other season, the player is kept when `year_start`/`year_end` covers that season start year; non-numeric career years are dropped. Optional `ordering`: `ppg`, `rpg`, `apg`, `player`, each with an optional leading `-`. Stat and name sorts put nulls last, then `pk`. Invalid ordering is 400 and lists the allowed keys. Default order is `pk`.

`GET /api/statistic/<player_id>` returns every season for that player as an array, ordered by `season`. Empty array if none.

`GET /api/statistic/<player_id>/<season>` is the same array filtered to that season's lookup variants.

`GET /api/leaders/<season>/<stat_category>` returns an array ordered by the category descending. Categories: `points_per_game`, `rebounds_per_game`, `assists_per_game`. Anything else is 400. Nulls for that column are excluded. The current campaign (`SEASON`) keeps active players only; older seasons use the career-year window. `limit` defaults to 10 and caps at 100. A missing, non-numeric, or `< 1` limit falls back to 10.

### Standings

A standing object includes `id`, `team`, `team_name`, `season`, `conference`, `conference_record`, `division_record`, `wins`, `losses`, `winrate`, `home`, `road`, `last10`, `overtime`, `winstreak`. `conference` is whatever the source column contained. The list filter and the UI both treat `East`/`Eastern` and `West`/`Western` as the two conferences.

`GET /api/standing` is paginated.

| Query | Behavior |
|---|---|
| `season` | `2025` or `2025-26`. |
| `conference` | `east`, `eastern`, `west`, `western` (any case). Other non-empty values are 400. |
| `team` | `team_id`, abbreviation, or a substring of full name or nickname. |
| `ordering` | `wins`, `losses`, `winrate`, `team`, optional leading `-`. Invalid values are 400. Default order is `pk`. |

`GET /api/standing/<team_id>` returns an array of that team's seasons, ordered by `season`.

`GET /api/standing/<team_id>/<season>` returns the matching rows as an array (normally one).

`GET /api/season/<season>/summary` returns `{ "season": "<YYYY-YY preferred>", "standings": [...] }` ordered by `wins` descending. The teams, standings, and dashboard pages use this rather than the paginated list.

### Schedule

`GET /api/schedule`

| Query | Behavior |
|---|---|
| `season` | Default `SEASON`. Response `season` prefers `YYYY-YY`. |
| `date` | Exact `YYYY-MM-DD`. |
| `from`, `to` | Inclusive bounds, `YYYY-MM-DD`. Combinable with `date`. |
| `team` | `team_id` or abbreviation (any case). Unknown team: 200, `games: []`, `count: 0`, `page: 1`. |
| `order` | `desc` (default) or `asc`. Default sorts by `-game_date`, `-game_id`. Anything else is 400. |
| `page` | Default 1. Values below 1 or non-numeric become 1. A page past the end is clamped to the last page. |
| `page_size` | Default 40, max 200. `limit` is used only when `page_size` is absent. Invalid or `< 1` becomes 40. |

A bad date is 400: `"<field> must be YYYY-MM-DD"`.

```json
{
  "season": "2025-26",
  "count": 0,
  "page": 1,
  "page_size": 40,
  "games": []
}
```

`count` is the full filter match, not the page length. Each game includes `game_id`, `season`, `game_date`, `tip_time_est`, `status`, `status_text`, `arena_name`, `arena_city`, `home_team`, `home_team_name`, `home_tricode`, `home_score`, `away_team`, `away_team_name`, `away_tricode`, `away_score`. Scores are integers or null.

`GET /api/game/<game_id>` returns one game or 404. Same fields. No box score.

```bash
curl -s http://localhost:8000/api/health
curl -s "http://localhost:8000/api/player?name=williamson&active=true&page_size=5"
curl -s "http://localhost:8000/api/leaders/2025-26/points_per_game?limit=10"
curl -s "http://localhost:8000/api/schedule?season=2025-26&team=BOS&order=asc&page_size=20"
curl -s "http://localhost:8000/api/player/search/?name=booker"
```

## Ingestion

`backend/data_ingestion/ingest.sh` is the pipeline. Compose runs it as the `ingest` service. The API process does not. `set -eu` stops the script on the first non-zero exit, so a current-season, team, or schedule fetcher failure never reaches the seeds. The historical scripts log a failed season and keep going; they exit 0 unless renaming the historical file fails.

Raw files live in `backend/data_ingestion/output/raw/`, processed files in `output/processed/`. `output/` is dockerignored, so an image build does not contain a previous fetch. Compose bind-mounts `./backend` over `/app`, which is how the container sees those files.

For players and standings, if `nba_player_data.json` or `nba_standing_data.json` is missing or empty, the matching historical fetcher runs (unless the historical file is already non-empty) and the historical file is renamed to the standard name. If the standard file already exists, only the current-season script runs. Teams and the schedule refresh on every run.

| Step | Script or command | Output / source key |
|---|---|---|
| Historical players, only when `nba_player_data.json` is absent | `fetcher/get_nba_historical_player.py` | Seasons `1996-97` through `END_YEAR`, `stats.nba.com` `playerindex` |
| Current players | `fetcher/get_nba_player.py` | `nba_player_data.json` |
| Historical standings, only when `nba_standing_data.json` is absent | `fetcher/get_nba_historical_standing.py` | Seasons `1970-71` through `END_YEAR` |
| Current standings | `fetcher/get_nba_standing.py` | `nba_standing_data.json` |
| Teams | `fetcher/get_nba_team.py` | Static list inside `nba_api`. Does not call `stats.nba.com`. |
| Schedule | `fetcher/get_nba_schedule.py` | One season, `SEASON`, via `ScheduleLeagueV2` |
| Process | `processer/process_nba_{player,team,standing,schedule}.py` | `nba_player.json`, `nba_team.json`, `nba_standing.json`, `nba_statistic.json`, `nba_schedule.json` |
| Load | `migrate`, then `seed_team`, `seed_standing`, `seed_player`, `seed_stat`, `seed_schedule`, `ingestion_status` | `IngestionRun` rows |

`process_nba_player.py` writes both `nba_player.json` and `nba_statistic.json`. Player profiles are taken from the `SEASON` key in the raw map. If that key is missing, the processor uses the last season key it read. `process_nba_standing.py` writes `nba_standing.json`. Schedule processing keeps games whose home and away ids are both in `nba_api`'s static NBA team list, and drops the rest (All-Star and games against non-NBA clubs). A game with a missing id or an unreadable date is skipped.

The current player and standing fetchers merge `SEASON` into the existing raw JSON object. Other season keys stay. The team and schedule fetchers overwrite their raw files.

`stats.nba.com` often accepts the TCP connection and then sends no body when the client looks like a script. Requests reports that as a read timeout. Player, standing, and historical fetchers set a Chrome 140 `User-Agent`, `Origin: https://www.nba.com`, and the related `Referer` / `Sec-Fetch-*` headers in each script. Retries for those calls go through `fetcher/http_utils.py`: 5 attempts, timeout 45s, backoff base 1s, factor 2, cap 60s, on timeout, connection errors, 429, and 5xx. The schedule fetcher copies `nba_api`'s `STATS_HEADERS` and adds that `Origin`. Passing `headers` into `ScheduleLeagueV2` replaces the library defaults, so the merged dict is required. It retries any exception, 5 attempts, timeout 60s, same backoff. The team fetcher retries `teams.get_teams()` with that 5-attempt backoff and does not call `stats.nba.com`. A failed historical season is logged and the loop continues. A failed current-season, team, or schedule fetch aborts `ingest.sh`.

`seed_stat` writes one row per player-season and prints only when the loop finishes. The line looks like `NBA players seeded successfully (created=… updated=… unchanged=… skipped=…)`. A quiet log after that player line is `seed_stat` still running. Each seed accepts `--file` to override the processed JSON path. A failed seed writes `IngestionRun.status=failed` and re-raises, which stops `ingest.sh`. Earlier successful seeds stay `success`. `GET /api/health` uses the newest successful `finished_at` across sources, so `data_updated_at` does not mean every source in the latest run succeeded. `ingestion_status` prints the latest row per `source`.

From a venv, with `manage.py`'s working directory for the seed commands:

```bash
cd backend
python data_ingestion/fetcher/get_nba_team.py
python data_ingestion/fetcher/get_nba_schedule.py
python data_ingestion/processer/process_nba_team.py
python data_ingestion/processer/process_nba_schedule.py
cd hoopcentral
python manage.py seed_team
python manage.py seed_schedule
```

Running a single fetcher does not update the database until the matching processor and seed command run. Seed order matters when you run them by hand: teams before standings, players before stats, teams before schedule (games reference team ids).

## Frontend

| Path | Page | API |
|---|---|---|
| `/` | Dashboard | season summary, schedule, leaders |
| `/teams`, `/teams/:teamId` | Directory and profile | `/api/team`, season summary, roster, standings, schedule |
| `/players`, `/players/:playerId` | Directory and profile | `/api/player`, career summary, statistic |
| `/stats` | Averages | `/api/statistic` |
| `/leaders` | Leaders | `/api/leaders/...` |
| `/standings` | Conference tables | `/api/season/<season>/summary` |
| `/schedule` | Scores and schedule | `/api/schedule` |
| `/games/:gameId` | One game | `/api/game/<game_id>` |
| `/search?q=` | Search | `/api/player?name=`, team list filtered locally |

Players can be filtered by name, team, and active roster. There is no position filter. Team conference filters use the selected season's standings. Division names are not loaded. Leader categories are the three stored averages. The leaders page requests `limit=25`.

`DEFAULT_NBA_SEASON` in `frontend/src/config/api.js` is the string `2025-26`. It is not read from the API. If `SEASON` on the backend changes, change this constant too or the default season forms and the API will disagree until the user types a season.

Vite binds `0.0.0.0:5173`. Its `/api` proxy target is `127.0.0.1:8000`, which is the frontend container itself when Compose is up. Leave `VITE_API_URL` pointed at the host API.

There is no frontend test script. `npm run lint` and `npm run build` are what CI runs.

## Tests and CI

Default `manage.py test` uses `hoopcentral.settings` and therefore PostgreSQL. Schedule and other tests can run on in-memory SQLite:

```bash
cd backend/hoopcentral
DJANGO_SETTINGS_MODULE=hoopcentral.settings_test python manage.py test
```

`settings_test` only swaps the database. CI (`.github/workflows/backend-ci.yml`) sets that module, a dummy `SECRET_KEY` and `DB_PASSWORD`, then runs `test`, `check`, and `makemigrations --check --dry-run` on Python 3.12.

`.github/workflows/frontend-ci.yml` runs `npm ci`, `npm run lint`, and `npm run build` on Node 20. `.github/workflows/docker-build.yml` runs `docker build -t hoopcentral-backend ./backend`. All three trigger on push and pull request to `main`. Nothing in `.github/workflows/` deploys.

## Production settings

`DJANGO_SETTINGS_MODULE=hoopcentral.settings_prod` forces `DEBUG=False`, requires `SECRET_KEY` and `DJANGO_ALLOWED_HOSTS`, and turns on nosniff, HSTS, secure session and CSRF cookies, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`, and SSL redirect behind `X-Forwarded-Proto`. CORS and CSRF trusted origins come only from the environment. Local Compose does not set this module. The image `CMD` is Gunicorn with 4 workers. Compose replaces that with 1 worker and `--reload`.

The image does not set a `USER`. The container runs as root.

## License

MIT. See `LICENSE`.
