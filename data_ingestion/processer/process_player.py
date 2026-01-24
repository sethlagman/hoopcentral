import json
from pathlib import Path

BASE_DIR = BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'
PLAYER_HEADSHOTS = 'https://cdn.nba.com/headshots/nba/latest/1040x760/'

def get_player_image_url(player_id: str, url=PLAYER_HEADSHOTS) -> str:
    """
    Returns API image url for a player's headshot
    
    :param player_id: The id of a player
    :type player_id: str
    :param url: API Url for requesting player headshot pictures
    :return: Returns a string url for a player's headshot
    :rtype: str
    """

    return f'{url}{player_id}.png'


def process_player(raw_file=RAW_DIR / 'player_data.json'):
    """
    Extract necessary player info and stat from the json file
    
    :param raw_file: Path for json player data
    :type raw_file: Class
    """

    with open(raw_file, 'r') as f:
        player_data = json.load(f)

    total_statistics = []
    for year, data in player_data.items():

        statistics = {
            year: []
        }

        for player in data['resultSets'][0]['rowSet']:
            stat_dict = {
                'id': player[0],
                'ppg': player[20],
                'rpg': player[21],
                'apg': player[22],
            }

            statistics[year].append(stat_dict)
        
        total_statistics.append(statistics)

    latest_year = list(player_data.keys())[-1]
    players = []

    for player in player_data[latest_year]['resultSets'][0]['rowSet']:
        player_dict = {
            'id': player[0],
            'full_name': f'{player[2]} {player[1]}',
            'last_name': player[1],
            'first_name': player[2],
            'team_id': player[4],
            'jersey': player[10],
            'is_active': 'true' if player[19] is not None else 'false',
            'headshot': get_player_image_url(player_id=player[0]),
            'year_start': player[24],
            'year_end': player[25],
        }

        players.append(player_dict)

    with open(PROCESSED_DIR / 'player.json', 'w') as f:
        json.dump(players, f, indent=2)

    with open(PROCESSED_DIR / 'statistic.json', 'w') as f:
        json.dump(total_statistics, f, indent=2)


if __name__ == '__main__':
    process_player()
