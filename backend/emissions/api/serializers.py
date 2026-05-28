from rest_framework import serializers

from emissions.models.emission_record import EmissionRecord

class EmissionRecordSerializer(serializers.ModelSerializer):

    class Meta:

        model = EmissionRecord

        fields = [

            "id",

            "source_type",

            "scope_category",

            "activity_type",

            "raw_quantity",

            "raw_unit",

            "normalized_quantity",

            "normalized_unit",

            "vendor_name",

            "suspicious_flag",

            "suspicious_reason",

            "review_status",

            "created_at"
        ]

class RecordReviewSerializer(serializers.Serializer):

    reviewed_by = serializers.CharField(required=True)

    comment = serializers.CharField(
        required=False,
        allow_blank=True
    )

class LockRecordSerializer(serializers.Serializer):

    locked_by = serializers.CharField(required=True)

class BatchAuditLockSerializer(serializers.Serializer):

    auditor_name = serializers.CharField(required=True)

