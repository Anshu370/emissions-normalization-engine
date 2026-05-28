from django.db import models

from common.models import BaseModel
from .company import Company
from .ingestion_batch import IngestionBatch


class SAPRawRecord(BaseModel):

    NORMALIZATION_STATUS = [
        ("PENDING", "PENDING"),
        ("NORMALIZED", "NORMALIZED"),
        ("FAILED", "FAILED"),
        ("REVIEW_REQUIRED", "REVIEW_REQUIRED"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="sap_raw_records"
    )

    ingestion_batch = models.ForeignKey(
        IngestionBatch,
        on_delete=models.CASCADE,
        related_name="sap_raw_records"
    )

    raw_row_data = models.JSONField()

    row_number = models.IntegerField()

    normalization_status = models.CharField(
        max_length=30,
        choices=NORMALIZATION_STATUS,
        default="PENDING"
    )

    suspicious_flag = models.BooleanField(default=False)

    suspicious_reason = models.TextField(
        blank=True,
        null=True
    )

    error_message = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = "sap_raw_records"
        ordering = ["row_number"]

    def __str__(self):
        return f"SAP Row {self.row_number}"


class UtilityRawRecord(BaseModel):

    company = models.ForeignKey(
        "emissions.Company",
        on_delete=models.CASCADE
    )

    ingestion_batch = models.ForeignKey(
        "emissions.IngestionBatch",
        on_delete=models.CASCADE
    )

    raw_row_data = models.JSONField()

    row_number = models.IntegerField()

    normalization_status = models.CharField(
        max_length=50,
        default="PENDING"
    )

    suspicious_flag = models.BooleanField(
        default=False
    )

    suspicious_reason = models.TextField(
        null=True,
        blank=True
    )

    error_message = models.TextField(
        null=True,
        blank=True
    )

    def __str__(self):

        return (
            f"Utility Row "
            f"{self.row_number}"
        )


class TravelRawRecord(BaseModel):

    company = models.ForeignKey(
        "emissions.Company",
        on_delete=models.CASCADE
    )

    ingestion_batch = models.ForeignKey(
        "emissions.IngestionBatch",
        on_delete=models.CASCADE
    )

    raw_row_data = models.JSONField()

    row_number = models.IntegerField()

    normalization_status = models.CharField(
        max_length=50,
        default="PENDING"
    )

    suspicious_flag = models.BooleanField(
        default=False
    )

    suspicious_reason = models.TextField(
        null=True,
        blank=True
    )

    error_message = models.TextField(
        null=True,
        blank=True
    )

    def __str__(self):

        return (
            f"Travel Row "
            f"{self.row_number}"
        )