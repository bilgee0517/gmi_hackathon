'use client';

import { useState } from 'react';
import CodeEditor from '../../components/CodeEditor';

const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'typescript', name: 'TypeScript' },
];

const BACKEND_URL = 'http://localhost:8000'; // FastAPI backend URL

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
        // Run JavaScript/TypeScript in the browser
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
        // Run other languages on the backend
        console.log('Sending request to backend:', {
          code,
          language: selectedLanguage
        });

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

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
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

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Code Editor</h1>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg bg-white dark:bg-gray-800"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={runCode}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={selectedLanguage}
            theme="vs-dark"
            height="500px"
          />
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-white font-semibold mb-2">Console Output</h2>
          <div className="bg-black rounded-lg p-4 h-[500px] overflow-y-auto">
            {output.map((line, index) => (
              <div key={index} className="text-green-400 font-mono text-sm">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 