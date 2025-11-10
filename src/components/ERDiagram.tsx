import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';
import { ERDDiagram } from '../types/schema';

interface ERDiagramProps {
  diagram: ERDDiagram;
}

export interface ERDiagramRef {
  getSVGElement: () => SVGSVGElement | null;
}

export const ERDiagram = forwardRef<ERDiagramRef, ERDiagramProps>(({ diagram }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useImperativeHandle(ref, () => ({
    getSVGElement: () => svgRef.current,
  }));

  useEffect(() => {
    if (!svgRef.current || diagram.tables.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Calculate bounding box of all tables
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const tableWidth = 300;
    
    diagram.tables.forEach((table) => {
      const headerHeight = 30;
      const rowHeight = 25;
      const tableHeight = headerHeight + (table.fields.length * rowHeight) + 10;
      
      minX = Math.min(minX, table.x);
      minY = Math.min(minY, table.y);
      maxX = Math.max(maxX, table.x + tableWidth);
      maxY = Math.max(maxY, table.y + tableHeight);
    });

    // Add padding around the content
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Calculate dimensions
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const width = Math.max(1200, contentWidth);
    const height = Math.max(800, contentHeight);

    // Set SVG dimensions and viewBox to include all content
    // viewBox format: "minX minY width height"
    svg.attr('width', width)
       .attr('height', height)
       .attr('viewBox', `${minX} ${minY} ${contentWidth} ${contentHeight}`);

    // Draw connections first (so they appear behind tables)
    const connections = svg.append('g').attr('class', 'connections');

    diagram.connections.forEach((conn) => {
      const fromTable = diagram.tables.find(t => t.id === conn.from);
      const toTable = diagram.tables.find(t => t.id === conn.to);
      
      if (!fromTable || !toTable) return;

      const fromX = fromTable.x + 150; // Center of table
      const fromY = fromTable.y + 30;
      const toX = toTable.x + 150;
      const toY = toTable.y + 30;

      // Draw line
      connections
        .append('line')
        .attr('x1', fromX)
        .attr('y1', fromY)
        .attr('x2', toX)
        .attr('y2', toY)
        .attr('stroke', '#666')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)');

      // Add relationship type label
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      connections
        .append('text')
        .attr('x', midX)
        .attr('y', midY - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .attr('background', 'white')
        .text(conn.type);
    });

    // Define arrow marker
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3, 0 6')
      .attr('fill', '#666');

    // Draw tables
    const tables = svg.append('g').attr('class', 'tables');

    diagram.tables.forEach((table) => {
      const tableGroup = tables.append('g').attr('class', 'table');

      // Calculate table height based on fields
      const headerHeight = 30;
      const rowHeight = 25;
      const tableHeight = headerHeight + (table.fields.length * rowHeight) + 10;

      // Draw table rectangle
      tableGroup
        .append('rect')
        .attr('x', table.x)
        .attr('y', table.y)
        .attr('width', 300)
        .attr('height', tableHeight)
        .attr('fill', table.relationships.length > 0 ? '#e3f2fd' : '#fff')
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('rx', 4);

      // Draw header
      tableGroup
        .append('rect')
        .attr('x', table.x)
        .attr('y', table.y)
        .attr('width', 300)
        .attr('height', headerHeight)
        .attr('fill', '#2196f3')
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('rx', 4);

      // Table name
      tableGroup
        .append('text')
        .attr('x', table.x + 150)
        .attr('y', table.y + 20)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .text(table.name);

      // Draw fields
      table.fields.forEach((field, index) => {
        const fieldY = table.y + headerHeight + (index * rowHeight) + 20;
        
        // Field name and type
        const fieldText = `${field.name}: ${field.type}${field.required ? '!' : ''}${field.isList ? '[]' : ''}`;
        tableGroup
          .append('text')
          .attr('x', table.x + 10)
          .attr('y', fieldY)
          .attr('font-size', '12px')
          .attr('fill', '#333')
          .text(fieldText);
      });

      // Add relationship indicator
      if (table.relationships.length > 0) {
        tableGroup
          .append('text')
          .attr('x', table.x + 150)
          .attr('y', table.y + tableHeight - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('fill', '#666')
          .text(`${table.relationships.length} relationship(s)`);
      }
    });
  }, [diagram]);

  if (diagram.tables.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No schema data to display. Please upload a GraphQL schema file.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
      <svg ref={svgRef} style={{ display: 'block' }}></svg>
    </div>
  );
});

