'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
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
    content: 'Hi! I\'m your AI project orchestrator. I can help you plan, understand, and navigate your coding project. What would you like to work on today?',
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
          ? '✨ Project plan created! Check out your milestones above.'
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
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <SparklesIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-900">AI Orchestrator</h2>
          <p className="text-sm text-gray-600">Your intelligent coding assistant</p>
        </div>
      </div>

      {/* Milestone Panel */}
      {milestones.length > 0 && (
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
      )}

      {/* Current Milestone */}
      {currentMilestone && (
        <div className="p-4 border-b border-gray-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Current Focus</h3>
              <p className="text-amber-800 text-sm mb-2">{currentMilestone.milestone}</p>
              <ul className="space-y-1">
                {currentMilestone.tasks.map((task, idx) => (
                  <li key={idx} className="text-xs text-amber-700 flex items-center gap-2">
                    <div className="w-1 h-1 bg-amber-600 rounded-full"></div>
                    {task}
                  </li>
                ))}
              </ul>
              <button
                onClick={markCurrentMilestoneComplete}
                className="mt-3 flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
              <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your project, get guidance, or request help..."
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <span>Powered by AI</span>
        </div>
      </div>
    </div>
  );
};

export default GMIOrchestrator;