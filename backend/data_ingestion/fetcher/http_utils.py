"""GET with retries for the stats.nba.com fetchers."""
import sys
import time
from pathlib import Path

import requests

_INGEST = Path(__file__).resolve().parent.parent
if str(_INGEST) not in sys.path:
    sys.path.insert(0, str(_INGEST))

from log import get_logger

LOG = get_logger('hoopcentral.ingestion.http')

# stats.nba.com is slow and drops connections often.
DEFAULT_TIMEOUT = 45
DEFAULT_MAX_RETRIES = 5
DEFAULT_BACKOFF_BASE = 1.0
DEFAULT_BACKOFF_FACTOR = 2.0

RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}

RETRYABLE_EXCEPTIONS = (
    requests.exceptions.Timeout,
    requests.exceptions.ConnectionError,
    requests.exceptions.ChunkedEncodingError,
    requests.exceptions.ReadTimeout,
    requests.exceptions.ConnectTimeout,
)


def get_with_retry(
    url,
    params=None,
    headers=None,
    timeout=DEFAULT_TIMEOUT,
    max_retries=DEFAULT_MAX_RETRIES,
    backoff_base=DEFAULT_BACKOFF_BASE,
    backoff_factor=DEFAULT_BACKOFF_FACTOR,
    raise_for_status=True,
):
    """
    GET with retries on timeouts, connection errors, 429, and 5xx.

    :param max_retries: Total attempts, including the first.
    :param backoff_base: Delay in seconds before the first retry.
    :param backoff_factor: Delay multiplier after each failure (capped at 60s).
    :param raise_for_status: When False, retryable status codes are not retried.
    :raises: The last exception once retries are exhausted.
    """
    params = params or {}
    headers = headers or {}
    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=timeout,
            )
            if raise_for_status:
                if response.status_code in RETRYABLE_STATUS_CODES and attempt < max_retries:
                    last_exception = requests.exceptions.HTTPError(
                        f"HTTP {response.status_code}: {response.reason}", response=response
                    )
                    _log_retry(attempt, max_retries, response.status_code, last_exception)
                    _sleep_before_retry(attempt, max_retries, backoff_base, backoff_factor)
                    continue
                response.raise_for_status()
            return response
        except RETRYABLE_EXCEPTIONS as e:
            last_exception = e
            _log_retry(attempt, max_retries, None, e)
            if attempt == max_retries:
                raise
            _sleep_before_retry(attempt, max_retries, backoff_base, backoff_factor)
        except requests.exceptions.HTTPError as e:
            last_exception = e
            if e.response is not None and e.response.status_code in RETRYABLE_STATUS_CODES and attempt < max_retries:
                _log_retry(attempt, max_retries, e.response.status_code, e)
                _sleep_before_retry(attempt, max_retries, backoff_base, backoff_factor)
            else:
                raise

    if last_exception is not None:
        raise last_exception
    return response


def _log_retry(attempt, max_retries, status_code, error):
    status = f" (HTTP {status_code})" if status_code else ""
    LOG.warning("Attempt %s/%s failed%s: %s. Retrying...", attempt, max_retries, status, error)


def _sleep_before_retry(attempt, max_retries, backoff_base, backoff_factor):
    if attempt >= max_retries:
        return
    delay = backoff_base * (backoff_factor ** (attempt - 1))
    delay = min(delay, 60)
    LOG.info("Waiting %.1fs before retry...", delay)
    time.sleep(delay)
