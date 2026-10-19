#!/bin/sh
# One-shot ingestion job. Local Compose and an AWS task can both run this
# command. The web service does not call it.
set -eu

RAW_DIR=/app/data_ingestion/output/raw
PLAYER_FILE=$RAW_DIR/nba_player_data.json
STANDING_FILE=$RAW_DIR/nba_standing_data.json
HISTORICAL_PLAYER_FILE=$RAW_DIR/nba_historical_player_data.json
HISTORICAL_STANDING_FILE=$RAW_DIR/nba_historical_standing_data.json

rename_historical() {
    historical=$1
    standard=$2

    if [ ! -s "$historical" ]; then
        echo "Cannot rename $(basename "$historical"): file is missing or empty"
        return 1
    fi

    if [ -e "$standard" ]; then
        rm -f "$historical"
        echo "Kept $(basename "$standard") and removed leftover $(basename "$historical")"
        return 0
    fi

    mv "$historical" "$standard"
    echo "Renamed $(basename "$historical") to $(basename "$standard")"
}

initialize_or_refresh() {
    standard=$1
    historical=$2
    historical_script=$3
    normal_script=$4
    label=$5

    if [ -s "$standard" ]; then
        echo "$label data exists. Refreshing with $(basename "$normal_script")"
        python "$normal_script"
        if [ -e "$historical" ]; then
            rm -f "$historical"
        fi
        return 0
    fi

    echo "No existing $label data. Initializing with $(basename "$historical_script")"
    if [ ! -s "$historical" ]; then
        python "$historical_script"
    else
        echo "$(basename "$historical") already exists. Skipping $(basename "$historical_script")"
    fi
    rename_historical "$historical" "$standard"
}

initialize_or_refresh \
    "$PLAYER_FILE" \
    "$HISTORICAL_PLAYER_FILE" \
    /app/data_ingestion/fetcher/get_nba_historical_player.py \
    /app/data_ingestion/fetcher/get_nba_player.py \
    "Player"

initialize_or_refresh \
    "$STANDING_FILE" \
    "$HISTORICAL_STANDING_FILE" \
    /app/data_ingestion/fetcher/get_nba_historical_standing.py \
    /app/data_ingestion/fetcher/get_nba_standing.py \
    "Standing"

echo "Refreshing team data"
python /app/data_ingestion/fetcher/get_nba_team.py

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
