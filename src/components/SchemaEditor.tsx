import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { parse } from 'graphql';

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  onError?: (error: string | null) => void;
}

export function SchemaEditor({ value, onChange, onError }: SchemaEditorProps) {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined) return;
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Update value immediately for editor display
    onChange(newValue);

    // Debounce the parsing/error checking (400ms delay)
    debounceTimerRef.current = setTimeout(() => {
      // Error checking will be done in parent component
      if (onError) {
        try {
          // Basic validation - try to parse
          parse(newValue);
          onError(null);
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Invalid GraphQL schema');
        }
      }
    }, 400);
  };

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }}>
      <Editor
        height="100%"
        defaultLanguage="graphql"
        value={value}
        onChange={handleEditorChange}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}

