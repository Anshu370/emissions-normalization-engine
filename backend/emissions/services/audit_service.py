from django.db.models import Count, Sum, Q
from django.utils import timezone

from emissions.models.emission_record import EmissionRecord
from emissions.models.audit_log import AuditLog


class AuditService:

    @staticmethod
    def get_ready_batches():

        batches = (
            EmissionRecord.objects
            .values(
                "ingestion_batch_id",
                "source_type"
            )
            .annotate(
                total_records=Count("id"),

                approved_records=Count(
                    "id",
                    filter=Q(review_status="APPROVED")
                ),

                rejected_records=Count(
                    "id",
                    filter=Q(review_status="REJECTED")
                ),

                pending_records=Count(
                    "id",
                    filter=Q(review_status="PENDING")
                ),

                total_co2e_emissions=Sum(
                    "co2e_emissions"
                )
            )
        )

        ready_batches = []

        for batch in batches:

            if batch["pending_records"] == 0:

                ready_batches.append({
                    "batch_id": batch["ingestion_batch_id"],
                    "source_type": batch["source_type"],

                    "total_records": batch["total_records"],
                    "approved_records": batch["approved_records"],
                    "rejected_records": batch["rejected_records"],
                    "pending_records": batch["pending_records"],

                    "total_co2e_emissions":
                        batch["total_co2e_emissions"] or 0,

                    "ready_for_audit": True
                })

        return ready_batches

    @staticmethod
    def lock_batch(batch_id, auditor_name):

        records = EmissionRecord.objects.filter(
            ingestion_batch_id=batch_id,
            review_status="APPROVED"
        )

        if not records.exists():
            raise ValueError(
                "No approved records found for audit"
            )

        locked_count = 0

        for record in records:

            if not record.audit_locked:

                record.audit_locked = True
                record.save()

                AuditLog.objects.create(
                    emission_record=record,
                    action="LOCKED",
                    performed_by=auditor_name
                )

                locked_count += 1

        return {
            "batch_id": str(batch_id),
            "locked_records": locked_count,
            "locked_by": auditor_name,
            "locked_at": timezone.now()
        }