from django.urls import path

from .views import CSVUploadAPIView, DashboardSummaryAPIView, BatchRecordsAPIView, ApproveRecordAPIView, \
    RejectRecordAPIView, LockRecordAPIView, ReadyForAuditAPIView, LockBatchAuditAPIView

urlpatterns = [

    path(
        "upload/",
        CSVUploadAPIView.as_view(),
        name="csv-upload"
    ),

    path(
        "dashboard/summary/",
        DashboardSummaryAPIView.as_view(),
        name="dashboard-summary"
    ),

    path(
        "batches/<uuid:batch_id>/records/",
        BatchRecordsAPIView.as_view(),
        name="batch-records"
    ),

    path(
        "records/<uuid:id>/approve/",
        ApproveRecordAPIView.as_view(),
        name="record-approve"
    ),

    path(
        "records/<uuid:id>/reject/",
        RejectRecordAPIView.as_view(),
        name="record-reject"
    ),

    path(
        "records/<uuid:id>/lock/",
        LockRecordAPIView.as_view(),
        name="record-lock"
    ),

    path(
        "audit/ready/",
        ReadyForAuditAPIView.as_view(),
        name="audit-ready"
    ),

    path(
        "audit/<uuid:batch_id>/lock/",
        LockBatchAuditAPIView.as_view(),
        name="audit-lock"
    ),
]