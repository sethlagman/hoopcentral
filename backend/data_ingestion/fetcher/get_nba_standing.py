import json
import os
import sys
from pathlib import Path

import requests
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
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'
API_URL = 'https://stats.nba.com/stats/leaguestandingsv3'
SEASON = os.environ.get('SEASON', '2025-26')
LOG = get_logger('hoopcentral.ingestion.standing_fetch')

def get_nba_standing(output_file=OUTPUT_DIR / 'nba_standing_data.json', season=SEASON):
    """Fetch leaguestandingsv3 for ``season`` and merge it into ``output_file`` keyed by season."""

    url = API_URL

    params = {
        'GroupBy': 'conf',
        'LeagueID': '00',
        'Season': season,
        'SeasonType': 'Regular Season',
        'Section': 'overall'
    }

    # stats.nba.com tends to hang on requests without browser-like headers.
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Referer': 'https://www.nba.com/',
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
        LOG.info("Fetching data from %s...", url)
        response = get_with_retry(url, params=params, headers=headers)

        data = response.json()
        assert_result_set(data, f'standing {season}')

        output_file.parent.mkdir(parents=True, exist_ok=True)

        overall_data = _read_season_file(output_file)
        overall_data[season] = data

        with open(output_file, 'w') as f:
            json.dump(overall_data, f, indent=2)

        LOG.info("Successfully downloaded and saved to %s", output_file)
        LOG.info("Response status: %s", response.status_code)

        return data

    except requests.exceptions.RequestException as e:
        LOG.error("Error fetching data: %s", e)
        raise
    except json.JSONDecodeError as e:
        LOG.error("Error parsing JSON response: %s", e)
        raise


def _read_season_file(output_file):
    if not output_file.exists():
        return {}
    try:
        with open(output_file, 'r') as handle:
            overall_data = json.load(handle)
    except json.JSONDecodeError:
        LOG.warning("Existing %s is not valid JSON. Replacing it.", output_file.name)
        return {}
    if not isinstance(overall_data, dict):
        LOG.warning("Existing %s is not a season map. Replacing it.", output_file.name)
        return {}
    return overall_data


if __name__ == '__main__':
    get_nba_standing()
