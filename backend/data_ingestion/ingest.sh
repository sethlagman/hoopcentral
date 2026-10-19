#!/bin/sh
# One-shot ingestion job. Local Compose and an AWS task can both run this
# command. The web service does not call it.
set -eu

RAW_DIR=/app/data_ingestion/output/raw

run_fetcher() {
    raw_file=$1
    script=$2

    if [ -s "$raw_file" ]; then
        echo "Skipping $(basename "$script"): $(basename "$raw_file") already exists"
        return 0
    fi

    echo "Running $(basename "$script")"
    python "$script"
}

run_fetcher "$RAW_DIR/nba_player_data.json" /app/data_ingestion/fetcher/get_nba_player.py
run_fetcher "$RAW_DIR/nba_team_data.json" /app/data_ingestion/fetcher/get_nba_team.py
run_fetcher "$RAW_DIR/nba_standing_data.json" /app/data_ingestion/fetcher/get_nba_standing.py
run_fetcher "$RAW_DIR/nba_historical_player_data.json" /app/data_ingestion/fetcher/get_nba_historical_player.py
run_fetcher "$RAW_DIR/nba_historical_standing_data.json" /app/data_ingestion/fetcher/get_nba_historical_standing.py

echo "Processing raw data"
python /app/data_ingestion/processer/process_nba_player.py
python /app/data_ingestion/processer/process_nba_team.py
python /app/data_ingestion/processer/process_nba_standing.py

cd /app/hoopcentral
python manage.py migrate --noinput
python manage.py seed_team
python manage.py seed_standing
python manage.py seed_player
python manage.py seed_stat

echo "Ingestion complete"
