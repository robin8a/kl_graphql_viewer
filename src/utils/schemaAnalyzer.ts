import { Entity, ERDDiagram, ERDTable, ERDConnection, NodeGraphData, NodeGraphNode, NodeGraphEdge } from '../types/schema';

export function generateERDDiagram(entities: Entity[]): ERDDiagram {
  const tables: ERDTable[] = [];
  const connections: ERDConnection[] = [];
  
  // Layout: simple grid layout
  const cols = Math.ceil(Math.sqrt(entities.length));
  const spacing = 300;
  const startX = 100;
  const startY = 100;

  entities.forEach((entity, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    tables.push({
      id: entity.name,
      name: entity.name,
      x: startX + col * spacing,
      y: startY + row * spacing,
      fields: entity.fields,
      relationships: entity.relationships,
    });

    // Create connections based on relationships
    entity.relationships.forEach((rel) => {
      const targetEntity = entities.find(e => e.name === rel.targetEntity);
      if (!targetEntity) return;

      const connectionId = `${entity.name}-${rel.targetEntity}-${rel.fieldName}`;
      
      // Check if connection already exists (reverse direction)
      const existingConnection = connections.find(
        c => (c.from === rel.targetEntity && c.to === entity.name) ||
             (c.from === entity.name && c.to === rel.targetEntity)
      );

      if (!existingConnection) {
        let connectionType: 'one-to-many' | 'many-to-many' | 'belongsTo';
        
        if (rel.type === 'belongsTo') {
          connectionType = 'belongsTo';
        } else if (rel.type === 'hasMany') {
          // Check if it's a many-to-many via junction table
          if (entity.isJunctionTable || targetEntity.isJunctionTable) {
            connectionType = 'many-to-many';
          } else {
            connectionType = 'one-to-many';
          }
        } else {
          connectionType = 'one-to-many';
        }

        connections.push({
          id: connectionId,
          from: entity.name,
          to: rel.targetEntity,
          type: connectionType,
          fromField: rel.fieldName,
        });
      }
    });
  });

  return { tables, connections };
}

export function generateNodeGraph(entities: Entity[]): NodeGraphData {
  const nodes: NodeGraphNode[] = [];
  const edges: NodeGraphEdge[] = [];

  // Layout: force-directed layout initial positions (circular)
  const radius = 300;
  const centerX = 400;
  const centerY = 400;
  const angleStep = (2 * Math.PI) / entities.length;

  entities.forEach((entity, index) => {
    const angle = index * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    nodes.push({
      id: entity.name,
      label: entity.name,
      type: entity.isJunctionTable ? 'junction' : 'entity',
      data: {
        entityName: entity.name,
        fieldCount: entity.fields.length,
        relationshipCount: entity.relationships.length,
      },
      position: { x, y },
    });

    // Create edges from relationships
    entity.relationships.forEach((rel) => {
      const targetEntity = entities.find(e => e.name === rel.targetEntity);
      if (!targetEntity) return;

      const edgeId = `${entity.name}-${rel.targetEntity}-${rel.fieldName}`;
      
      // Avoid duplicate edges
      const existingEdge = edges.find(
        e => (e.source === entity.name && e.target === rel.targetEntity) ||
             (e.source === rel.targetEntity && e.target === entity.name)
      );

      if (!existingEdge) {
        edges.push({
          id: edgeId,
          source: entity.name,
          target: rel.targetEntity,
          label: rel.type === 'hasMany' ? 'hasMany' : 'belongsTo',
          type: rel.type,
        });
      }
    });
  });

  return { nodes, edges };
}

