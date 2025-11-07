import { useState, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { ERDiagram, ERDiagramRef } from './components/ERDiagram';
import { NodeGraph } from './components/NodeGraph';
import { ViewToggle } from './components/ViewToggle';
import { SchemaEditor } from './components/SchemaEditor';
import { parseGraphQLSchema } from './utils/graphqlParser';
import { generateERDDiagram, generateNodeGraph } from './utils/schemaAnalyzer';
import { exportGraphQLSchema, exportSVG, exportPNG } from './utils/exportUtils';
import { Entity } from './types/schema';
import './App.css';

type ViewType = 'erd' | 'nodegraph';

function App() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [schemaContent, setSchemaContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('erd');
  const [isLoading, setIsLoading] = useState(false);
  const erdDiagramRef = useRef<ERDiagramRef>(null);

  const handleFileLoaded = (content: string) => {
    setIsLoading(true);
    setError(null);
    setSchemaContent(content);
    
    try {
      const parsedEntities = parseGraphQLSchema(content);
      setEntities(parsedEntities);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse schema');
      setIsLoading(false);
      setEntities([]);
    }
  };

  const handleSchemaChange = (newContent: string) => {
    setSchemaContent(newContent);
    setIsLoading(true);
    setError(null);
    
    try {
      const parsedEntities = parseGraphQLSchema(newContent);
      setEntities(parsedEntities);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse schema');
      setIsLoading(false);
      setEntities([]);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setEntities([]);
  };

  const handleExportSchema = () => {
    if (schemaContent) {
      exportGraphQLSchema(schemaContent, 'schema.graphql');
    }
  };

  const handleExportDiagram = async (format: 'svg' | 'png') => {
    if (currentView !== 'erd') {
      setError('Diagram export is only available for ER Diagram view');
      return;
    }

    const svgElement = erdDiagramRef.current?.getSVGElement();
    if (!svgElement) {
      setError('Unable to access diagram for export');
      return;
    }

    try {
      if (format === 'svg') {
        exportSVG(svgElement, 'erd-diagram.svg');
      } else {
        await exportPNG(svgElement, 'erd-diagram.png');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export diagram');
    }
  };

  const erdDiagram = entities.length > 0 ? generateERDDiagram(entities) : { tables: [], connections: [] };
  const nodeGraphData = entities.length > 0 ? generateNodeGraph(entities) : { nodes: [], edges: [] };

  return (
    <div className="app">
      <header className="app-header">
        <h1>GraphQL Schema Viewer</h1>
        <p>Upload an AWS Amplify/AppSync GraphQL schema file to visualize entity relationships</p>
      </header>

      <main className="app-main">
        <div className="upload-section">
          <FileUpload onFileLoaded={handleFileLoaded} onError={handleError} />
        </div>

        {error && (
          <div className="error-message" style={{ 
            padding: '15px', 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            borderRadius: '4px',
            marginTop: '20px',
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {isLoading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Parsing schema...</p>
          </div>
        )}

        {schemaContent && (
          <div className="editor-visualization-section">
            <div className="editor-panel">
              <div className="editor-header">
                <h3>Schema Editor</h3>
                <button 
                  onClick={handleExportSchema}
                  className="export-button"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Export Schema
                </button>
              </div>
              <div className="editor-container">
                <SchemaEditor 
                  value={schemaContent} 
                  onChange={handleSchemaChange}
                  onError={setError}
                />
              </div>
            </div>
            
            <div className="visualization-panel">
              <div className="visualization-header">
                <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
                {currentView === 'erd' && (
                  <div className="export-buttons">
                    <button
                      onClick={() => handleExportDiagram('svg')}
                      className="export-button"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginRight: '8px'
                      }}
                    >
                      Export SVG
                    </button>
                    <button
                      onClick={() => handleExportDiagram('png')}
                      className="export-button"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Export PNG
                    </button>
                  </div>
                )}
              </div>
              
              {currentView === 'erd' ? (
                <ERDiagram ref={erdDiagramRef} diagram={erdDiagram} />
              ) : (
                <NodeGraph data={nodeGraphData} />
              )}

              <div className="schema-info" style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px' 
              }}>
                <h3>Schema Summary</h3>
                <p><strong>Entities found:</strong> {entities.length}</p>
                <ul>
                  {entities.map(entity => (
                    <li key={entity.name}>
                      <strong>{entity.name}</strong> - {entity.fields.length} fields, {entity.relationships.length} relationships
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

