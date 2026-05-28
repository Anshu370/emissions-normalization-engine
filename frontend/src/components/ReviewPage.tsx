import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Check, X, User, MessageSquare } from 'lucide-react';

interface Record {
  id: string;
  source_type: string;
  activity_type: string;
  raw_quantity: number;
  normalized_unit: string;
  review_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  suspicious_reason?: string;
}

interface ReviewPageProps {
  batchId: string;
  onBack: () => void;
  onAudit: () => void;
}

export default function ReviewPage({ batchId, onBack, onAudit }: ReviewPageProps) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [showReviewerModal, setShowReviewerModal] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRecordId, setRejectRecordId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState<string>('');
  const [showAuditModal, setShowAuditModal] = useState(false);

  useEffect(() => {
    if (reviewerName) {
      fetchRecords();
    }
  }, [batchId, reviewerName]);

  // Check if all records are reviewed
  useEffect(() => {
    const allReviewed = records.length > 0 && records.every(r => r.review_status !== 'PENDING');
    if (allReviewed && records.length > 0) {
      setShowAuditModal(true);
    }
  }, [records]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND;
      const response = await fetch(`${backendUrl}/api/batches/${batchId}/records/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      } else {
        setError('Failed to load records');
      }
    } catch (err) {
      setError('Failed to fetch records');
      console.error('Records fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewerSubmit = () => {
    if (reviewerName.trim()) {
      setShowReviewerModal(false);
    }
  };

  const handleApprove = async (recordId: string) => {
    try {
      setApprovingId(recordId);
      const backendUrl = import.meta.env.VITE_BACKEND;

      const response = await fetch(`${backendUrl}/api/records/${recordId}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewed_by: reviewerName
        }),
      });

      if (response.ok) {
        setRecords(records.map(r =>
          r.id === recordId ? { ...r, review_status: 'APPROVED' as const } : r
        ));
      } else {
        setError('Failed to approve record');
      }
    } catch (err) {
      setError('Failed to approve record');
      console.error('Approve error:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectClick = (recordId: string) => {
    setRejectRecordId(recordId);
    setRejectComment('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectRecordId || !rejectComment.trim()) return;

    try {
      setRejectingId(rejectRecordId);
      const backendUrl = import.meta.env.VITE_BACKEND;

      const response = await fetch(`${backendUrl}/api/records/${rejectRecordId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewed_by: reviewerName,
          comment: rejectComment.trim()
        }),
      });

      if (response.ok) {
        setRecords(records.map(r =>
          r.id === rejectRecordId ? { ...r, review_status: 'REJECTED' as const } : r
        ));
        setShowRejectModal(false);
        setRejectRecordId(null);
        setRejectComment('');
      } else {
        setError('Failed to reject record');
      }
    } catch (err) {
      setError('Failed to reject record');
      console.error('Reject error:', err);
    } finally {
      setRejectingId(null);
    }
  };

  const pendingRecords = records.filter(r => r.review_status === 'PENDING');
  const approvedRecords = records.filter(r => r.review_status === 'APPROVED');
  const rejectedRecords = records.filter(r => r.review_status === 'REJECTED');

  // Audit Modal
  if (showAuditModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">All Records Reviewed!</h2>
            <p className="text-slate-600">All records have been reviewed. Would you like to proceed to audit?</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-emerald-600">{approvedRecords.length}</p>
                <p className="text-xs text-slate-500">Approved</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">{rejectedRecords.length}</p>
                <p className="text-xs text-slate-500">Rejected</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-600">{records.length}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowAuditModal(false);
                onBack();
              }}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setShowAuditModal(false);
                onAudit();
              }}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Proceed to Audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reviewer Name Modal
  if (showReviewerModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter Reviewer Name</h2>
            <p className="text-slate-600">Please enter your name to start reviewing records</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="reviewerName" className="block text-sm font-medium text-slate-700 mb-2">
                Reviewer Name
              </label>
              <input
                id="reviewerName"
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleReviewerSubmit()}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onBack}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewerSubmit}
                disabled={!reviewerName.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  reviewerName.trim()
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Start Review
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reject Comment Modal
  if (showRejectModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Reject Record</h2>
            <p className="text-slate-600">Please provide a reason for rejecting this record</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="rejectComment" className="block text-sm font-medium text-slate-700 mb-2">
                Rejection Comment
              </label>
              <textarea
                id="rejectComment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectRecordId(null);
                  setRejectComment('');
                }}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectComment.trim() || rejectingId === rejectRecordId}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  rejectComment.trim() && rejectingId !== rejectRecordId
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {rejectingId === rejectRecordId ? 'Rejecting...' : 'Reject Record'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Loading Records</h2>
          <p className="text-slate-600">Fetching records for batch {batchId}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Review Records</h1>
                <p className="text-slate-500 mt-1">Batch ID: {batchId}</p>
                <p className="text-sm text-emerald-600 mt-1">Reviewer: {reviewerName}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{pendingRecords.length}</p>
                  <p className="text-sm text-slate-500">Pending</p>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{approvedRecords.length}</p>
                  <p className="text-sm text-slate-500">Approved</p>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{rejectedRecords.length}</p>
                  <p className="text-sm text-slate-500">Rejected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Records Table */}
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Records Found</h3>
            <p className="text-slate-500">No records available for this batch</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Activity Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Source Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Quantity</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Unit</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Reason</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-800">{record.activity_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {record.source_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-800">{record.raw_quantity.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{record.normalized_unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        {record.suspicious_reason ? (
                          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
                            {record.suspicious_reason}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {record.review_status === 'APPROVED' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approved
                          </span>
                        ) : record.review_status === 'REJECTED' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                            <X className="w-4 h-4 mr-1" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                            <Clock className="w-4 h-4 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {record.review_status === 'PENDING' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApprove(record.id)}
                              disabled={approvingId === record.id}
                              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                                approvingId === record.id
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {approvingId === record.id ? (
                                <>
                                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Approving...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectClick(record.id)}
                              disabled={rejectingId === record.id}
                              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                                rejectingId === record.id
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {rejectingId === record.id ? (
                                <>
                                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Rejecting...</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No action needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}