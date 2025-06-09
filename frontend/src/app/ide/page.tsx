'use client';

import { useEffect, useState } from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

const IDEPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen relative bg-gray-50">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <CodeBracketIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Theia IDE</h3>
              <p className="text-gray-600">Initializing your development environment...</p>
            </div>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <iframe
        src="http://localhost:3001"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        title="Theia IDE"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default IDEPage;