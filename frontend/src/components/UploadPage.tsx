import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface UploadPageProps {
  onFileUpload: (file: File) => void;
  error: string | null;
}

export default function UploadPage({ onFileUpload, error }: UploadPageProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationError('Please upload a CSV file only');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleParseAndValidate = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30 mb-6">
            <FileSpreadsheet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            ESG Data Upload
          </h1>
          <p className="text-slate-600 text-lg max-w-md mx-auto">
            Upload your ESG CSV files to calculate environmental, social, and governance scores for your company.
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
            dragActive
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-300 bg-white hover:border-emerald-300 hover:bg-slate-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div className={`mb-5 transition-transform duration-200 ${dragActive ? 'scale-110' : ''}`}>
              <div className={`p-4 rounded-full ${dragActive ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                <Upload className={`w-10 h-10 ${dragActive ? 'text-emerald-600' : 'text-slate-500'}`} />
              </div>
            </div>

            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">File ready for upload</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4">
                  <p className="font-semibold text-slate-800">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setValidationError(null);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  {dragActive ? 'Drop your file here' : 'Drag and drop your CSV file'}
                </h3>
                <p className="text-slate-500 mb-4">
                  or <span className="text-emerald-600 font-medium">browse</span> to choose a file
                </p>
                <div className="flex items-center space-x-3 text-sm text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>CSV files only</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{displayError}</span>
          </div>
        )}

        {/* Parse and Validate Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleParseAndValidate}
            disabled={!selectedFile}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 ${
              selectedFile
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Parse and Validate</span>
          </button>
        </div>

        {/* Supported Formats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">SAP Format</h4>
            <p className="text-sm text-slate-500">Fully supported</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">Utility Format</h4>
            <p className="text-sm text-slate-500">Coming soon</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">Travel Format</h4>
            <p className="text-sm text-slate-500">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
