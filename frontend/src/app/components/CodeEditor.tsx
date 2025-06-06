'use client';

import { useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { debounce } from 'lodash-es';

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  language?: string;
  theme?: 'vs-dark' | 'light';
  height?: string;
}

const languageTemplates = {
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");',
  python: '# Write your Python code here\nprint("Hello, World!")',
  typescript: '// Write your TypeScript code here\nconsole.log("Hello, World!");',
};

export default function CodeEditor({
  value = '',
  onChange,
  onSave,
  language = 'javascript',
  theme = 'vs-dark',
  height = '500px'
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const debouncedSave = useCallback(
    debounce((value: string) => {
      onSave?.(value);
    }, 1000),
    [onSave]
  );

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Add keyboard shortcut for manual save
    editor.addAction({
      id: 'save',
      label: 'Save',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
      run: () => {
        const value = editor.getValue();
        onSave?.(value);
      }
    });
  };

  const handleChange = (value: string | undefined) => {
    const newValue = value || '';
    onChange?.(newValue);
    debouncedSave(newValue);
  };

  // Set default template when language changes
  useEffect(() => {
    if (!value && languageTemplates[language as keyof typeof languageTemplates]) {
      onChange?.(languageTemplates[language as keyof typeof languageTemplates]);
    }
  }, [language, value, onChange]);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-700">
      <Editor
        height={height}
        defaultLanguage={language}
        defaultValue={value}
        theme={theme}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}