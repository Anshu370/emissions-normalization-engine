from django.db import models

from common.models import BaseModel
from .company import Company


class IngestionBatch(BaseModel):

    SOURCE_TYPES = [
        ("SAP", "SAP"),
        ("UTILITY", "UTILITY"),
        ("TRAVEL", "TRAVEL"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "PENDING"),
        ("PROCESSING", "PROCESSING"),
        ("COMPLETED", "COMPLETED"),
        ("FAILED", "FAILED"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="ingestion_batches"
    )

    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_TYPES
    )

    uploaded_file = models.FileField(
        upload_to="uploads/"
    )

    original_file_name = models.CharField(
        max_length=255
    )

    total_rows = models.IntegerField(default=0)

    successful_rows = models.IntegerField(default=0)

    failed_rows = models.IntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    uploaded_by = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    class Meta:
        db_table = "ingestion_batches"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.company.name} - {self.source_type}"