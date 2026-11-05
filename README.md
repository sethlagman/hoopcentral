# HoopCentral

Your go-to source for everything about sports stats, news, and everything sports-related.

![Hoop Central](assets/hoopcentral.png)

## Note

This is still an ongoing project. The backend is complete and ready for use, with additional updates and improvements planned. The frontend is currently under development and has not yet been finalized. More features, UI enhancements, and integrations will be added as the project continues.

- **Sports Available**: NBA
- **Additional Sports to be added**: NFL, MLB, NHL, UFC, F1

## 🏀 Features

- **Team Data**: Access information about all NBA teams including details like city, state, year founded, and logos
- **Player Data**: Retrieve player information including names, jersey numbers, team affiliations, and headshots
- **Player Statistics**: Get player statistics (points, rebounds, assists per game) by season
- **Team Standings**: Access team standings including wins, losses, win rates, conference records, and more
- **Season Schedule**: Stored NBA games, served by the API and shown on the Scores & schedule tab. Results are paged, latest game first
- **Historical Data**: Support for historical player and standing data across multiple seasons
- **RESTful API**: Clean, intuitive REST endpoints following best practices

## 🛠️ Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: React (Vite)
- **Database**: PostgreSQL

## 📁 Project Structure

```
hoopcentral/
├── backend/                 # Django API + data ingestion
│   ├── Dockerfile           # Backend image build
│   ├── .dockerignore        # Backend build exclusions
│   ├── requirements.txt     # Python dependencies
│   ├── hoopcentral/         # Django project
│   │   ├── core/            # Main app (models, views, serializers, API)
│   │   ├── hoopcentral/     # Settings, URLs, WSGI
│   │   └── manage.py
│   └── data_ingestion/      # Data fetching and processing scripts
│       ├── ingest.sh        # One-shot pipeline used by the Compose ingest service
│       ├── fetcher/         # Fetch raw data from NBA API
│       ├── processer/       # Process raw → structured JSON
│       └── output/          # raw/ and processed/ JSON
│
├── frontend/                # React (Vite) app
│   ├── src/                 # Core frontend (components, styles)
│   ├── public/              # Static assets
│   ├── package.json         # Metadata (dependencies and scripts)
│   └── vite.config.js       # Vite Config
│
├── docker-compose.yml       # Backend + DB + optional frontend
├── DOCKER.md                # Docker setup and run guide
├── .env                     # Environment variables (project root)
├── assets/                  # Static assets (e.g. images)
└── LICENSE
```

## 🐳 Docker

Docker Compose runs Postgres, the API, the Vite frontend, and a one-shot ingest job. See **[DOCKER.md](DOCKER.md)** for configuration and commands. Rebuild the backend image only after `backend/Dockerfile` or `backend/requirements.txt` changes. Local Python edits are bind-mounted and picked up by Gunicorn `--reload`.

## 🚀 Installation & Setup

### Prerequisites

- **Backend**: Python 3.13, PostgreSQL, pip. The Docker image is `python:3.13-slim`
- **Frontend**: Node.js 20, npm. The Docker frontend image is `node:20-alpine`

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd hoopcentral
```

### Step 2: Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Environment Variables

Create a `.env` file in the **project root**:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=hoopcentral
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
END_YEAR=2025
SEASON=2025-26
```

Docker Compose overrides `DB_HOST=db` and `DB_PORT=5432` inside the backend network. Postgres is published on the host as **5433**, so a client on the machine connects to `localhost:5433`.

### Step 4: Database & Migrations

1. Create PostgreSQL database: `CREATE DATABASE hoopcentral;`
2. Run migrations:

```bash
cd backend/hoopcentral
python manage.py migrate
```

### Step 5: Frontend Setup

```bash
cd frontend
npm install
npm run dev
npm run build
```

The frontend calls Django at `VITE_API_URL`. That value must include `/api` (Compose sets `http://localhost:8000/api`). The NBA Scores & schedule tab uses `GET /api/schedule`.

### Step 6: Create Superuser (Optional)

```bash
cd backend/hoopcentral
python manage.py createsuperuser
```

## 📊 Data Ingestion Workflow

The project includes a complete data ingestion pipeline to fetch and process NBA data. With Docker, run it as its own one-shot service. It is not part of the API process, so a long fetch does not block Gunicorn and an API restart does not rerun the pipeline:

```bash
docker compose run --rm ingest
```

