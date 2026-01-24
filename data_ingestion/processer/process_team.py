import json
from pathlib import Path

BASE_DIR = BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'

def get_team_image_url(team_id: str) -> str:
    """
    Returns API url for team logo
    
    :param team_id: Description
    :type team_id: str
    :return: Description
    :rtype: str
    """

    return f'https://cdn.nba.com/logos/nba/{team_id}/primary/L/logo.svg'


def process_team(raw_file=RAW_DIR / 'team_data.json'):
    """
    Processes team data and adds key-value pair for team logo URL
    
    :param raw_file: Path for json team data
    :type raw_file: Class
    """

    with open(raw_file, 'r') as f:
        team_data = json.load(f)
    
    for team in team_data:
        team['logo'] = get_team_image_url(team['id'])

    with open(PROCESSED_DIR / 'team.json', 'w') as f:
        json.dump(team_data, f, indent=2)

    print('Process player complete')

if __name__ == '__main__':
    process_team()
