import { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, BarChart3, User, Lock, Leaf } from 'lucide-react';

interface AuditBatch {
  batch_id: string;
  source_type: string;
  total_records: number;
  approved_records: number;
  rejected_records: number;
  pending_records: number;
  total_co2e_emissions: number;
  ready_for_audit: boolean;
}

interface AuditPageProps {
  onBack: () => void;
}

export default function AuditPage({ onBack }: AuditPageProps) {
  const [batches, setBatches] = useState<AuditBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditorName, setAuditorName] = useState<string>('');
  const [showAuditorModal, setShowAuditorModal] = useState(true);
  const [lockingBatch, setLockingBatch] = useState<string | null>(null);

  useEffect(() => {
    if (auditorName) {
      fetchAuditBatches();
    }
  }, [auditorName]);

  const fetchAuditBatches = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND;
      const response = await fetch(`${backendUrl}/api/audit/ready/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      } else {
        setError('Failed to load audit batches');
      }
    } catch (err) {
      setError('Failed to fetch audit batches');
      console.error('Audit batches fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditorSubmit = () => {
    if (auditorName.trim()) {
      setShowAuditorModal(false);
    }
  };

  const handleLockAudit = async (batchId: string) => {
    try {
      setLockingBatch(batchId);
      const backendUrl = import.meta.env.VITE_BACKEND;

      const response = await fetch(`${backendUrl}/api/audit/${batchId}/lock/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditor_name: auditorName
        }),
      });

      if (response.ok) {
        // Remove the locked batch from the list
        setBatches(batches.filter(b => b.batch_id !== batchId));
      } else {
        setError('Failed to lock audit');
      }
    } catch (err) {
      setError('Failed to lock audit');
      console.error('Lock audit error:', err);
    } finally {
      setLockingBatch(null);
    }
  };

  // Auditor Name Modal
  if (showAuditorModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Enter Auditor Name</h2>
            <p className="text-slate-600">Please enter your name to start auditing records</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="auditorName" className="block text-sm font-medium text-slate-700 mb-2">
                Auditor Name
              </label>
              <input
                id="auditorName"
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleAuditorSubmit()}
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
                onClick={handleAuditorSubmit}
                disabled={!auditorName.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  auditorName.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Start Audit
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Loading Audit Batches</h2>
          <p className="text-slate-600">Fetching batches ready for audit...</p>
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
                <h1 className="text-2xl font-bold text-slate-800">Audit Dashboard</h1>
                <p className="text-slate-500 mt-1">Review and audit approved records</p>
                <p className="text-sm text-blue-600 mt-1">Auditor: {auditorName}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{batches.length}</p>
                  <p className="text-sm text-slate-500">Ready for Audit</p>
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
              ×
            </button>
          </div>
        )}

        {/* Audit Batches */}
        {batches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Batches Ready for Audit</h3>
            <p className="text-slate-500">All batches have been audited or are still pending review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {batches.map((batch) => (
              <div key={batch.batch_id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Batch {batch.batch_id.slice(0, 8)}...
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        {batch.source_type}
                      </span>
                      {batch.ready_for_audit && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                          Ready for Audit
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">{batch.total_records}</p>
                    <p className="text-sm text-slate-500">Total Records</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{batch.approved_records}</p>
                    <p className="text-sm text-slate-500">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{batch.rejected_records}</p>
                    <p className="text-sm text-slate-500">Rejected</p>
                  </div>
                </div>

                {/* CO2 Emissions */}
                <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Total CO2e Emissions</p>
                      <p className="text-lg font-bold text-emerald-900">
                        {batch.total_co2e_emissions.toLocaleString()} kg CO2e
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleLockAudit(batch.batch_id)}
                  disabled={lockingBatch === batch.batch_id}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    lockingBatch === batch.batch_id
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {lockingBatch === batch.batch_id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Locking Audit...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Lock & Complete Audit</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}