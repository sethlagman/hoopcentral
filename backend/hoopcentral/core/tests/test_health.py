from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from core.models import IngestionRun


class HealthTests(TestCase):
    databases = {"default"}

    def setUp(self):
        self.client = APIClient()

    @patch("core.views.SEASON", "2025-26")
    def test_health_ok_without_ingestion(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(body["status"], "ok")
        self.assertEqual(body["database"], "ok")
        self.assertEqual(body["season"], "2025-26")
        self.assertIsNone(body["data_updated_at"])

    def test_health_reports_latest_success(self):
        finished = timezone.now() - timedelta(minutes=5)
        IngestionRun.objects.create(
            source="team",
            status=IngestionRun.Status.SUCCESS,
            finished_at=finished,
            created_count=30,
        )
        IngestionRun.objects.create(
            source="team",
            status=IngestionRun.Status.FAILED,
            finished_at=timezone.now(),
            error="boom",
        )
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.json()["data_updated_at"])

    @patch("core.views._database_ok", return_value=False)
    def test_health_database_down(self, _db_ok):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.json()["status"], "unavailable")
