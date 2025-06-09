'use client';

import { useEffect, useState } from 'react';
import GMIOrchestrator from '../../components/GMIOrchestrator';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const EnhancedIDEPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [projectContext, setProjectContext] = useState('');
  const [currentFiles, setCurrentFiles] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadProjectContext = async () => {
      try {
        setProjectContext('GMI Hackathon project - A web-based IDE with AI orchestration capabilities');
        setCurrentFiles(['package.json', 'src/app/page.tsx', 'README.md']);
      } catch (error) {
        console.error('Failed to load project context:', error);
      }
    };

    loadProjectContext();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* AI Orchestrator Panel */}
      <div className={`transition-all duration-300 ${isChatVisible ? 'w-96' : 'w-0'} overflow-hidden shadow-xl`}>
        <GMIOrchestrator 
          projectContext={projectContext}
          currentFiles={currentFiles}
        />
      </div>

      {/* Toggle Button */}
      <div className="flex flex-col justify-center bg-white border-r border-gray-200">
        <button
          onClick={() => setIsChatVisible(!isChatVisible)}
          className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 group"
          title={isChatVisible ? 'Hide AI Orchestrator' : 'Show AI Orchestrator'}
        >
          {isChatVisible ? (
            <ChevronLeftIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronRightIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <SparklesIcon className="h-4 w-4 text-purple-500" />
            </div>
          )}
        </button>
      </div>

      {/* IDE Container */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                <CodeBracketIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Theia IDE</h3>
                <p className="text-gray-600">Setting up your development environment...</p>
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
          src="http://127.0.0.1:3000"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
          title="Theia IDE"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default EnhancedIDEPage;