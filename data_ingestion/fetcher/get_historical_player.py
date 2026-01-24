import requests
import json
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'
API_URL = 'https://stats.nba.com/stats/playerindex'

def get_player_for_season(output_file, season):
    """
    Scrape player index data from NBA stats API for a specific season.
    """
    
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
        print(f"Fetching data for season {season}...")
        response = requests.get(API_URL, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        overall_data = {}
        if output_file.exists():
            with open(output_file, 'r') as f:
                try:
                    overall_data = json.load(f)
                except json.JSONDecodeError:
                    overall_data = {}

        overall_data[season] = data

        with open(output_file, 'w') as f:
            json.dump(overall_data, f, indent=2)
        
        print(f"Successfully saved {season} data to {output_file.name}")
        return True
        
    except Exception as e:
        print(f"Error fetching data for {season}: {e}")
        return False


def fetch_all_historical_players():
    """
    Loops through all seasons from 1996-97 to 2025-26 and fetches data.
    """
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / 'historical_player_data.json'
    
    start_year = 1996
    end_year = 2025 
    
    print(f"Starting historical data fetch into {output_path}...")
    
    for year in range(start_year, end_year + 1):
        
        season_str = f"{year}-{str(year + 1)[-2:]}"
        
        success = get_player_for_season(output_path, season_str)
        
        if success:
            time.sleep(0.8)
        else:
            print(f"Failed to retrieve data for {season_str}. Moving to next season.")

    print("Historical data fetch complete.")

if __name__ == '__main__':
    fetch_all_historical_players()
