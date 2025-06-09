'use client';

import Link from 'next/link';
import { 
  ArrowRightIcon, 
  CodeBracketIcon, 
  RocketLaunchIcon, 
  SparklesIcon,
  PlayIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SynthEd
              </h1>
            </div>
            <Link
              href="/projects"
              className="btn-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                Code with
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Intelligence
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                The next-generation IDE that combines powerful coding tools with AI orchestration 
                to accelerate your development workflow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/projects"
                className="btn-primary text-lg px-8 py-4 flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Start Coding
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/ide/enhanced"
                className="btn-secondary text-lg px-8 py-4 flex items-center gap-3"
              >
                <PlayIcon className="h-5 w-5" />
                Try Demo
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-600">SynthEd IDE</div>
                </div>
              </div>
              <div className="p-6 bg-gray-900 text-green-400 font-mono text-sm">
                <div className="space-y-2">
                  <div>$ npm create synthed-app my-project</div>
                  <div className="text-gray-500">✓ Creating project structure...</div>
                  <div className="text-gray-500">✓ Installing dependencies...</div>
                  <div className="text-gray-500">✓ Setting up AI orchestrator...</div>
                  <div className="text-blue-400">🚀 Project ready! Happy coding!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Everything you need to code
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make development faster, smarter, and more enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center group hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CodeBracketIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Code Editor</h3>
              <p className="text-gray-600">
                Monaco-powered editor with intelligent autocomplete, syntax highlighting, 
                and real-time error detection.
              </p>
            </div>

            <div className="card text-center group hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Orchestrator</h3>
              <p className="text-gray-600">
                Get intelligent project guidance, code suggestions, and automated 
                task planning powered by advanced AI.
              </p>
            </div>

            <div className="card text-center group hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FolderIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Project Management</h3>
              <p className="text-gray-600">
                Organize your projects with intuitive file management, 
                version control, and collaborative features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              Ready to transform your coding experience?
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of developers who are already building faster with SynthEd.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RocketLaunchIcon className="h-6 w-6" />
              Start Building Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-bold text-lg">SynthEd</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 SynthEd. Built for the GMI Hackathon.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}