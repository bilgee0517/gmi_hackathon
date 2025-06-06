'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import MilestonePanel, { Milestone } from './MilestonePanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GMIOrchestratorProps {
  projectContext?: string;
  currentFiles?: string[];
}

const GMIOrchestrator: React.FC<GMIOrchestratorProps> = ({ 
  projectContext = '',
  currentFiles = []
}) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hi! I\'m your project orchestrator. I can help you plan, understand, and navigate your coding project. What would you like to work on?',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const markCurrentMilestoneComplete = () => {
    if (!currentMilestone) return;
    const updatedMilestones = milestones.map(m =>
      m.id === currentMilestone.id ? { ...m, status: 'done' } : m
    );
    setMilestones(updatedMilestones);
    const next = updatedMilestones.find(m => m.status === 'pending');
    setCurrentMilestone(next || null);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const isPlanning = messages.length <= 1;
      const planningPrompt = `You are a project planning assistant. Given the following project description, return a list of 3–5 milestones.\n\nEach milestone should have:\n- \"id\": number\n- \"milestone\": a short title\n- \"tasks\": an array of strings (subtasks)\n- \"status\": \"pending\"\n\nRespond ONLY in JSON like:\n[\n  {\n    \"id\": 1,\n    \"milestone\": \"Set up frontend project\",\n    \"tasks\": [\"Initialize React app\", \"Configure TailwindCSS\"],\n    \"status\": \"pending\"\n  },\n  ...\n]\n\nProject description:\n${input}`;

      const systemPrompt = `You are a project planning and orchestration assistant for developers. You help with:\n- Project planning and task breakdown\n- Code architecture guidance\n- Suggesting next steps and milestones\n- Explaining project structure and patterns\n- Providing coding guidance and best practices\n\nCurrent project context:\n${projectContext}\n\nCurrent files in workspace:\n${currentFiles.join(', ')}\n\nKeep responses concise and actionable. Focus on helping the developer understand what to do next.`;

      const response = await fetch(process.env.NEXT_PUBLIC_GMI_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GMI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
          messages: [
            { role: 'system', content: isPlanning ? planningPrompt : systemPrompt },
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          temperature: 0.2,
          max_tokens: 700
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let assistantContent = data.choices?.[0]?.message?.content || '';

      let parsedMilestones: Milestone[] | null = null;

      try {
        const parsed = JSON.parse(assistantContent);
        if (Array.isArray(parsed) && parsed[0]?.milestone) {
          parsedMilestones = parsed;
          setMilestones(parsed);
          setCurrentMilestone(parsed.find(m => m.status === 'pending') || null);
        }
      } catch {
        // It was a plain text message, not milestone JSON
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: parsedMilestones
          ? '✅ Project plan created. See the milestone panel above.'
          : assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling GMI API:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting to the orchestrator service. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
        <div className="flex items-center gap-2 p-4 border-b border-gray-700 bg-gray-800">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-400" />
            <h2 className="font-semibold">Project Orchestrator</h2>
    </div>


      {/* Top panel: Milestone viewer */}
      <div className="border-b border-gray-200">
        <MilestonePanel
          milestones={milestones}
          onComplete={(id) => {
            const updated = milestones.map(m =>
              m.id === id ? { ...m, status: 'done' } : m
            );
            setMilestones(updated);
            setCurrentMilestone(updated.find(m => m.status === 'pending') || null);
          }}
        />
      </div>

      {currentMilestone && (
        <div className="p-4 border-b border-gray-900 bg-yellow-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">📌 Current Milestone:</h3>
          <p className="text-gray-100 text-sm mb-1">{currentMilestone.milestone}</p>
          <ul className="list-disc ml-5 text-gray-600 text-sm">
            {currentMilestone.tasks.map((task, idx) => (
              <li key={idx}>{task}</li>
            ))}
          </ul>
          <button
            onClick={markCurrentMilestoneComplete}
            className="mt-2 flex items-center gap-1 text-xs text-green-600 hover:underline"
          >
            <CheckCircleIcon className="h-4 w-4" /> Mark as complete
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              <div className={`text-xs mt-1 opacity-70`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your project, get guidance, or request help..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default GMIOrchestrator;
