'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import CodeEditor from '../../../components/CodeEditor';
import EditorStatusBar from '../../../components/EditorStatusBar';
import FolderTree from '../../../components/FolderTree';
import styles from './ProjectPage.module.css';

interface Project {
  id: string;
  name: string;
  description: string | null;
  files: CodeFile[];
  folders: Folder[];
  created_at: string;
  updated_at: string;
}

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  files: CodeFile[];
  subfolders: Folder[];
}

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://localhost:8000/projects/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
      setError(null);
    } catch (err) {
      setError('Failed to load project');
      console.error('Error fetching project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to refresh project data
  const refreshProjectData = useCallback(async () => {
    await fetchProject();
  }, []);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const runCode = async () => {
    if (!selectedFile) return;

    try {
        setIsRunning(true);
        setOutput([]);

        const response = await fetch('http://localhost:8000/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: selectedFile.content,
                language: selectedFile.language,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to execute code');
        }

        const data = await response.json();
        
        if (data.error) {
            setOutput(prev => [...prev, `Error: ${data.error}`]);
        }
        if (data.output) {
            setOutput(prev => [...prev, data.output]);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setOutput(prev => [...prev, `Error executing code: ${errorMessage}`]);
    } finally {
        setIsRunning(false);
    }
};

  const createNewFile = async () => {
    if (!project) return;

    const newFile: CodeFile = {
      id: '',
      name: 'new_file.py',
      content: '# Write your Python code here\nprint("Hello, World!")',
      language: 'python',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`http://localhost:8000/projects/${project.id}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFile.name,
          content: newFile.content,
          language: newFile.language,
        }),
      });

      if (!response.ok) throw new Error('Failed to create file');
      
      const createdFile = await response.json();
      setProject(prev => prev ? {
        ...prev,
        files: [...prev.files, createdFile]
      } : null);
      setSelectedFile(createdFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create file');
    }
  };

  const updateFile = async (fileId: string, updates: Partial<CodeFile>) => {
    if (!project) return;

    try {
      setSaveStatus('saving');
      const response = await fetch(
        `http://localhost:8000/projects/${project.id}/files/${fileId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error('Failed to update file');
      
      const updatedFile = await response.json();
      setProject(prev => prev ? {
        ...prev,
        files: prev.files.map(f => f.id === fileId ? updatedFile : f)
      } : null);
      setSelectedFile(updatedFile);
      setSaveStatus('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update file');
      setSaveStatus('error');
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!project) return;

    try {
      const response = await fetch(
        `http://localhost:8000/projects/${project.id}/files/${fileId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete file');
      
      setProject(prev => prev ? {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      } : null);
      
      if (selectedFile?.id === fileId) {
        setSelectedFile(project.files.find(f => f.id !== fileId) || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const debouncedUpdateFile = useCallback((fileId: string, updates: Partial<CodeFile>) => {
    const timer = setTimeout(() => {
      updateFile(fileId, updates);
    }, 1000);
    return () => clearTimeout(timer);
  }, [updateFile]);

  const handleCodeSave = async (value: string) => {
    if (!selectedFile || !project) return;
    
    try {
      setSaveStatus('saving');
      await updateFile(selectedFile.id, { content: value });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save file');
    }
  };

  if (isLoading) return <div className="p-6">Loading project...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.projectName}>{project.name}</h1>
          {project.description && (
            <p className={styles.projectDescription}>
              {project.description}
            </p>
          )}
        </div>
        <button
          onClick={createNewFile}
          className={styles.newFileButton}
        >
          New File
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <h2 className={styles.sidebarTitle}>Files</h2>
            <div className={styles.fileList}>
              <FolderTree
                folders={project.folders}
                files={project.files.filter(f => !f.folder_id)} // Root-level files
                onFileSelect={setSelectedFile}
                onFolderSelect={(folder) => {
                  // Handle folder selection if needed
                }}
                onCreateFolder={async (name: string, parentId: string | null) => {
                  try {
                    console.log('Creating folder with:', { name, parentId, projectId: project.id });
                    const response = await fetch(`http://localhost:8000/projects/${project.id}/folders`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, parentId })
                    });
                    
                    console.log('Folder creation response status:', response.status);
                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}));
                      console.error('Folder creation failed:', {
                        status: response.status,
                        statusText: response.statusText,
                        errorData
                      });
                      throw new Error(`Failed to create folder: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    console.log('Folder created successfully:', data);
                    
                    await refreshProjectData();
                  } catch (error) {
                    console.error('Error in folder creation:', error);
                    throw error; // Re-throw to handle in the UI
                  }
                }}
                onMoveFile={async (fileId: string, targetFolderId: string) => {
                  try {
                    const response = await fetch(`/api/files/${fileId}/move`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ folder_id: targetFolderId })
                    });
                    if (!response.ok) throw new Error('Failed to move file');
                    // Refresh project data after moving file
                    await refreshProjectData();
                  } catch (error) {
                    console.error('Error moving file:', error);
                    // Add error handling UI feedback here
                  }
                }}
                selectedFileId={selectedFile?.id}
              />
              <button
                onClick={createNewFile}
                className={styles.newFileButton}
              >
                New File
              </button>
            </div>
          </div>
        </div>

        {/* Editor and Output */}
        <div className={styles.editorOutput}>
          {selectedFile ? (
            <>
              <div className={styles.editorHeader}>
                <div className={styles.editorControls}>
                  <input
                    type="text"
                    value={selectedFile.name}
                    onChange={(e) => debouncedUpdateFile(selectedFile.id, { name: e.target.value })}
                    className={styles.fileNameInput}
                  />
                  <select
                    value={selectedFile.language}
                    onChange={(e) => debouncedUpdateFile(selectedFile.id, { language: e.target.value })}
                    className={styles.languageSelect}
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className={`${styles.runButton} ${isRunning ? styles.running : ''}`}
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
              <div className={styles.editorContainer}>
                <CodeEditor
                  value={selectedFile?.content}
                  language={selectedFile?.language}
                  onChange={(value) => {
                    if (selectedFile) {
                      setSelectedFile({ ...selectedFile, content: value });
                    }
                  }}
                  onSave={handleCodeSave}
                />
              </div>
              <EditorStatusBar
                fileName={selectedFile.name}
                language={selectedFile.language}
                saveStatus={saveStatus}
              />
              <div className={styles.consoleOutput}>
                <h3 className={styles.consoleTitle}>Console Output</h3>
                <div className={styles.consoleContent}>
                  {output.map((line, index) => (
                    <div key={index} className={styles.consoleLine}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noFileSelected}>
              Select a file or create a new one to start coding
            </div>
          )}
        </div>
      </div>
    </div>
  );
}