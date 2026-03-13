import json
import time
from nba_api.stats.static import teams
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'

MAX_RETRIES = 5
RETRY_BACKOFF_BASE = 1.0
RETRY_BACKOFF_FACTOR = 2.0


def get_nba_team(output_file=OUTPUT_DIR / 'nba_team_data.json'):
    """
    Requests static team data from NBA API Python library.
    Retries on timeout/connection errors with exponential backoff.
    """

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"Fetching team data (attempt {attempt}/{MAX_RETRIES})...")
            data = teams.get_teams()
            break
        except Exception as e:
            last_error = e
            print(f"Attempt {attempt}/{MAX_RETRIES} failed: {e}. Retrying...")
            if attempt < MAX_RETRIES:
                delay = min(RETRY_BACKOFF_BASE * (RETRY_BACKOFF_FACTOR ** (attempt - 1)), 60)
                print(f"Waiting {delay:.1f}s before retry...")
                time.sleep(delay)
    else:
        print(f"Error fetching team data: {last_error}")
        raise last_error

    # Create output directory if it doesn't exist
    output_file.parent.mkdir(parents=True, exist_ok=True)

    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully downloaded and saved to {output_file}")
    except Exception as e:
        print(f"Unexpected error writing file: {e}")
        raise


if __name__ == '__main__':
    get_nba_team()
