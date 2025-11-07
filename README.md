# GraphQL Schema Viewer

A web application that visualizes AWS Amplify/AppSync GraphQL schemas by generating entity-relationship diagrams and interactive node graphs.

## Features

- **File Upload**: Drag and drop or click to upload `.graphql` schema files
- **ER Diagram**: Traditional entity-relationship diagram showing tables and relationships
- **Node Graph**: Interactive network diagram with zoom, pan, and node selection
- **Schema Parsing**: Automatically extracts `@model` types and `@hasMany`/`@belongsTo` relationships

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Usage

1. Start the development server
2. Upload a GraphQL schema file (AWS Amplify/AppSync format with `@model` directives)
3. Toggle between ER Diagram and Node Graph views
4. Explore the entity relationships

## Supported Schema Format

The application supports AWS Amplify/AppSync GraphQL schemas with:
- `@model` directive on type definitions
- `@hasMany` directive for one-to-many relationships
- `@belongsTo` directive for many-to-one relationships
- Junction tables for many-to-many relationships

## Technologies

- React + TypeScript
- Vite
- GraphQL parser
- D3.js (for ER diagrams)
- ReactFlow (for node graphs)
- React Dropzone (for file uploads)