That runs `backend/data_ingestion/ingest.sh`. If `nba_player_data.json` or `nba_standing_data.json` is missing, the matching historical fetcher runs, then the historical file is renamed to the standard name. If those files already exist, only the current-season player and standing scripts run. Teams and the season schedule refresh on every run. The script then processes, migrates, and seeds in this order: team, standing, player, stat, schedule. `seed_stat` writes one row at a time and prints nothing until it finishes, so the log can sit quiet after "NBA players seeded successfully" while `seed_schedule` is still waiting.

`stats.nba.com` drops the response body when a request looks like a bot, which shows up as a read timeout. Player, standing, and historical fetchers send a Chrome 140 `User-Agent` and `Origin: https://www.nba.com`. The schedule fetcher uses `nba_api` headers and adds that same `Origin`, because passing `headers` replaces the library defaults. Team data comes from a list shipped inside `nba_api` and does not call `stats.nba.com`.

### 1. Fetch Raw Data

From the project root, run fetchers (use the backend venv):

```bash
cd backend
python data_ingestion/fetcher/get_nba_player.py
python data_ingestion/fetcher/get_nba_team.py
python data_ingestion/fetcher/get_nba_standing.py
python data_ingestion/fetcher/get_nba_schedule.py
python data_ingestion/fetcher/get_nba_historical_player.py
python data_ingestion/fetcher/get_nba_historical_standing.py
```

Raw data is saved to `backend/data_ingestion/output/raw/`.

### 2. Process Data

```bash
cd backend
python data_ingestion/processer/process_nba_player.py
python data_ingestion/processer/process_nba_team.py
python data_ingestion/processer/process_nba_standing.py
python data_ingestion/processer/process_nba_schedule.py
```

Processed data is saved to `backend/data_ingestion/output/processed/`.

### 3. Seed Database

```bash
cd backend/hoopcentral

python manage.py seed_team
python manage.py seed_standing
python manage.py seed_player
python manage.py seed_stat
python manage.py seed_schedule
```

## 🌐 API Endpoints

All API endpoints are prefixed with `/api/`.

### Teams

- **GET `/api/team/`** - Get all teams
  ```json
  [
    {
      "team_id": "1610612737",
      "full_name": "Atlanta Hawks",
      "abbreviation": "ATL",
      "nickname": "Hawks",
      "city": "Atlanta",
      "state": "Georgia",
      "year_founded": 1949,
      "logo": "https://..."
    }
  ]
  ```

- **GET `/api/team/<team_id>`** - Get a specific team by ID

### Players

- **GET `/api/player/`** - Get all players
  ```json
  [
    {
      "player_id": "1629029",
      "full_name": "Zion Williamson",
      "last_name": "Williamson",
      "first_name": "Zion",
      "team": "1610612740",
      "jersey": "1",
      "is_active": true,
      "headshot": "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png",
      "year_start": "2019",
      "year_end": "2025"
    }
  ]
  ```

- **GET `/api/player/<player_id>`** - Get a specific player by ID

### Statistics

- **GET `/api/statistic/`** - Get all player statistics
  ```json
  [
    {
      "id": 1,
      "player": "1629029",
      "season": "2024-25",
      "ppg": 25.5,
      "rpg": 7.2,
      "apg": 4.8
    }
  ]
  ```

- **GET `/api/statistic/<player_id>`** - Get all statistics for a specific player

- **GET `/api/statistic/<player_id>/<season>`** - Get statistics for a player in a specific season
  - Example: `/api/statistic/1629029/2024-25`

### Standings

- **GET `/api/standing/`** - Get all team standings
  ```json
  [
    {
      "id": 1,
      "team": "1610612737",
      "season": "2024-25",
      "conference": "Eastern",
      "conference_record": "35-17",
      "division_record": "10-4",
      "wins": 45,
      "losses": 27,
      "winrate": "0.625",
      "home": "25-12",
      "road": "20-15",
      "last10": "7-3",
      "overtime": "2-1",
      "winstreak": "W3"
    }
  ]
  ```

- **GET `/api/standing/<team_id>`** - Get all standings for a specific team

- **GET `/api/standing/<team_id>/<season>`** - Get standings for a team in a specific season
  - Example: `/api/standing/1610612737/2024-25`

### Schedule

