interface ViewToggleProps {
  currentView: 'erd' | 'nodegraph';
  onViewChange: (view: 'erd' | 'nodegraph') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
      <button
        onClick={() => onViewChange('erd')}
        style={{
          padding: '10px 20px',
          backgroundColor: currentView === 'erd' ? '#2196f3' : '#e0e0e0',
          color: currentView === 'erd' ? 'white' : '#333',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.2s',
        }}
      >
        ER Diagram
      </button>
      <button
        onClick={() => onViewChange('nodegraph')}
        style={{
          padding: '10px 20px',
          backgroundColor: currentView === 'nodegraph' ? '#2196f3' : '#e0e0e0',
          color: currentView === 'nodegraph' ? 'white' : '#333',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.2s',
        }}
      >
        Node Graph
      </button>
    </div>
  );
}

