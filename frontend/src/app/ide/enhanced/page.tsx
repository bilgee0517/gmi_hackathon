'use client';

import { useEffect, useState } from 'react';
import GMIOrchestrator from '../../components/GMIOrchestrator';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const EnhancedIDEPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [projectContext, setProjectContext] = useState('');
  const [currentFiles, setCurrentFiles] = useState<string[]>([]);

  useEffect(() => {
    // Add a timeout to hide loading state after a reasonable time
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Optional: Load project context from your backend
  useEffect(() => {
    const loadProjectContext = async () => {
      try {
        // You can fetch current project info from your backend
        // const response = await fetch('/api/current-project');
        // const data = await response.json();
        // setProjectContext(data.description);
        // setCurrentFiles(data.files);
        
        // For now, set some default context
        setProjectContext('GMI Hackathon project - A web-based IDE with AI orchestration capabilities');
        setCurrentFiles(['package.json', 'src/app/page.tsx', 'README.md']);
      } catch (error) {
        console.error('Failed to load project context:', error);
      }
    };

    loadProjectContext();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Panel */}
      <div className={`transition-all duration-300 ${isChatVisible ? 'w-80' : 'w-0'} overflow-hidden`}>
        <GMIOrchestrator 
          projectContext={projectContext}
          currentFiles={currentFiles}
        />
      </div>

      {/* Toggle Button */}
      <div className="flex flex-col justify-center">
        <button
          onClick={() => setIsChatVisible(!isChatVisible)}
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          title={isChatVisible ? 'Hide Orchestrator' : 'Show Orchestrator'}
        >
          {isChatVisible ? (
            <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Theia IDE */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg">Loading Theia IDE...</p>
            </div>
          </div>
        )}
        <iframe
          src="http://127.0.0.1:3000"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
          }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
          title="Theia IDE"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default EnhancedIDEPage;