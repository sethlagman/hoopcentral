import json
from pathlib import Path

BASE_DIR = BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'

def process_standing(raw_file=RAW_DIR / 'standing_data.json'):
    """
    Extract necessary standing info from the json file
    
    :param raw_file: Path for json team standing data
    :type raw_file: Class
    """

    with open(raw_file, 'r') as f:
        standing_data = json.load(f)
    
    standings = []

    for year, data in standing_data.items():

        year_data = {
            year: []
        }

        for standing in data['resultSets'][0]['rowSet']:
            
            standing_dict = {
                'id': standing[2],
                'conference': standing[6],
                'conference_record': standing[7],
                'division_record': standing[11],
                'wins': standing[13],
                'losses': standing[14],
                'winrate': standing[15],
                'home': standing[18],
                'road': standing[19],
                'last10': standing[20],
                'overtime': standing[23],
                'winstreak': standing[32],
            }
            
            year_data[year].append(standing_dict)
        
        standings.append(year_data)

    with open(PROCESSED_DIR / 'standing.json', 'w') as f:
        json.dump(standings, f, indent=2)


if __name__ == '__main__':
    process_standing()
