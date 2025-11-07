import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NodeGraphData } from '../types/schema';

interface NodeGraphProps {
  data: NodeGraphData;
}

const nodeTypes: NodeTypes = {
  entity: ({ data }) => (
    <div
      style={{
        padding: '10px 15px',
        background: '#2196f3',
        color: 'white',
        borderRadius: '8px',
        border: '2px solid #1976d2',
        minWidth: '120px',
        textAlign: 'center',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ fontSize: '14px', marginBottom: '5px' }}>{data.entityName}</div>
      <div style={{ fontSize: '11px', opacity: 0.9 }}>
        {data.fieldCount} fields, {data.relationshipCount} rels
      </div>
    </div>
  ),
  junction: ({ data }) => (
    <div
      style={{
        padding: '10px 15px',
        background: '#ff9800',
        color: 'white',
        borderRadius: '8px',
        border: '2px solid #f57c00',
        minWidth: '120px',
        textAlign: 'center',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ fontSize: '14px', marginBottom: '5px' }}>{data.entityName}</div>
      <div style={{ fontSize: '11px', opacity: 0.9 }}>Junction Table</div>
    </div>
  ),
};

export function NodeGraph({ data }: NodeGraphProps) {
  const initialNodes: Node[] = data.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  }));

  const initialEdges: Edge[] = data.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: edge.type === 'hasMany' ? '#2196f3' : '#ff9800',
      strokeWidth: 2,
    },
    labelStyle: {
      fill: '#333',
      fontWeight: 500,
      fontSize: '12px',
    },
    labelBgStyle: {
      fill: 'white',
      fillOpacity: 0.8,
    },
  }));

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // Update nodes and edges when data changes
  useEffect(() => {
    const newNodes: Node[] = data.nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    }));

    const newEdges: Edge[] = data.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: edge.type === 'hasMany' ? '#2196f3' : '#ff9800',
        strokeWidth: 2,
      },
      labelStyle: {
        fill: '#333',
        fontWeight: 500,
        fontSize: '12px',
      },
      labelBgStyle: {
        fill: 'white',
        fillOpacity: 0.8,
      },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data]);

  if (data.nodes.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No schema data to display. Please upload a GraphQL schema file.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

