import requests
import json
from pathlib import Path

BASE_DIR = BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'
API_URL = 'https://stats.nba.com/stats/playerindex'

def get_player(output_file=OUTPUT_DIR / 'player_data.json', season='2025-26'):
    """
    Scrape player index data from NBA stats API.
    
    This function accesses the playerindex endpoint that nba.com/players uses
    to fetch player data. It mimics a browser request with proper headers.
    
    :param output_file: Path to save the JSON response
    :type output_file: str
    """
    
    # API endpoint URL
    url = API_URL
    
    # Query parameters
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
    
    # Headers to mimic a browser request from nba.com/players
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
        print(f"Fetching data from {url}...")
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Parse JSON response
        data = response.json()
        
        with open(output_file, 'r') as f:
            overall_data = json.load(f)

        overall_data[season] = data

        with open(output_file, 'w') as f:
            json.dump(overall_data, f, indent=2)
        
        print(f"Successfully downloaded and saved to {output_file}")
        print(f"Response status: {response.status_code}")
        
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        raise
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        raise


if __name__ == '__main__':
    get_player()
