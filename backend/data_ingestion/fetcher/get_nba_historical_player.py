import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

try:
    from .http_utils import get_with_retry
except ImportError:
    from http_utils import get_with_retry

_INGEST = Path(__file__).resolve().parent.parent
if str(_INGEST) not in sys.path:
    sys.path.insert(0, str(_INGEST))

from log import get_logger
from validate import assert_result_set

BASE_DIR = _INGEST
load_dotenv(BASE_DIR.parent.parent / '.env')
LOG = get_logger('hoopcentral.ingestion.player_history')
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'
API_URL = 'https://stats.nba.com/stats/playerindex'

def get_nba_player_for_season(output_file, season):
    params = {
        'College': '',
        'Country': '',
        'DraftPick': '',
        'DraftRound': '',
        'DraftYear': '',
        'Height': '',
        'Historical': '1',
        'LeagueID': '00',
        'Season': season,
        'SeasonType': 'Regular Season',
        'TeamID': '0',
        'Weight': ''
    }

    # stats.nba.com tends to hang on requests without browser-like headers.
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Referer': 'https://www.nba.com/players',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://www.nba.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
    }

    try:
        LOG.info("Fetching data for season %s...", season)
        response = get_with_retry(API_URL, params=params, headers=headers)

        data = response.json()
        assert_result_set(data, f'player {season}')

        output_file.parent.mkdir(parents=True, exist_ok=True)

        overall_data = {}
        if output_file.exists():
            with open(output_file, 'r') as f:
                try:
                    overall_data = json.load(f)
                except json.JSONDecodeError:
                    overall_data = {}
        if not isinstance(overall_data, dict):
            overall_data = {}

        overall_data[season] = data

        with open(output_file, 'w') as f:
            json.dump(overall_data, f, indent=2)

        LOG.info("Successfully saved %s data to %s", season, output_file.name)
        return True

    except Exception as e:
        LOG.error("Error fetching data for %s: %s", season, e)
        return False


def fetch_all_nba_historical_players():
    """Fetch every season from 1996-97 through ``END_YEAR`` (default: last calendar year)."""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / 'nba_historical_player_data.json'

    start_year = 1996
    current_year = datetime.today().year - 1
    end_year = int(os.environ.get('END_YEAR', current_year))

    LOG.info("Starting historical data fetch into %s...", output_path)

    for year in range(start_year, end_year + 1):

        season_str = f"{year}-{str(year + 1)[-2:]}"

        success = get_nba_player_for_season(output_path, season_str)

        if success:
            time.sleep(0.8)
        else:
            LOG.error("Failed to retrieve data for %s. Moving to next season.", season_str)

    LOG.info("Historical data fetch complete.")

if __name__ == '__main__':
    fetch_all_nba_historical_players()