- **GET `/api/schedule`** - Season games stored in Postgres, latest date first
  - `season` defaults to the `SEASON` env value (for example `2025-26`)
  - `date` is `YYYY-MM-DD`
  - `team` is a team id or abbreviation (`BOS`)
  - `page` defaults to 1
  - `page_size` defaults to 40 and maxes at 200. `limit` is accepted as the same value
  - `count` is the total number of matches, not the size of this page
  ```json
  {
    "season": "2025-26",
    "count": 1400,
    "page": 1,
    "page_size": 40,
    "games": [
      {
        "game_id": "0042500405",
        "season": "2025-26",
        "game_date": "2026-06-13",
        "tip_time_est": "1900-01-01T20:30:00Z",
        "status": 3,
        "status_text": "Final",
        "arena_name": "Frost Bank Center",
        "arena_city": "San Antonio",
        "home_team": "1610612759",
        "home_team_name": "San Antonio Spurs",
        "home_tricode": "SAS",
        "home_score": 90,
        "away_team": "1610612752",
        "away_team_name": "New York Knicks",
        "away_tricode": "NYK",
        "away_score": 94
      }
    ]
  }
  ```

## 💻 Usage Examples

### Using cURL

```bash
# Get all teams
curl http://localhost:8000/api/team/

# Get a specific player
curl http://localhost:8000/api/player/1629029

# Get player statistics for a season
curl http://localhost:8000/api/statistic/1629029/2024-25

# Get team standings for a season
curl http://localhost:8000/api/standing/1610612737/2024-25

# Latest page of the 2025-26 schedule
curl "http://localhost:8000/api/schedule?season=2025-26&page=1&page_size=40"

# One team
curl "http://localhost:8000/api/schedule?season=2025-26&team=BOS"
```

### Using Python requests

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Get all players
response = requests.get(f"{BASE_URL}/player/")
players = response.json()

# Get specific player
player = requests.get(f"{BASE_URL}/player/1629029").json()

# Get player statistics
stats = requests.get(f"{BASE_URL}/statistic/1629029/2024-25").json()
```

### Using JavaScript fetch

```javascript
const BASE_URL = 'http://localhost:8000/api';

// Get all teams
fetch(`${BASE_URL}/team/`)
  .then(response => response.json())
  .then(data => console.log(data));

// Get player statistics
fetch(`${BASE_URL}/statistic/1629029/2024-25`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🏃 Running the Development Server

**Backend** (from project root):

```bash
cd backend/hoopcentral
python manage.py runserver
```

**Frontend** (from project root):

```bash
cd frontend
npm run dev
```

- Backend API: http://localhost:8000
- Frontend: http://localhost:5173

## 📝 Data Models

### Team
- `team_id` (Primary Key)
- `full_name`
- `abbreviation`
- `nickname`
- `city`
- `state`
- `year_founded`
- `logo`

### Player
- `player_id` (Primary Key)
- `full_name`
- `last_name`
- `first_name`
- `team` (ForeignKey to Team)
- `jersey`
- `is_active`
- `headshot`
- `year_start`
- `year_end`

### Statistic
- `player` (ForeignKey to Player)
- `season`
- `ppg` (Points Per Game)
- `rpg` (Rebounds Per Game)
- `apg` (Assists Per Game)

### Standing
- `team` (ForeignKey to Team)
- `season`
- `conference`
- `conference_record`
- `division_record`
- `wins`
- `losses`
- `winrate`
- `home`
- `road`
- `last10`
- `overtime`
- `winstreak`

### Game
- `game_id` (Primary Key)
- `season`
- `game_date`
- `tip_time_est`
- `status`
- `status_text`
- `arena_name`
- `arena_city`
- `home_team` (ForeignKey to Team)
- `away_team` (ForeignKey to Team)
- `home_score`
- `away_score`

## 🔧 Development

### Running Tests

```bash
cd backend/hoopcentral
python manage.py test
```

Schedule tests can run without Postgres:

```bash
cd backend/hoopcentral
DJANGO_SETTINGS_MODULE=hoopcentral.settings_test python manage.py test core.tests.test_schedule
```

Inside the backend container:

```bash
docker exec -w /app/hoopcentral -e DJANGO_SETTINGS_MODULE=hoopcentral.settings_test hoopcentral-backend python manage.py test core.tests.test_schedule
```

### Creating Migrations

After modifying models:

```bash
cd backend/hoopcentral
python manage.py makemigrations
python manage.py migrate
```

### Accessing Django Admin

1. Create a superuser (if not already done):
   ```bash
   cd backend/hoopcentral
   python manage.py createsuperuser
   ```

2. Start the server and navigate to:
   ```
   http://localhost:8000/admin/
   ```

### Frontend Development

The React app uses Vite. When you connect to the API, add `frontend/.env` and set `VITE_API_URL` (e.g. `http://localhost:8000`).

## 📦 Dependencies

- **Backend:** `backend/requirements.txt`
- **Frontend:** `frontend/package.json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.
