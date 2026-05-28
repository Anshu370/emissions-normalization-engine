import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import UploadPage from './components/UploadPage';
import ResultPage from './components/ResultPage';
import ReviewPage from './components/ReviewPage';
import AuditPage from './components/AuditPage';

type AppState = 'upload' | 'processing' | 'result' | 'review' | 'audit';

interface UploadResponse {
  message: string;
  batch_id: string;
}

const BATCH_ID_KEY = 'esg_batch_id';

function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedBatchId = sessionStorage.getItem(BATCH_ID_KEY);
    if (storedBatchId) {
      setBatchId(storedBatchId);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setAppState('processing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const backendUrl = import.meta.env.VITE_BACKEND;
      const response = await fetch(`${backendUrl}/api/upload/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }

      sessionStorage.setItem(BATCH_ID_KEY, data.batch_id);
      setBatchId(data.batch_id);
      setAppState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAppState('upload');
      setUploadedFile(null);
    }
  };

  const handleReset = () => {
    sessionStorage.removeItem(BATCH_ID_KEY);
    setUploadedFile(null);
    setBatchId(null);
    setError(null);
    setAppState('upload');
  };

  const handleReview = () => {
    setAppState('review');
  };

  const handleBackFromReview = () => {
    setAppState('result');
  };

  const handleAudit = () => {
    setAppState('audit');
  };

  const handleBackFromAudit = () => {
    setAppState('result');
  };

  const handleGoToDashboard = () => {
    setAppState('result');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 relative">
      {/* Dashboard Button - visible on non-dashboard pages */}
      {appState !== 'result' && (
        <button
          onClick={handleGoToDashboard}
          className="fixed top-6 right-6 z-50 flex items-center space-x-2 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-lg hover:shadow-xl hover:border-slate-300 transition-all group"
        >
          <LayoutDashboard className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
          <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">Dashboard</span>
        </button>
      )}
      {appState === 'upload' && (
        <UploadPage onFileUpload={handleFileUpload} error={error} />
      )}
      {appState === 'processing' && uploadedFile && (
        <ProcessingPage file={uploadedFile} />
      )}
      {appState === 'result' && (
        <ResultPage onReset={handleReset} onReview={handleReview} onAudit={handleAudit} batchId={batchId ?? undefined} />
      )}
      {appState === 'review' && batchId && (
        <ReviewPage batchId={batchId} onBack={handleBackFromReview} onAudit={handleAudit} />
      )}
      {appState === 'audit' && (
        <AuditPage onBack={handleBackFromAudit} />
      )}
    </div>
  );
}

// Processing Page Component
interface ProcessingPageProps {
  file: File;
}

function ProcessingPage({ file }: ProcessingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Parsing', 'Normalizing', 'Validating'];

  useEffect(() => {
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex <= steps.length) {
        setCurrentStep(stepIndex);
      }
      if (stepIndex === steps.length) {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Processing File</h2>
          <p className="text-slate-600 text-sm">{file.name}</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = currentStep === index + 1;
            const isComplete = currentStep > index + 1;

            return (
              <div key={step} className="flex items-center">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500'
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {isComplete ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-sm font-semibold ${isActive ? 'animate-pulse' : ''}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isComplete || isActive ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {step}
                    {isActive && (
                      <span className="ml-2 inline-block">
                        <span className="animate-pulse">...</span>
                      </span>
                    )}
                  </p>
                </div>
                {isActive && (
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-loading-bar"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes loading-bar {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
          .animate-loading-bar {
            animation: loading-bar 1.5s ease-in-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;
