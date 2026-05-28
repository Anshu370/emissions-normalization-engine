from django.db import models

from emissions.models.emission_record import EmissionRecord


class AuditLog(models.Model):

    ACTIONS = [
        ("APPROVED", "APPROVED"),
        ("REJECTED", "REJECTED"),
        ("LOCKED", "LOCKED"),
    ]

    emission_record = models.ForeignKey(
        EmissionRecord,
        on_delete=models.CASCADE,
        related_name="audit_logs"
    )

    action = models.CharField(
        max_length=50,
        choices=ACTIONS
    )

    performed_by = models.CharField(
        max_length=255
    )

    comment = models.TextField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.action} - {self.emission_record_id}"