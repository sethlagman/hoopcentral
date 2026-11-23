"""Values applied by ``hoopcentral.settings_prod``. Local settings stay unchanged."""

import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured


def _flag(name, default):
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {'1', 'true', 'yes'}


def _csv(name):
    return [item.strip() for item in os.environ.get(name, '').split(',') if item.strip()]


def production_overrides(base_dir):
    secret = (os.environ.get('SECRET_KEY') or '').strip()
    if not secret:
        raise ImproperlyConfigured('SECRET_KEY is required when using production settings')
    hosts = _csv('DJANGO_ALLOWED_HOSTS')
    if not hosts:
        raise ImproperlyConfigured(
            'DJANGO_ALLOWED_HOSTS is required when using production settings'
        )
    try:
        hsts_seconds = int(os.environ.get('SECURE_HSTS_SECONDS', '3600'))
        conn_max_age = int(os.environ.get('DB_CONN_MAX_AGE', '60'))
    except ValueError as exc:
        raise ImproperlyConfigured('SECURE_HSTS_SECONDS and DB_CONN_MAX_AGE must be integers') from exc
    return {
        'DEBUG': False,
        'SECRET_KEY': secret,
        'ALLOWED_HOSTS': hosts,
        'STATIC_ROOT': Path(base_dir) / 'staticfiles',
        'SECURE_CONTENT_TYPE_NOSNIFF': True,
        'SECURE_SSL_REDIRECT': _flag('SECURE_SSL_REDIRECT', True),
        'SECURE_HSTS_SECONDS': hsts_seconds,
        'SECURE_HSTS_INCLUDE_SUBDOMAINS': True,
        'SECURE_PROXY_SSL_HEADER': ('HTTP_X_FORWARDED_PROTO', 'https'),
        'SESSION_COOKIE_SECURE': True,
        'CSRF_COOKIE_SECURE': True,
        'SECURE_REFERRER_POLICY': 'same-origin',
        'X_FRAME_OPTIONS': 'DENY',
        'CONN_MAX_AGE': conn_max_age,
        # Empty until the deployed frontend origin is set. Localhost stays in dev settings.
        'CORS_ALLOWED_ORIGINS': _csv('CORS_ALLOWED_ORIGINS'),
        'CSRF_TRUSTED_ORIGINS': _csv('CSRF_TRUSTED_ORIGINS'),
    }
