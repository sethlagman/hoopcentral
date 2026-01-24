import json
from nba_api.stats.static import teams
from pathlib import Path

BASE_DIR = BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'

def get_team(output_file=OUTPUT_DIR / 'team_data.json'):
    """
    Requests static team data from NBA API Python library
    
    :param output_file: Path to save the JSON response
    :type output_file: str
    """

    data = teams.get_teams()

    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise


if __name__ == '__main__':
    get_team()
