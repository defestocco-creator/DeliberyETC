
import React, { useState, useCallback } from 'react';

interface ResponseDisplayProps {
  title: string;
  data: any | null;
  error: any | null;
  isLoading: boolean;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ title, data, error, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const contentToDisplay = data || error;

  const handleCopy = useCallback(() => {
    if (contentToDisplay) {
      navigator.clipboard.writeText(JSON.stringify(contentToDisplay, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [contentToDisplay]);

  const borderColor = error ? 'border-red-500/50' : 'border-green-500/50';
  const textColor = error ? 'text-red-400' : 'text-green-400';

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className={`bg-gray-800 rounded-lg border ${ (data || error) ? borderColor : 'border-gray-700' } relative`}>
        {isLoading && (
            <div className="p-4 text-center text-gray-400">Loading...</div>
        )}

        {contentToDisplay && (
          <>
            <div className={`px-4 py-2 border-b ${borderColor} flex justify-between items-center`}>
                <span className={`text-sm font-mono ${textColor}`}>{error ? 'Error' : 'Success'}</span>
                <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
                  {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
            </div>
            <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
              <code>{JSON.stringify(contentToDisplay, null, 2)}</code>
            </pre>
          </>
        )}
        
        {!isLoading && !contentToDisplay && (
             <div className="p-4 text-center text-gray-500">No response yet. Send a request to see the result.</div>
        )}
      </div>
    </div>
  );
};

export default ResponseDisplay;
