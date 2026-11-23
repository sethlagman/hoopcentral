"""JSON shape checks shared by fetchers and processors."""

import json
from pathlib import Path


class InvalidPayload(ValueError):
    """Raw or processed JSON does not match the shape the pipeline expects."""


def load_json(path):
    file_path = Path(path)
    try:
        with open(file_path, encoding='utf-8') as handle:
            return json.load(handle)
    except json.JSONDecodeError as exc:
        raise InvalidPayload(f'{file_path.name} is not valid JSON') from exc


def assert_result_set(payload, label):
    """stats.nba.com payloads keep rows in ``resultSets[0].rowSet``."""

    headers, rows = first_result_set(payload, label)
    return headers, rows


def first_result_set(payload, label):
    if not isinstance(payload, dict):
        raise InvalidPayload(f'{label} must be a JSON object')
    sets = payload.get('resultSets')
    if not isinstance(sets, list) or not sets or not isinstance(sets[0], dict):
        raise InvalidPayload(f'{label} is missing resultSets')
    rows = sets[0].get('rowSet')
    if not isinstance(rows, list):
        raise InvalidPayload(f'{label} is missing rowSet')
    headers = sets[0].get('headers') or []
    if not isinstance(headers, list):
        raise InvalidPayload(f'{label} headers must be a list')
    return headers, rows


def assert_team_list(payload):
    if not isinstance(payload, list) or not payload:
        raise InvalidPayload('Team payload must be a non-empty JSON array')
    if not any(isinstance(team, dict) and team.get('id') not in (None, '') for team in payload):
        raise InvalidPayload('Team payload has no team id')
    return payload


def assert_schedule_payload(payload):
    if not isinstance(payload, dict):
        raise InvalidPayload('Schedule payload must be a JSON object')
    schedule = payload.get('leagueSchedule') or payload
    if not isinstance(schedule, dict):
        raise InvalidPayload('Schedule payload is missing leagueSchedule')
    dates = schedule.get('gameDates')
    if dates is None:
        raise InvalidPayload('Schedule payload is missing gameDates')
    if not isinstance(dates, list):
        raise InvalidPayload('Schedule gameDates must be a list')
    return payload


def column_positions(headers, spec):
    """Map field names to header indexes, falling back to the known positional index."""

    lookup = {}
    if isinstance(headers, list):
        lookup = {str(name): index for index, name in enumerate(headers)}
    positions = {}
    for key, (header, fallback) in spec.items():
        positions[key] = lookup.get(header, fallback)
    return positions


def row_value(row, positions, key):
    if not isinstance(row, (list, tuple)):
        return None
    index = positions[key]
    if index is None or index < 0 or index >= len(row):
        return None
    return row[index]
