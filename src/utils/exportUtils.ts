/**
 * Export utilities for GraphQL schema and ER diagram
 */

/**
 * Export GraphQL schema content as a .graphql file
 */
export function exportGraphQLSchema(content: string, filename: string = 'schema.graphql'): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export SVG element as SVG file
 */
export function exportSVG(svgElement: SVGSVGElement, filename: string = 'erd-diagram.svg'): void {
  // Clone the SVG to avoid modifying the original
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Add inline styles for proper rendering
  const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleElement.textContent = `
    .table rect { fill: #fff; stroke: #333; stroke-width: 2; }
    .table text { font-family: Arial, sans-serif; }
    .connections line { stroke: #666; stroke-width: 2; }
    .connections text { font-family: Arial, sans-serif; fill: #333; }
  `;
  clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

  // Serialize SVG to string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  
  // Add XML declaration
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export SVG element as PNG image
 */
export function exportPNG(svgElement: SVGSVGElement, filename: string = 'erd-diagram.png'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Get SVG dimensions
      const width = parseInt(svgElement.getAttribute('width') || '1200', 10);
      const height = parseInt(svgElement.getAttribute('height') || '800', 10);

      // Serialize SVG to string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSvg);
      
      // Add XML declaration and namespace if missing
      if (!svgString.includes('xmlns')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // Create image from SVG data URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create PNG blob'));
            return;
          }
          
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(pngUrl);
          resolve();
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG as image'));
      };
      
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

