"""NBA season string parsing and statistic rows filtered by career window years."""


def season_start_year(season):
    """NBA season keys (e.g. '2024-25') → first calendar year of that league year."""
    if not season:
        return None
    season = str(season).strip()
    if "-" in season:
        head = season.split("-", 1)[0].strip()
        if head.isdigit():
            return int(head)
        return None
    if season.isdigit() and len(season) >= 4:
        return int(season[:4])
    return None


def season_lookup_variants(season_param):
    """
    Match DB rows whether the client sends a start year ('2000') or NBA-style
    key ('2000-01'). Both forms are included so filters work either way.
    """
    raw = str(season_param).strip()
    if not raw:
        return [raw]
    variants = [raw]
    if raw.isdigit() and len(raw) == 4:
        y = int(raw)
        variants.append(f"{y}-{str(y + 1)[-2:]}")
    elif "-" in raw:
        head = raw.split("-", 1)[0].strip()
        if head.isdigit() and len(head) == 4:
            variants.append(head)
    return list(dict.fromkeys(variants))


def resolve_season_start_year(season_param, variants):
    """League start calendar year for the requested season (see season_start_year)."""
    for v in variants:
        y = season_start_year(v)
        if y is not None:
            return y
    return season_start_year(str(season_param).strip())


def stats_within_career_years(queryset, year_start, year_end):
    """
    Statistic rows whose season's league start year is in [year_start, year_end]
    (inclusive). Uses the same season-year rules as season_start_year.
    If years are not valid integers, returns queryset ordered by season unchanged.
    """
    try:
        ymin = int(str(year_start).strip())
    except (TypeError, ValueError):
        ymin = None
    try:
        ymax = int(str(year_end).strip())
    except (TypeError, ValueError):
        ymax = None

    if ymin is None and ymax is None:
        return queryset.order_by("season")

    pks = []
    for pk, season in queryset.values_list("pk", "season"):
        y = season_start_year(season)
        if y is None:
            continue
        if ymin is not None and y < ymin:
            continue
        if ymax is not None and y > ymax:
            continue
        pks.append(pk)
    return queryset.filter(pk__in=pks).order_by("season")


def resolved_season_label(variants):
    """Human-readable season key for responses (prefer '2025-26' over bare '2025')."""
    if not variants:
        return ""
    for v in variants:
        if v and "-" in str(v):
            return str(v).strip()
    return str(variants[0]).strip()
