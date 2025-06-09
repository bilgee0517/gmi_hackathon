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
  javascript: `// Welcome to the JavaScript playground!
console.log("Hello, World!");

// Try some examples:
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Function example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));`,
  
  python: `# Welcome to the Python playground!
print("Hello, World!")

# Try some examples:
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print("Doubled numbers:", doubled)

# Function example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci(10):", fibonacci(10))`,
  
  typescript: `// Welcome to the TypeScript playground!
console.log("Hello, World!");

// Try some examples with types:
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Alice",
  age: 30
};

console.log("User:", user);

// Generic function example
function identity<T>(arg: T): T {
  return arg;
}

console.log("Identity:", identity("TypeScript"));`,
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
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        const value = editor.getValue();
        onSave?.(value);
      }
    });

    // Configure editor options for better UX
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
      lineHeight: 1.6,
      letterSpacing: 0.5,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'gutter',
      renderWhitespace: 'selection',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    });
  };

  const handleChange = (value: string | undefined) => {
    const newValue = value || '';
    onChange?.(newValue);
    debouncedSave(newValue);
  };

  // Set default template when language changes and no value exists
  useEffect(() => {
    if (!value && languageTemplates[language as keyof typeof languageTemplates]) {
      onChange?.(languageTemplates[language as keyof typeof languageTemplates]);
    }
  }, [language, value, onChange]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white">
      <Editor
        height={height}
        defaultLanguage={language}
        language={language}
        value={value}
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
          fontFamily: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
          lineHeight: 1.6,
          letterSpacing: 0.5,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'gutter',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          }
        }}
      />
    </div>
  );
}