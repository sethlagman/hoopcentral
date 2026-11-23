"""Helpers processors can import without starting Django."""

import sys
from pathlib import Path

_HOOPCENTRAL = Path(__file__).resolve().parents[1] / 'hoopcentral'
if str(_HOOPCENTRAL) not in sys.path:
    sys.path.insert(0, str(_HOOPCENTRAL))

from core.season_utils import canonical_season  # noqa: E402

__all__ = ['canonical_season']
