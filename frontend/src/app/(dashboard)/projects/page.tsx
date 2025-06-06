'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
        }),
      });

      if (!response.ok) throw new Error('Failed to create project');
      
      setNewProjectName('');
      setNewProjectDescription('');
      fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  if (isLoading) return <div className="p-6">Loading projects...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => document.getElementById('new-project-modal')?.showModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block p-4 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {project.description}
              </p>
            )}
            <div className="text-sm text-gray-500">
              Last updated: {new Date(project.updated_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>

      <dialog id="new-project-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create New Project</h3>
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => document.getElementById('new-project-modal')?.close()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
} 