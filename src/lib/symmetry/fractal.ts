export const applyFractalSymmetry = (nlink: number[][], limit: number) => {
  // Clear the array first - fractal pattern uses direct canvas drawing
  for (let i = 0; i < nlink.length; i++) {
    for (let j = 0; j < nlink[0].length; j++) {
      nlink[i][j] = 0;
    }
  }
  
  // This will be handled by special drawing function instead of matrix manipulation
  return nlink;
};

// Special drawing function for fractal Kolam patterns with recursive squares
export const drawFractalKolam = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  canvasSize: number,
  lineThickness: number,
  strokeColor: string,
  dotsColor: string,
  patternSize: number = 40
) => {
  const visited = new Set<string>();
  const size = patternSize; // Use the patternSize parameter

  // Draw a single square
  const drawSquare = (x: number, y: number, s: number) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineThickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeRect(x - s/2, y - s/2, s, s);
  };

  // Draw a single motif (central square + 4 outer squares + dots)
  const drawMotif = (cx: number, cy: number, s: number) => {
    // Draw central square
    drawSquare(cx, cy, s);

    // Draw 4 outer squares at vertices
    const outerCenters = [
      { x: cx - s, y: cy - s },
      { x: cx + s, y: cy - s },
      { x: cx + s, y: cy + s },
      { x: cx - s, y: cy + s }
    ];

    for (const outer of outerCenters) {
      drawSquare(outer.x, outer.y, s);
    }

    // Draw dots at centers - scale with pattern size
    ctx.fillStyle = dotsColor;
    const dotRadius = Math.max(2, s * 0.125); // Proportional to square size
    ctx.beginPath();
    ctx.arc(cx, cy, dotRadius, 0, 2 * Math.PI);
    ctx.fill();

    for (const outer of outerCenters) {
      ctx.beginPath();
      ctx.arc(outer.x, outer.y, dotRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  // Recursive pattern drawing function - faithful to original p5.js
  const drawPattern = (cx: number, cy: number, s: number) => {
    // Skip if already visited
    const key = `${cx},${cy}`;
    if (visited.has(key)) return;
    visited.add(key);

    // Calculate the total size this motif will occupy (central + 2 outer squares)
    // The motif extends from (cx - s) to (cx + s) horizontally and vertically
    const totalSize = s * 2; // Total width/height of the motif
    
    // Stop if the motif is completely outside the canvas
    // Using half canvas size since we're centered at (0,0)
    const halfCanvas = canvasSize / 2;
    const margin = 10; // Small margin to ensure patterns stay within bounds
    
    if (cx - totalSize/2 < -halfCanvas + margin || 
        cx + totalSize/2 > halfCanvas - margin || 
        cy - totalSize/2 < -halfCanvas + margin || 
        cy + totalSize/2 > halfCanvas - margin) {
      return;
    }

    // Draw this motif
    drawMotif(cx, cy, s);

    // Distance to place next motifs - exactly like original p5.js
    const offset = s * 2;

    // Recurse diagonally - exactly like original p5.js
    drawPattern(cx - offset, cy - offset, s);
    drawPattern(cx + offset, cy - offset, s);
    drawPattern(cx + offset, cy + offset, s);
    drawPattern(cx - offset, cy + offset, s);
  };

  // Start drawing from center
  drawPattern(centerX, centerY, size);
};

export default applyFractalSymmetry;
