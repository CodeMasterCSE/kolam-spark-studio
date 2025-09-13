export const applyRecursiveSymmetry = (nlink: number[][], limit: number, depth: number = 3) => {
  // Clear the array first - recursive pattern uses direct canvas drawing
  for (let i = 0; i < nlink.length; i++) {
    for (let j = 0; j < nlink[0].length; j++) {
      nlink[i][j] = 0;
    }
  }
  
  // This will be handled by special drawing function instead of matrix manipulation
  return nlink;
};

// Special drawing function for recursive Kolam patterns with diamond and petal shapes
export const drawRecursiveKolam = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  initialSize: number,
  recursionDepth: number,
  lineThickness: number,
  strokeColor: string,
  dotsColor: string
) => {
  const drawConfigShape = (cx: number, cy: number, config: number[], rot: number = 0, size: number = 100) => {
    const [c1, c2, c3, c4] = config;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rot * Math.PI) / 180); // Convert degrees to radians

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineThickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Diamond special case [0,0,0,0]
    if (c1 === 0 && c2 === 0 && c3 === 0 && c4 === 0) {
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Petal-like motif via rounded rect corners
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(
        -size / 2, -size / 2, size, size,
        [
          c1 * (size / 2),  // top-left
          c2 * (size / 2),  // top-right
          c3 * (size / 2),  // bottom-right
          c4 * (size / 2)   // bottom-left
        ]
      );
    } else {
      // Fallback for browsers without roundRect
      ctx.rect(-size / 2, -size / 2, size, size);
    }
    ctx.stroke();

    ctx.restore();
  };

  // Calculate sizes based on depth to fit within canvas
  const baseSize = initialSize;
  
  // Dynamic sizing based on depth to ensure patterns fit within canvas
  let patternSize: number;
  let offset: number;
  
  if (recursionDepth === 1) {
    patternSize = baseSize;
    offset = baseSize * 1.5;
  } else if (recursionDepth === 2) {
    // For 4 patterns in diamond, reduce size to fit
    patternSize = baseSize * 0.6;
    offset = patternSize * 1.8;
  } else if (recursionDepth === 3) {
    // For 9 patterns in 3x3 grid, further reduce size
    patternSize = baseSize * 0.4;
    offset = patternSize * 2.2;
  } else if (recursionDepth === 4) {
    // For 16 patterns in 4x4 grid, even smaller
    patternSize = baseSize * 0.3;
    offset = patternSize * 2.5;
  } else if (recursionDepth === 5) {
    // For 25 patterns in 5x5 grid, smallest size
    patternSize = baseSize * 0.25;
    offset = patternSize * 2.8;
  } else {
    // Fallback for any other depth
    patternSize = baseSize * 0.2;
    offset = patternSize * 3.0;
  }

  // Function to draw a complete pattern (diamond + petals + dots)
  const drawCompletePattern = (centerX: number, centerY: number, size: number) => {
    // Center diamond (big)
    drawConfigShape(centerX, centerY, [0, 0, 0, 0], 0, size);

    // Petals (smaller, rotated 45°)
    const petalSizeAtLevel = size * 0.67;
    drawConfigShape(centerX - size, centerY, [1, 0, 1, 1], 45, petalSizeAtLevel); // left
    drawConfigShape(centerX + size, centerY, [1, 1, 1, 0], 45, petalSizeAtLevel); // right
    drawConfigShape(centerX, centerY - size, [1, 1, 0, 1], 45, petalSizeAtLevel); // top
    drawConfigShape(centerX, centerY + size, [0, 1, 1, 1], 45, petalSizeAtLevel); // bottom

    // Draw dots in the center of diamond and petals
    const dotRadius = Math.max(2, size * 0.08); // Proportional dot size
    ctx.fillStyle = dotsColor; // Use the themed dot color
    
    // Center dot (in diamond)
    ctx.beginPath();
    ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Petal dots
    ctx.beginPath();
    ctx.arc(centerX - size, centerY, dotRadius * 0.8, 0, 2 * Math.PI); // left petal
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + size, centerY, dotRadius * 0.8, 0, 2 * Math.PI); // right petal
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY - size, dotRadius * 0.8, 0, 2 * Math.PI); // top petal
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY + size, dotRadius * 0.8, 0, 2 * Math.PI); // bottom petal
    ctx.fill();
  };

  // Draw patterns based on depth - exponential pattern count
  if (recursionDepth === 1) {
    // Depth 1: 1 pattern at center
    drawCompletePattern(centerX, centerY, patternSize);
  } else if (recursionDepth === 2) {
    // Depth 2: 4 patterns arranged in diamond configuration
    drawCompletePattern(centerX - offset, centerY, patternSize); // left
    drawCompletePattern(centerX + offset, centerY, patternSize); // right
    drawCompletePattern(centerX, centerY - offset, patternSize); // top
    drawCompletePattern(centerX, centerY + offset, patternSize); // bottom
  } else if (recursionDepth === 3) {
    // Depth 3: 16 patterns in solid diamond formation (like the image)
    // Row structure: 1-2-3-4-3-2-1 = 16 total patterns
    const spacing = patternSize * 1.8; // Balanced spacing - not too close, not too far
    
    // Define the diamond pattern rows (top to bottom)
    const diamondRows = [
      // Row 1: 1 pattern (top point)
      [{x: centerX, y: centerY - spacing * 3}],
      
      // Row 2: 2 patterns
      [{x: centerX - spacing, y: centerY - spacing * 2}, {x: centerX + spacing, y: centerY - spacing * 2}],
      
      // Row 3: 3 patterns
      [{x: centerX - spacing * 2, y: centerY - spacing}, {x: centerX, y: centerY - spacing}, {x: centerX + spacing * 2, y: centerY - spacing}],
      
      // Row 4: 4 patterns (widest row)
      [{x: centerX - spacing * 3, y: centerY}, {x: centerX - spacing, y: centerY}, {x: centerX + spacing, y: centerY}, {x: centerX + spacing * 3, y: centerY}],
      
      // Row 5: 3 patterns
      [{x: centerX - spacing * 2, y: centerY + spacing}, {x: centerX, y: centerY + spacing}, {x: centerX + spacing * 2, y: centerY + spacing}],
      
      // Row 6: 2 patterns
      [{x: centerX - spacing, y: centerY + spacing * 2}, {x: centerX + spacing, y: centerY + spacing * 2}],
      
      // Row 7: 1 pattern (bottom point)
      [{x: centerX, y: centerY + spacing * 3}]
    ];
    
    // Draw all patterns
    diamondRows.forEach(row => {
      row.forEach(pos => {
        drawCompletePattern(pos.x, pos.y, patternSize);
      });
    });
  } else if (recursionDepth === 4) {
    // Depth 4: 64 patterns - extends depth 3 (16 patterns) with 48 more patterns
    // Row structure: 1-2-3-4-5-6-7-8-7-6-5-4-3-2-1 = 64 total patterns
    const spacing = patternSize * 1.8; // Increased spacing to prevent overlapping
    
    // Define the extended diamond pattern rows (top to bottom)
    const diamondRows = [
      // Row 1: 1 pattern (top point)
      [{x: centerX, y: centerY - spacing * 7}],
      
      // Row 2: 2 patterns
      [{x: centerX - spacing, y: centerY - spacing * 6}, {x: centerX + spacing, y: centerY - spacing * 6}],
      
      // Row 3: 3 patterns
      [{x: centerX - spacing * 2, y: centerY - spacing * 5}, {x: centerX, y: centerY - spacing * 5}, {x: centerX + spacing * 2, y: centerY - spacing * 5}],
      
      // Row 4: 4 patterns
      [{x: centerX - spacing * 3, y: centerY - spacing * 4}, {x: centerX - spacing, y: centerY - spacing * 4}, {x: centerX + spacing, y: centerY - spacing * 4}, {x: centerX + spacing * 3, y: centerY - spacing * 4}],
      
      // Row 5: 5 patterns
      [{x: centerX - spacing * 4, y: centerY - spacing * 3}, {x: centerX - spacing * 2, y: centerY - spacing * 3}, {x: centerX, y: centerY - spacing * 3}, {x: centerX + spacing * 2, y: centerY - spacing * 3}, {x: centerX + spacing * 4, y: centerY - spacing * 3}],
      
      // Row 6: 6 patterns
      [{x: centerX - spacing * 5, y: centerY - spacing * 2}, {x: centerX - spacing * 3, y: centerY - spacing * 2}, {x: centerX - spacing, y: centerY - spacing * 2}, {x: centerX + spacing, y: centerY - spacing * 2}, {x: centerX + spacing * 3, y: centerY - spacing * 2}, {x: centerX + spacing * 5, y: centerY - spacing * 2}],
      
      // Row 7: 7 patterns
      [{x: centerX - spacing * 6, y: centerY - spacing}, {x: centerX - spacing * 4, y: centerY - spacing}, {x: centerX - spacing * 2, y: centerY - spacing}, {x: centerX, y: centerY - spacing}, {x: centerX + spacing * 2, y: centerY - spacing}, {x: centerX + spacing * 4, y: centerY - spacing}, {x: centerX + spacing * 6, y: centerY - spacing}],
      
      // Row 8: 8 patterns (widest row - center)
      [{x: centerX - spacing * 7, y: centerY}, {x: centerX - spacing * 5, y: centerY}, {x: centerX - spacing * 3, y: centerY}, {x: centerX - spacing, y: centerY}, {x: centerX + spacing, y: centerY}, {x: centerX + spacing * 3, y: centerY}, {x: centerX + spacing * 5, y: centerY}, {x: centerX + spacing * 7, y: centerY}],
      
      // Row 9: 7 patterns
      [{x: centerX - spacing * 6, y: centerY + spacing}, {x: centerX - spacing * 4, y: centerY + spacing}, {x: centerX - spacing * 2, y: centerY + spacing}, {x: centerX, y: centerY + spacing}, {x: centerX + spacing * 2, y: centerY + spacing}, {x: centerX + spacing * 4, y: centerY + spacing}, {x: centerX + spacing * 6, y: centerY + spacing}],
      
      // Row 10: 6 patterns
      [{x: centerX - spacing * 5, y: centerY + spacing * 2}, {x: centerX - spacing * 3, y: centerY + spacing * 2}, {x: centerX - spacing, y: centerY + spacing * 2}, {x: centerX + spacing, y: centerY + spacing * 2}, {x: centerX + spacing * 3, y: centerY + spacing * 2}, {x: centerX + spacing * 5, y: centerY + spacing * 2}],
      
      // Row 11: 5 patterns
      [{x: centerX - spacing * 4, y: centerY + spacing * 3}, {x: centerX - spacing * 2, y: centerY + spacing * 3}, {x: centerX, y: centerY + spacing * 3}, {x: centerX + spacing * 2, y: centerY + spacing * 3}, {x: centerX + spacing * 4, y: centerY + spacing * 3}],
      
      // Row 12: 4 patterns
      [{x: centerX - spacing * 3, y: centerY + spacing * 4}, {x: centerX - spacing, y: centerY + spacing * 4}, {x: centerX + spacing, y: centerY + spacing * 4}, {x: centerX + spacing * 3, y: centerY + spacing * 4}],
      
      // Row 13: 3 patterns
      [{x: centerX - spacing * 2, y: centerY + spacing * 5}, {x: centerX, y: centerY + spacing * 5}, {x: centerX + spacing * 2, y: centerY + spacing * 5}],
      
      // Row 14: 2 patterns
      [{x: centerX - spacing, y: centerY + spacing * 6}, {x: centerX + spacing, y: centerY + spacing * 6}],
      
      // Row 15: 1 pattern (bottom point)
      [{x: centerX, y: centerY + spacing * 7}]
    ];
    
    // Draw all patterns
    diamondRows.forEach(row => {
      row.forEach(pos => {
        drawCompletePattern(pos.x, pos.y, patternSize);
      });
    });
  } else if (recursionDepth === 5) {
    // Depth 5: 256 patterns in diamond formation
    const spacing = patternSize * 1.8; // Increased spacing
    const diamondPositions = [];
    
    // Create diamond formation with 256 patterns
    for (let row = -15; row <= 15; row++) {
      for (let col = -15; col <= 15; col++) {
        const distance = Math.abs(row) + Math.abs(col);
        if (distance <= 15 && diamondPositions.length < 256) {
          const x = centerX + col * spacing * 0.3;
          const y = centerY + row * spacing * 0.3;
          diamondPositions.push({x, y});
        }
      }
    }
    
    diamondPositions.forEach(pos => {
      drawCompletePattern(pos.x, pos.y, patternSize);
    });
  }
};

export default applyRecursiveSymmetry;