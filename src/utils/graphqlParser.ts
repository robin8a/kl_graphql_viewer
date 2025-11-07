import { parse, DocumentNode, TypeDefinitionNode, ObjectTypeDefinitionNode, FieldDefinitionNode, NamedTypeNode, ListTypeNode, NonNullTypeNode } from 'graphql';
import { Entity, GraphQLField, Relationship } from '../types/schema';

export function parseGraphQLSchema(schemaContent: string): Entity[] {
  try {
    const document: DocumentNode = parse(schemaContent);
    const entities: Entity[] = [];

    // First pass: collect all type definitions with @model directive
    const modelTypes = new Map<string, ObjectTypeDefinitionNode>();

    for (const definition of document.definitions) {
      if (definition.kind === 'ObjectTypeDefinition') {
        const typeDef = definition as ObjectTypeDefinitionNode;
        const typeName = typeDef.name.value;
        
        // Check if type has @model directive
        const hasModelDirective = typeDef.directives?.some(
          dir => dir.name.value === 'model'
        );

        if (hasModelDirective) {
          modelTypes.set(typeName, typeDef);
        }
      }
    }

    // Second pass: parse entities and relationships
    for (const [typeName, typeDef] of modelTypes.entries()) {
      const entity = parseEntity(typeName, typeDef, schemaContent);
      if (entity) {
        entities.push(entity);
      }
    }

    return entities;
  } catch (error) {
    throw new Error(`Failed to parse GraphQL schema: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function parseEntity(
  name: string,
  typeDef: ObjectTypeDefinitionNode,
  schemaContent: string
): Entity | null {
  const fields: GraphQLField[] = [];
  const relationships: Relationship[] = [];

  // Check if this is a junction table (many-to-many)
  const isJunctionTable = name.includes('Product') && 
    (name.includes('Industry') || name.includes('ClientNeed') || 
     name.includes('Feature') || name.includes('Catalog'));

  if (!typeDef.fields) {
    return null;
  }

  for (const field of typeDef.fields) {
    const fieldName = field.name.value;
    const { type, isList, required } = parseFieldType(field.type);

    // Check for relationship directives
    const hasManyDirective = field.directives?.find(
      dir => dir.name.value === 'hasMany'
    );
    const belongsToDirective = field.directives?.find(
      dir => dir.name.value === 'belongsTo'
    );

    if (hasManyDirective) {
      // Extract target entity from field type
      const targetEntity = extractEntityNameFromType(field.type);
      if (targetEntity) {
        relationships.push({
          type: 'hasMany',
          targetEntity,
          fieldName,
        });
      }
    } else if (belongsToDirective) {
      const targetEntity = extractEntityNameFromType(field.type);
      if (targetEntity) {
        relationships.push({
          type: 'belongsTo',
          targetEntity,
          fieldName,
        });
      }
    } else {
      // Regular field
      fields.push({
        name: fieldName,
        type,
        required,
        isList,
      });
    }
  }

  // Also parse relationships from the schema text (for better coverage)
  const schemaRelationships = parseRelationshipsFromText(name, schemaContent);
  relationships.push(...schemaRelationships);

  return {
    name,
    fields,
    relationships,
    isJunctionTable,
  };
}

function parseFieldType(
  typeNode: any
): { type: string; isList: boolean; required: boolean } {
  let current = typeNode;
  let isList = false;
  let required = false;

  while (current) {
    if (current.kind === 'NonNullType') {
      required = true;
      current = current.type;
    } else if (current.kind === 'ListType') {
      isList = true;
      current = current.type;
    } else if (current.kind === 'NamedType') {
      return {
        type: current.name.value,
        isList,
        required,
      };
    } else {
      break;
    }
  }

  return { type: 'Unknown', isList: false, required: false };
}

function extractEntityNameFromType(typeNode: any): string | null {
  let current = typeNode;

  while (current) {
    if (current.kind === 'NonNullType' || current.kind === 'ListType') {
      current = current.type;
    } else if (current.kind === 'NamedType') {
      return current.name.value;
    } else {
      break;
    }
  }

  return null;
}

function parseRelationshipsFromText(
  entityName: string,
  schemaContent: string
): Relationship[] {
  const relationships: Relationship[] = [];
  const lines = schemaContent.split('\n');

  // Find the type definition for this entity
  let inTypeDefinition = false;
  let typeStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(`type ${entityName}`) && line.includes('@model')) {
      inTypeDefinition = true;
      typeStartLine = i;
    }
    if (inTypeDefinition && line.trim().startsWith('type ') && i > typeStartLine) {
      break;
    }
    if (inTypeDefinition) {
      // Look for @hasMany or @belongsTo directives
      if (line.includes('@hasMany')) {
        const match = line.match(/(\w+):\s*\[?(\w+)\]?\s*@hasMany/);
        if (match) {
          relationships.push({
            type: 'hasMany',
            targetEntity: match[2],
            fieldName: match[1],
          });
        }
      } else if (line.includes('@belongsTo')) {
        const match = line.match(/(\w+):\s*(\w+)\s*@belongsTo/);
        if (match) {
          relationships.push({
            type: 'belongsTo',
            targetEntity: match[2],
            fieldName: match[1],
          });
        }
      }
    }
  }

  return relationships;
}

