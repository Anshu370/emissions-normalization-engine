from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from emissions.serializers.upload_serializer import CSVUploadSerializer
from emissions.services.sap_processor import SAPProcessor
from emissions.services.utility_processor import UtilityProcessor
from emissions.services.travel_processor import TravelProcessor
from emissions.services.audit_service import AuditService

from emissions.models.emission_record import EmissionRecord

from emissions.api.serializers import EmissionRecordSerializer, RecordReviewSerializer, LockRecordSerializer
from emissions.api.serializers import BatchAuditLockSerializer

from emissions.services.review_service import ReviewService

import pandas as pd
from emissions.services.source_detector import SourceDetector

class CSVUploadAPIView(APIView):

    def post(self, request):

        serializer = CSVUploadSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_file = serializer.validated_data["file"]

        try:

            df = pd.read_csv(uploaded_file)

            detected_source = SourceDetector.detect(
                df.columns.tolist()
            )

            uploaded_file.seek(0)

            if detected_source == "SAP":
                batch = SAPProcessor.process_csv(
                    uploaded_file=uploaded_file
                )
                # print(str(batch.id))
                return Response(
                    {
                        "message": "SAP CSV processed",
                        "batch_id": str(batch.id)
                    },
                    status=status.HTTP_201_CREATED
                )

            if detected_source == "UTILITY":
                batch = UtilityProcessor.process_csv(
                    uploaded_file=uploaded_file
                )

                return Response(
                    {
                        "message": "UTILITY CSV processed",
                        "batch_id": str(batch.id)
                    },
                    status=status.HTTP_201_CREATED
                )

            if detected_source == "TRAVEL":
                batch = TravelProcessor.process_csv(
                    uploaded_file=uploaded_file
                )

                return Response(
                    {
                        "message": "TRAVEL CSV processed",
                        "batch_id": str(batch.id)
                    },
                    status=status.HTTP_201_CREATED
                )

            return Response(
                {
                    "error": "Unknown source type"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as error:

            return Response(
                {
                    "error": str(error)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class DashboardSummaryAPIView(APIView):

    def get(self, request):

        total_records = EmissionRecord.objects.count()

        approved_records = EmissionRecord.objects.filter(
            review_status="APPROVED"
        ).count()

        pending_records = EmissionRecord.objects.filter(
            review_status="PENDING"
        ).count()

        suspicious_records = EmissionRecord.objects.filter(
            suspicious_flag=True
        ).count()

        return Response(
            {
                "total_records": total_records,
                "approved_records": approved_records,
                "pending_records": pending_records,
                "suspicious_records": suspicious_records
            }
        )


class BatchRecordsAPIView(APIView):

    def get(self, request, batch_id):

        records = (
            EmissionRecord.objects.filter(
                ingestion_batch_id=batch_id
            )
            .order_by("-created_at")
        )

        serializer = (
            EmissionRecordSerializer(
                records,
                many=True
            )
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class ApproveRecordAPIView(APIView):

    def post(self, request, id):

        serializer = RecordReviewSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        try:
            record = EmissionRecord.objects.get(id=id)

            ReviewService.approve_record(
                record=record,
                reviewed_by=serializer.validated_data["reviewed_by"]
            )

            return Response(
                {
                    "message": "Record approved successfully",
                    "record_id": str(record.id),
                    "review_status": record.review_status
                },
                status=status.HTTP_200_OK
            )

        except EmissionRecord.DoesNotExist:

            return Response(
                {
                    "error": "Record not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except ValueError as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

class RejectRecordAPIView(APIView):

    def post(self, request, id):

        serializer = RecordReviewSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        try:
            record = EmissionRecord.objects.get(id=id)

            ReviewService.reject_record(
                record=record,
                reviewed_by=serializer.validated_data["reviewed_by"],
                comment=serializer.validated_data.get("comment")
            )

            return Response(
                {
                    "message": "Record rejected successfully",
                    "record_id": str(record.id),
                    "review_status": record.review_status
                },
                status=status.HTTP_200_OK
            )

        except EmissionRecord.DoesNotExist:

            return Response(
                {
                    "error": "Record not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except ValueError as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

class LockRecordAPIView(APIView):

    def post(self, request, id):

        serializer = LockRecordSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:
            record = EmissionRecord.objects.get(id=id)

            ReviewService.lock_record(
                record=record,
                locked_by=serializer.validated_data["locked_by"]
            )

            return Response(
                {
                    "message": "Record locked for audit",
                    "record_id": str(record.id),
                    "audit_locked": True
                },
                status=status.HTTP_200_OK
            )

        except EmissionRecord.DoesNotExist:

            return Response(
                {
                    "error": "Record not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except ValueError as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

class ReadyForAuditAPIView(APIView):

    def get(self, request):

        batches = AuditService.get_ready_batches()

        return Response(
            batches,
            status=status.HTTP_200_OK
        )

class LockBatchAuditAPIView(APIView):

    def post(self, request, batch_id):

        serializer = BatchAuditLockSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        try:

            result = AuditService.lock_batch(
                batch_id=batch_id,
                auditor_name=serializer.validated_data[
                    "auditor_name"
                ]
            )

            return Response(
                {
                    "message":
                        "Batch locked successfully",

                    **result
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
