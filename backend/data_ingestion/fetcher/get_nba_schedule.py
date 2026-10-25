import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from nba_api.stats.endpoints import scheduleleaguev2

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent.parent / '.env')
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'
SEASON = os.environ.get('SEASON', '2025-26')

MAX_RETRIES = 5
RETRY_BACKOFF_BASE = 1.0
RETRY_BACKOFF_FACTOR = 2.0


def get_nba_schedule(output_file=OUTPUT_DIR / 'nba_schedule_data.json', season=SEASON):
    """Fetch the league schedule for one season and save the raw JSON."""

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"Fetching schedule for {season} (attempt {attempt}/{MAX_RETRIES})...")
            schedule = scheduleleaguev2.ScheduleLeagueV2(season=season, timeout=60)
            data = schedule.get_dict()
            break
        except Exception as e:
            last_error = e
            print(f"Attempt {attempt}/{MAX_RETRIES} failed: {e}. Retrying...")
            if attempt < MAX_RETRIES:
                delay = min(RETRY_BACKOFF_BASE * (RETRY_BACKOFF_FACTOR ** (attempt - 1)), 60)
                print(f"Waiting {delay:.1f}s before retry...")
                time.sleep(delay)
    else:
        print(f"Error fetching schedule: {last_error}")
        raise last_error

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Successfully saved schedule to {output_file}")
    return data


if __name__ == '__main__':
    get_nba_schedule()
