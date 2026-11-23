"""
Production settings.

Use ``DJANGO_SETTINGS_MODULE=hoopcentral.settings_prod``. Local Docker and tests
keep ``hoopcentral.settings`` so HTTPS redirects are not forced in development.
"""

from .production import production_overrides
from .settings import *  # noqa: F403
from .settings import BASE_DIR, DATABASES

_prod = production_overrides(BASE_DIR)
DEBUG = _prod['DEBUG']
SECRET_KEY = _prod['SECRET_KEY']
ALLOWED_HOSTS = _prod['ALLOWED_HOSTS']
STATIC_ROOT = _prod['STATIC_ROOT']
SECURE_CONTENT_TYPE_NOSNIFF = _prod['SECURE_CONTENT_TYPE_NOSNIFF']
SECURE_SSL_REDIRECT = _prod['SECURE_SSL_REDIRECT']
SECURE_HSTS_SECONDS = _prod['SECURE_HSTS_SECONDS']
SECURE_HSTS_INCLUDE_SUBDOMAINS = _prod['SECURE_HSTS_INCLUDE_SUBDOMAINS']
SECURE_PROXY_SSL_HEADER = _prod['SECURE_PROXY_SSL_HEADER']
SESSION_COOKIE_SECURE = _prod['SESSION_COOKIE_SECURE']
CSRF_COOKIE_SECURE = _prod['CSRF_COOKIE_SECURE']
SECURE_REFERRER_POLICY = _prod['SECURE_REFERRER_POLICY']
X_FRAME_OPTIONS = _prod['X_FRAME_OPTIONS']
CORS_ALLOWED_ORIGINS = _prod['CORS_ALLOWED_ORIGINS']
CSRF_TRUSTED_ORIGINS = _prod['CSRF_TRUSTED_ORIGINS']
DATABASES['default']['CONN_MAX_AGE'] = _prod['CONN_MAX_AGE']
