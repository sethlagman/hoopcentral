import os
from unittest.mock import patch

from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase

from hoopcentral.production import production_overrides


class ProductionSettingsTests(SimpleTestCase):
    def test_overrides_lock_down_http(self):
        env = {
            "SECRET_KEY": "prod-secret-key",
            "DJANGO_ALLOWED_HOSTS": "api.example.com, www.example.com",
            "CORS_ALLOWED_ORIGINS": "https://www.example.com",
            "CSRF_TRUSTED_ORIGINS": "https://www.example.com",
            "SECURE_SSL_REDIRECT": "True",
            "DB_CONN_MAX_AGE": "60",
        }
        with patch.dict(os.environ, env, clear=False):
            values = production_overrides("/app/hoopcentral")
        self.assertFalse(values["DEBUG"])
        self.assertEqual(values["ALLOWED_HOSTS"], ["api.example.com", "www.example.com"])
        self.assertTrue(values["SESSION_COOKIE_SECURE"])
        self.assertTrue(values["CSRF_COOKIE_SECURE"])
        self.assertTrue(values["SECURE_SSL_REDIRECT"])
        self.assertEqual(values["SECURE_PROXY_SSL_HEADER"], ("HTTP_X_FORWARDED_PROTO", "https"))
        self.assertEqual(values["CONN_MAX_AGE"], 60)
        self.assertEqual(values["CORS_ALLOWED_ORIGINS"], ["https://www.example.com"])
        self.assertEqual(values["X_FRAME_OPTIONS"], "DENY")

    def test_missing_secret_and_hosts_are_rejected(self):
        with patch.dict(os.environ, {"SECRET_KEY": "", "DJANGO_ALLOWED_HOSTS": ""}, clear=False):
            with self.assertRaises(ImproperlyConfigured):
                production_overrides("/tmp")
        with patch.dict(
            os.environ,
            {"SECRET_KEY": "prod-secret-key", "DJANGO_ALLOWED_HOSTS": ""},
            clear=False,
        ):
            with self.assertRaises(ImproperlyConfigured):
                production_overrides("/tmp")
