import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, BarChart3, ClipboardCheck } from 'lucide-react';

interface DashboardSummary {
  total_records: number;
  approved_records: number;
  pending_records: number;
  suspicious_records: number;
}

interface ResultPageProps {
  onReset: () => void;
  onReview: () => void;
  onAudit: () => void;
  batchId?: string;
}

export default function ResultPage({ onReset, onReview, onAudit, batchId }: ResultPageProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND;
      const response = await fetch(`${backendUrl}/api/dashboard/summary/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        setSummaryError('Failed to load summary');
      }
    } catch (err) {
      setSummaryError('Failed to fetch dashboard summary');
      console.error('Summary fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Records',
      value: summary?.total_records || 0,
      icon: BarChart3,
      bg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      label: 'Approved',
      value: summary?.approved_records || 0,
      icon: CheckCircle,
      bg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Pending',
      value: summary?.pending_records || 0,
      icon: Clock,
      bg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Suspicious',
      value: summary?.suspicious_records || 0,
      icon: AlertTriangle,
      bg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Upload Another File</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                      {batchId ? 'File Processed Successfully' : 'Dashboard'}
                    </h1>
                    {batchId && <p className="text-slate-500">Batch ID: {batchId}</p>}
                  </div>
                </div>
              </div>
              {batchId && (
                <div className="text-right">
                  <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-semibold">
                    Completed
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Dashboard Summary</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse">
                  <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : summaryError ? (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-slate-600">{summaryError}</p>
              <button
                onClick={fetchSummary}
                className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
                  >
                    <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-800">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onReview}
              disabled={!batchId}
              className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all ${
                batchId ? 'hover:shadow-lg group cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    batchId ? 'bg-emerald-100 group-hover:bg-emerald-200 transition-colors' : 'bg-slate-100'
                  }`}>
                    <ClipboardCheck className={`w-7 h-7 ${batchId ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-left">
                    <h3 className={`text-lg font-bold ${batchId ? 'text-slate-800' : 'text-slate-400'}`}>Review Records</h3>
                    <p className="text-sm text-slate-500">
                      {batchId ? 'Review and approve pending records' : 'Upload a file to enable review'}
                    </p>
                  </div>
                </div>
                {batchId && (
                  <div className="flex items-center space-x-2 text-emerald-600 group-hover:text-emerald-700">
                    <span className="font-medium">Start</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={onAudit}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <BarChart3 className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-800">Audit Records</h3>
                    <p className="text-sm text-slate-500">
                      Audit approved records and calculate emissions
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-blue-600 group-hover:text-blue-700">
                  <span className="font-medium">Start</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Upload Info */}
        {batchId && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Upload Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Status</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                Completed
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Batch ID</span>
              <span className="font-mono text-sm text-slate-500">{batchId}</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
