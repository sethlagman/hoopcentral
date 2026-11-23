"""Stderr logger for ingestion scripts that run outside Django."""

import logging
import sys

_FORMAT = '%(asctime)s %(levelname)s %(name)s %(message)s'


def get_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    if logger.handlers or logging.getLogger().handlers:
        return logger
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(logging.Formatter(_FORMAT))
    logger.addHandler(handler)
    logger.propagate = False
    return logger
