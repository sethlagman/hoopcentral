import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'

def get_nba_team_image_url(team_id: str) -> str:
    return f'https://cdn.nba.com/logos/nba/{team_id}/primary/L/logo.svg'


def process_nba_team(raw_file=RAW_DIR / 'nba_team_data.json'):
    with open(raw_file, 'r') as f:
        team_data = json.load(f)

    for team in team_data:
        team['logo'] = get_nba_team_image_url(team['id'])

    with open(PROCESSED_DIR / 'nba_team.json', 'w') as f:
        json.dump(team_data, f, indent=2)

    print('Process NBA team complete')

if __name__ == '__main__':
    process_nba_team()
