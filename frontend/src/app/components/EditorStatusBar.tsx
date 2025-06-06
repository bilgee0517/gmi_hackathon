import React from 'react';

interface EditorStatusBarProps {
  fileName: string;
  language: string;
  saveStatus: 'saved' | 'saving' | 'error';
  onSave: () => void;
}

export default function EditorStatusBar({ fileName, language, saveStatus, onSave }: EditorStatusBarProps) {
  return (
    <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
      <div>
        <span className="font-medium">{fileName}</span>
        <span className="mx-2">•</span>
        <span>{language}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onSave}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Save
        </button>
        <div>
          {saveStatus === 'saving' && <span>Saving...</span>}
          {saveStatus === 'saved' && <span>Saved</span>}
          {saveStatus === 'error' && <span className="text-red-500">Error saving</span>}
        </div>
      </div>
    </div>
  );
}