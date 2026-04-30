import json
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
SEASON = (os.environ.get('SEASON') or '2025-26').strip()
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'
PLAYER_HEADSHOTS = 'https://cdn.nba.com/headshots/nba/latest/1040x760/'

load_dotenv(BASE_DIR.parent.parent / '.env')

def get_nba_player_image_url(player_id: str, url: str = PLAYER_HEADSHOTS) -> str:
    return f'{url}{player_id}.png'


def process_nba_player(raw_file=RAW_DIR / 'nba_player_data.json'):
    """
    Extract necessary player info and stat from the json file

    :param raw_file: Path for json player data
    :type raw_file: Class
    """

    with open(raw_file, 'r') as f:
        player_data = json.load(f)

    total_statistics = []
    for year, data in player_data.items():
        stats_for_year = []
        for player in data['resultSets'][0]['rowSet']:
            stats_for_year.append(
                {
                    'id': player[0],
                    'team_id': player[4],
                    'ppg': player[20],
                    'rpg': player[21],
                    'apg': player[22],
                }
            )
        total_statistics.append({year: stats_for_year})

    profile_season = SEASON if SEASON in player_data else list(player_data.keys())[-1]

    players = []
    for player in player_data[profile_season]['resultSets'][0]['rowSet']:
        players.append(
            {
                'id': player[0],
                'full_name': f'{player[2]} {player[1]}',
                'last_name': player[1],
                'first_name': player[2],
                'team_id': player[4],
                'jersey': player[10],
                'is_active': 'true' if player[19] is not None else 'false',
                'headshot': get_nba_player_image_url(player_id=player[0]),
                'year_start': player[24],
                'year_end': player[25],
            }
        )

    with open(PROCESSED_DIR / 'nba_player.json', 'w') as f:
        json.dump(players, f, indent=2)

    with open(PROCESSED_DIR / 'nba_statistic.json', 'w') as f:
        json.dump(total_statistics, f, indent=2)

    print('Process NBA player complete')

if __name__ == '__main__':
    process_nba_player()
