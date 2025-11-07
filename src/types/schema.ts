export interface GraphQLField {
  name: string;
  type: string;
  required: boolean;
  isList: boolean;
}

export interface Relationship {
  type: 'hasMany' | 'belongsTo';
  targetEntity: string;
  fieldName: string;
}

export interface Entity {
  name: string;
  fields: GraphQLField[];
  relationships: Relationship[];
  isJunctionTable: boolean;
}

export interface ParsedSchema {
  entities: Entity[];
}

export interface ERDTable {
  id: string;
  name: string;
  x: number;
  y: number;
  fields: GraphQLField[];
  relationships: Relationship[];
}

export interface ERDConnection {
  id: string;
  from: string;
  to: string;
  type: 'one-to-many' | 'many-to-many' | 'belongsTo';
  fromField?: string;
  toField?: string;
}

export interface ERDDiagram {
  tables: ERDTable[];
  connections: ERDConnection[];
}

export interface NodeGraphNode {
  id: string;
  label: string;
  type: 'entity' | 'junction';
  data: {
    entityName: string;
    fieldCount: number;
    relationshipCount: number;
  };
  position: { x: number; y: number };
}

export interface NodeGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'hasMany' | 'belongsTo';
  style?: Record<string, any>;
}

export interface NodeGraphData {
  nodes: NodeGraphNode[];
  edges: NodeGraphEdge[];
}

