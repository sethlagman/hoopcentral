"""
Shared HTTP utilities for API fetchers.
Provides retry logic for timeouts, connection errors, and transient server errors.
"""
import time
import requests

# Defaults: longer timeout and retries to handle flaky API calls
DEFAULT_TIMEOUT = 45
DEFAULT_MAX_RETRIES = 5
DEFAULT_BACKOFF_BASE = 1.0
DEFAULT_BACKOFF_FACTOR = 2.0

# HTTP status codes that are worth retrying (transient errors)
RETRYABLE_STATUS_CODES = {408, 429, 500, 502, 503, 504}

# Exception types that trigger a retry
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
    Perform a GET request with retries on timeout, connection errors, and 5xx/429.

    :param url: Request URL
    :param params: Optional query params dict
    :param headers: Optional headers dict
    :param timeout: Request timeout in seconds
    :param max_retries: Number of attempts (including the first)
    :param backoff_base: Initial delay in seconds before first retry
    :param backoff_factor: Multiplier for delay after each failure
    :param raise_for_status: If True, call response.raise_for_status() on success
    :return: Response object
    :raises: Last request exception if all retries fail
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
    print(f"Attempt {attempt}/{max_retries} failed{status}: {error}. Retrying...")


def _sleep_before_retry(attempt, max_retries, backoff_base, backoff_factor):
    if attempt >= max_retries:
        return
    delay = backoff_base * (backoff_factor ** (attempt - 1))
    delay = min(delay, 60)  # Cap at 60 seconds
    print(f"Waiting {delay:.1f}s before retry...")
    time.sleep(delay)
