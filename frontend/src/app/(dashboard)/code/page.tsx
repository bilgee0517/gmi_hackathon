'use client';

import { useState } from 'react';
import CodeEditor from '../../components/CodeEditor';
import { 
  PlayIcon, 
  StopIcon, 
  DocumentDuplicateIcon,
  ShareIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const languages = [
  { id: 'javascript', name: 'JavaScript', color: 'bg-yellow-500' },
  { id: 'python', name: 'Python', color: 'bg-blue-500' },
  { id: 'typescript', name: 'TypeScript', color: 'bg-blue-600' },
];

const BACKEND_URL = 'http://localhost:8000';

export default function CodePage() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    try {
      setIsRunning(true);
      setOutput([]);

      if (selectedLanguage === 'javascript' || selectedLanguage === 'typescript') {
        const logs: string[] = [];
        const safeConsole = {
          log: (...args: any[]) => {
            const message = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            logs.push(message);
            setOutput(prev => [...prev, message]);
          }
        };

        const safeEval = new Function('console', code);
        safeEval(safeConsole);
      } else {
        const response = await fetch(`${BACKEND_URL}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            language: selectedLanguage,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to execute code');
        }
        
        if (data.error) {
          setOutput(prev => [...prev, `Error: ${data.error}`]);
        }
        if (data.output) {
          setOutput(prev => [...prev, data.output]);
        }
      }
    } catch (error) {
      console.error('Error executing code:', error);
      setOutput(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const selectedLang = languages.find(lang => lang.id === selectedLanguage);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Code Playground</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${selectedLang?.color}`}></div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="input text-sm py-2 px-3 min-w-[120px]"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn-secondary p-2">
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>
            <button className="btn-secondary p-2">
              <ShareIcon className="h-4 w-4" />
            </button>
            <button className="btn-secondary p-2">
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`btn-primary flex items-center gap-2 ${
                isRunning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isRunning ? (
                <>
                  <StopIcon className="h-4 w-4" />
                  Running...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  Run Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>main.{selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'typescript' ? 'ts' : 'py'}</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>{code.split('\n').length} lines</span>
            </div>
          </div>
          <div className="flex-1 p-4">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
              theme="vs-dark"
              height="100%"
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-96 bg-gray-900 flex flex-col">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Console Output</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-400 animate-pulse' : output.length > 0 ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-xs text-gray-400">
                  {isRunning ? 'Running' : output.length > 0 ? 'Ready' : 'Idle'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {output.length === 0 ? (
              <div className="text-gray-500 text-sm italic">
                Run your code to see output here...
              </div>
            ) : (
              <div className="space-y-1">
                {output.map((line, index) => (
                  <div key={index} className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}