import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileLoaded: (content: string) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onFileLoaded, onError }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.graphql')) {
      onError('Please upload a .graphql file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onFileLoaded(content);
      } else {
        onError('Failed to read file content');
      }
    };
    reader.onerror = () => {
      onError('Error reading file');
    };
    reader.readAsText(file);
  }, [onFileLoaded, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.graphql'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#f0f0f0' : 'white',
        transition: 'background-color 0.2s',
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the GraphQL file here...</p>
      ) : (
        <div>
          <p>Drag & drop a GraphQL schema file here, or click to select</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            Accepted: .graphql files
          </p>
        </div>
      )}
    </div>
  );
}

