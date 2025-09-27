import React, { useRef, useEffect } from 'react';

interface KolamAnimationProps {
  size?: number;
  dotColor?: string;
  lineColor?: string;
}

const KolamAnimation: React.FC<KolamAnimationProps> = ({
  size = 200, // Size of the Kolam pattern
  dotColor = '#FFFFFF',
  lineColor = '#FF69B4',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawKolam = () => {
      const scale = size / 200; // Scale factor based on a reference size of 200px
      const dotRadius = 2 * scale;
      const lineThickness = 3 * scale;
      const gridUnit = 20 * scale; // Distance between dots in the original image

      ctx.strokeStyle = lineColor;
      ctx.fillStyle = dotColor;
      ctx.lineWidth = lineThickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Function to draw a line
      const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      };

      // Function to draw a dot
      const drawDot = (x: number, y: number) => {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Draw the 5x5 grid of dots
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          drawDot(gridUnit * (i + 1), gridUnit * (j + 1));
        }
      }

      // Draw the specific Kolam pattern for one corner
      const drawCornerPattern = (offsetX: number, offsetY: number) => {
        // This needs to be replaced with the actual Kolam design from the image
        // Drawing the specific Kolam design based on the user's request
        // This is a placeholder and needs to be refined with exact coordinates from the image

        // Example: a simple square pattern using the dots
        drawLine(offsetX + gridUnit * 0, offsetY + gridUnit * 0, offsetX + gridUnit * 1, offsetY + gridUnit * 0);
        drawLine(offsetX + gridUnit * 1, offsetY + gridUnit * 0, offsetX + gridUnit * 1, offsetY + gridUnit * 1);
        drawLine(offsetX + gridUnit * 1, offsetY + gridUnit * 1, offsetX + gridUnit * 0, offsetY + gridUnit * 1);
        drawLine(offsetX + gridUnit * 0, offsetY + gridUnit * 1, offsetX + gridUnit * 0, offsetY + gridUnit * 0);

        // Additional lines for the specific Kolam design
        drawLine(offsetX + gridUnit * 0, offsetY + gridUnit * 0, offsetX + gridUnit * 2, offsetY + gridUnit * 2);
        drawLine(offsetX + gridUnit * 0, offsetY + gridUnit * 1, offsetX + gridUnit * 1, offsetY + gridUnit * 2);
        drawLine(offsetX + gridUnit * 1, offsetY + gridUnit * 0, offsetX + gridUnit * 2, offsetY + gridUnit * 1);
        drawLine(offsetX + gridUnit * 2, offsetY + gridUnit * 0, offsetX + gridUnit * 0, offsetY + gridUnit * 2);
      };

      // Top-left corner
      ctx.save();
      ctx.translate(gridUnit, gridUnit);
      drawCornerPattern(0, 0);
      ctx.restore();

      // Top-right corner
      ctx.save();
      ctx.translate(size - gridUnit * 3, gridUnit);
      ctx.scale(-1, 1); // Flip horizontally
      drawCornerPattern(0, 0);
      ctx.restore();

      // Bottom-left corner
      ctx.save();
      ctx.translate(gridUnit, size - gridUnit * 3);
      ctx.scale(1, -1); // Flip vertically
      drawCornerPattern(0, 0);
      ctx.restore();

      // Bottom-right corner
      ctx.save();
      ctx.translate(size - gridUnit * 3, size - gridUnit * 3);
      ctx.scale(-1, -1); // Flip horizontally and vertically
      drawCornerPattern(0, 0);
      ctx.restore();

      // Central grid lines (simplified for now)
      for (let i = 1; i < 5; i++) {
        drawLine(gridUnit * i, gridUnit * 1, gridUnit * i, gridUnit * 5); // Vertical lines
        drawLine(gridUnit * 1, gridUnit * i, gridUnit * 5, gridUnit * i); // Horizontal lines
      }

      // Additional loops and connections will be added here to complete the pattern.
    };

    drawKolam();
  }, [size, dotColor, lineColor]);

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default KolamAnimation;