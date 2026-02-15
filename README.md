# HoopCentral

A comprehensive full-stack web application for everything related to sports

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
- **Historical Data**: Support for historical player and standing data across multiple seasons
- **RESTful API**: Clean, intuitive REST endpoints following best practices

## 🛠️ Tech Stack

- **Backend Framework**: Django
- **API Framework**: Django REST Framework
- **Database**: PostgreSQL
- **Environment Management**: python-dotenv

## 📁 Project Structure

```
hoopcentral/
├── data_ingestion/          # Data fetching and processing scripts
│   ├── fetcher/             # Scripts to fetch raw data from NBA API
│   │   ├── get_nba_player.py
│   │   ├── get_nba_team.py
│   │   ├── get_nba_standing.py
│   │   ├── get_nba_historical_player.py
│   │   └── get_nba_historical_standing.py
│   ├── processer/           # Scripts to process raw data into structured format
│   │   ├── process_nba_player.py
│   │   ├── process_nba_team.py
│   │   └── process_nba_standing.py
│   └── output/
│       ├── raw/             # Raw JSON data from API
│       └── processed/       # Processed JSON data ready for seeding
├── hoopcentral/             # Django project
│   ├── core/                # Main application
│   │   ├── models.py        # Database models (Team, Player, Statistic, Standing)
│   │   ├── views.py         # API view functions
│   │   ├── serializers.py   # DRF serializers
│   │   ├── urls.py          # API URL routing
│   │   └── management/
│   │       └── commands/     # Django management commands for seeding
│   │           ├── seed_player.py
│   │           ├── seed_team.py
│   │           ├── seed_stat.py
│   │           └── seed_standing.py
│   └── hoopcentral/         # Django project settings
│       ├── settings.py       # Django configuration
│       └── urls.py           # Root URL configuration
└── requirements.txt          # Python dependencies
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.12+
- PostgreSQL database
- pip (Python package manager)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd hoopcentral
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE hoopcentral;
```

2. Create a `.env` file in the `hoopcentral/hoopcentral/` directory with the following variables:

```env
SECRET_KEY=your-secret-key-here
DB_NAME=hoopcentral_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
```

### Step 5: Run Migrations

```bash
cd hoopcentral
python manage.py migrate
```

### Step 6: Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

## 📊 Data Ingestion Workflow

The project includes a complete data ingestion pipeline to fetch and process NBA data:

### 1. Fetch Raw Data

Run the fetcher scripts to download raw data from the NBA API:

```bash
# Fetch current player data
python data_ingestion/fetcher/get_nba_player.py

# Fetch team data
python data_ingestion/fetcher/get_nba_team.py

# Fetch standing data
python data_ingestion/fetcher/get_nba_standing.py

# Fetch historical player data
python data_ingestion/fetcher/get_nba_historical_player.py

# Fetch historical standing data
python data_ingestion/fetcher/get_nba_historical_standing.py
```

Raw data will be saved to `data_ingestion/output/raw/`.

### 2. Process Data

Process the raw data into structured JSON format:

```bash
# Process player data
python data_ingestion/processer/process_nba_player.py

# Process team data
python data_ingestion/processer/process_nba_team.py

# Process standing data
python data_ingestion/processer/process_nba_standing.py
```

Processed data will be saved to `data_ingestion/output/processed/`.

### 3. Seed Database

Use Django management commands to populate the database:

```bash
cd hoopcentral

# Seed teams (must be done first)
python manage.py seed_team

# Seed players
python manage.py seed_player

# Seed statistics
python manage.py seed_stat

# Seed standings
python manage.py seed_standing
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

```bash
cd hoopcentral
python manage.py runserver
```

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

## 🔧 Development

### Running Tests

```bash
python manage.py test
```

### Creating Migrations

After modifying models:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Accessing Django Admin

1. Create a superuser (if not already done):
   ```bash
   python manage.py createsuperuser
   ```

2. Start the server and navigate to:
   ```
   http://localhost:8000/admin/
   ```

## 📦 Dependencies

See `requirements.txt` for the complete list.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.
