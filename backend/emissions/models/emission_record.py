from django.db import models

from common.models import BaseModel
from .company import Company
from .ingestion_batch import IngestionBatch



class EmissionRecord(BaseModel):

    REVIEW_STATUS = [
        ("PENDING", "PENDING"),
        ("APPROVED", "APPROVED"),
        ("REJECTED", "REJECTED"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="emission_records"
    )

    ingestion_batch = models.ForeignKey(
        IngestionBatch,
        on_delete=models.CASCADE,
        related_name="emission_records"
    )

    source_record_id = models.UUIDField(
        null=True,
        blank=True
    )

    source_type = models.CharField(max_length=50)

    scope_category = models.CharField(max_length=50)

    activity_type = models.CharField(max_length=100)

    facility_code = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    raw_quantity = models.FloatField()

    raw_unit = models.CharField(max_length=50)

    normalized_quantity = models.FloatField()

    normalized_unit = models.CharField(max_length=50)

    emission_factor = models.FloatField(
        blank=True,
        null=True
    )

    co2e_emissions = models.FloatField(
        blank=True,
        null=True
    )

    activity_date = models.DateField(
        blank=True,
        null=True
    )

    vendor_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    confidence_score = models.FloatField(default=1.0)

    suspicious_flag = models.BooleanField(default=False)

    suspicious_reason = models.TextField(
        blank=True,
        null=True
    )

    review_status = models.CharField(
        max_length=20,
        choices=REVIEW_STATUS,
        default="PENDING"
    )

    approved_by = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    approved_at = models.DateTimeField(
        blank=True,
        null=True
    )

    review_comment = models.TextField(null=True, blank=True)

    reviewed_by = models.CharField(max_length=255, null=True, blank=True)

    reviewed_at = models.DateTimeField(null=True, blank=True)

    audit_locked = models.BooleanField(default=False)


    class Meta:
        db_table = "emission_records"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.activity_type} - {self.scope_category}"