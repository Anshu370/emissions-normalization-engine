from django.utils import timezone
from emissions.models.audit_log import AuditLog

class ReviewService:

    @staticmethod
    def approve_record(record, reviewed_by):

        if record.audit_locked:
            raise ValueError("Record is locked for audit")

        if record.review_status != "PENDING":
            raise ValueError("Record already reviewed")

        record.review_status = "APPROVED"
        record.reviewed_by = reviewed_by
        record.reviewed_at = timezone.now()

        record.save()

        AuditLog.objects.create(
            emission_record=record,
            action="APPROVED",
            performed_by=reviewed_by
        )

        return record

    @staticmethod
    def reject_record(record, reviewed_by, comment=None):

        if record.audit_locked:
            raise ValueError("Record is locked for audit")

        if record.review_status != "PENDING":
            raise ValueError("Record already reviewed")

        record.review_status = "REJECTED"
        record.reviewed_by = reviewed_by
        record.reviewed_at = timezone.now()
        record.review_comment = comment

        record.save()

        AuditLog.objects.create(
            emission_record=record,
            action="REJECTED",
            performed_by=reviewed_by,
            comment=comment
        )

        return record

    @staticmethod
    def lock_record(record, locked_by):

        if record.audit_locked:
            raise ValueError("Record already locked")

        if record.review_status != "APPROVED":
            raise ValueError(
                "Only approved records can be locked"
            )

        record.audit_locked = True

        record.save()

        AuditLog.objects.create(
            emission_record=record,
            action="LOCKED",
            performed_by=locked_by
        )

        return record
