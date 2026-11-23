"""Shared idempotent seeding and ingestion-run accounting."""

import os
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.management.base import CommandError
from django.db import models
from django.utils import timezone

from core.models import IngestionRun
from core.season_utils import canonical_season


class SeedTally:
    def __init__(self):
        self.created = 0
        self.updated = 0
        self.unchanged = 0
        self.skipped = 0

    def add(self, outcome):
        setattr(self, outcome, getattr(self, outcome) + 1)

    def as_message(self, label):
        return (
            f'{label} (created={self.created} updated={self.updated} '
            f'unchanged={self.unchanged} skipped={self.skipped})'
        )


def processed_path(filename):
    return os.path.abspath(
        os.path.join(
            settings.BASE_DIR,
            '..',
            'data_ingestion',
            'output',
            'processed',
            filename,
        )
    )


def start_run(source):
    return IngestionRun.objects.create(source=source, status=IngestionRun.Status.RUNNING)


def finish_run(run, tally, status, error=''):
    run.status = status
    run.finished_at = timezone.now()
    run.created_count = tally.created
    run.updated_count = tally.updated
    run.unchanged_count = tally.unchanged
    run.skipped_count = tally.skipped
    run.error = (error or '')[:4000]
    run.save()


def _differs(obj, field, new_value):
    if isinstance(new_value, models.Model):
        return getattr(obj, f'{field}_id') != new_value.pk
    current = getattr(obj, field)
    if isinstance(current, Decimal) or isinstance(new_value, Decimal):
        if current is None or new_value is None:
            return current is not new_value
        return Decimal(current) != Decimal(new_value)
    return current != new_value


def upsert(model, lookup, defaults):
    """Insert, update changed fields, or leave the row alone when nothing changed."""

    obj = model.objects.filter(**lookup).first()
    if obj is None:
        model.objects.create(**lookup, **defaults)
        return 'created'
    changed = False
    for field, new_value in defaults.items():
        if _differs(obj, field, new_value):
            setattr(obj, field, new_value)
            changed = True
    if not changed:
        return 'unchanged'
    obj.save()
    return 'updated'


def coerce_decimal(value, places):
    if value is None or value == '':
        return None
    try:
        quant = Decimal('1').scaleb(-places)
        return Decimal(str(value)).quantize(quant)
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(str(exc)) from exc


def coerce_int(value):
    if value is None or value == '':
        return None
    return int(value)


def as_text(value, default=''):
    if value is None:
        return default
    return str(value).strip()


def as_bool(value):
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {'1', 'true', 'yes'}


def run_seed(source, label, stdout, style, loader):
    """Run ``loader(tally)`` and record one success or failure row."""

    run = start_run(source)
    tally = SeedTally()
    try:
        loader(tally)
    except CommandError as exc:
        finish_run(run, tally, IngestionRun.Status.FAILED, str(exc))
        raise
    except Exception as exc:
        finish_run(run, tally, IngestionRun.Status.FAILED, str(exc))
        raise CommandError(str(exc)) from exc
    finish_run(run, tally, IngestionRun.Status.SUCCESS)
    stdout.write(style.SUCCESS(tally.as_message(label)))


__all__ = [
    'as_bool',
    'as_text',
    'canonical_season',
    'coerce_decimal',
    'coerce_int',
    'processed_path',
    'run_seed',
    'upsert',
]
