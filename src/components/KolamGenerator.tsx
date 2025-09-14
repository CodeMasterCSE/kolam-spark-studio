import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Grid3X3, Sun, Moon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { symmetryStrategies, SymmetryType } from '@/lib/symmetry';
import { drawRecursiveKolam } from '@/lib/symmetry/recursive';
import { drawFractalKolam } from '@/lib/symmetry/fractal';

interface KolamParams {
  gridSize: number;
  dotSpacing: number;
  symmetryType: SymmetryType;
  lineThickness: number;
  depth: number;
  patternSize: number;
}

const KolamGenerator = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cachedRef = useRef<{
    link: number[][];
    nlink: number[][];
    tnumber: number;
    tsize: number;
    margin: number;
  } | null>(null);
  const [params, setParams] = useState<KolamParams>({
    gridSize: 9,
    dotSpacing: 40,
    symmetryType: '8way',
    lineThickness: 3,
    depth: 3,
    patternSize: 40,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [generatedParams, setGeneratedParams] = useState<KolamParams | null>(null);

  // (removed) custom color redraw hook

  // Kolam generation using p5.js algorithm
  const generateKolam = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate responsive canvas size based on screen height
    const screenHeight = window.innerHeight;
    const availableHeight = screenHeight - 200; // Account for header, footer, and padding
    const canvasSize = Math.min(700, Math.max(500, availableHeight * 0.7)); // Responsive size between 500-700px
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Resolve themed colors from CSS variables for canvas drawing
    const rootStyle = getComputedStyle(document.documentElement);
    const canvasColor = `hsl(${rootStyle.getPropertyValue('--kolam-canvas').trim()})`;
    const linesColor = `hsl(${rootStyle.getPropertyValue('--kolam-lines').trim()})`;
    const dotsColor = `hsl(${rootStyle.getPropertyValue('--kolam-dots').trim()})`;

    // Clear canvas with themed background
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // p5.js algorithm variables
    const tsize = params.dotSpacing;
    const margin = 50;
    const tnumber = params.gridSize;

    // Initialize connection matrices (p5.js style)
    const link: number[][] = [];
    const nlink: number[][] = [];
    
    for (let i = 0; i < tnumber + 1; i++) {
      link[i] = [];
      nlink[i] = [];
      for (let j = 0; j < tnumber + 1; j++) {
        link[i][j] = 1;
        nlink[i][j] = 1;
      }
    }

    // Configure tile connections (p5.js configTile function)
    const configTile = () => {
      // Copy current state to link
      for (let i = 0; i < link.length; i++) {
        for (let j = 0; j < link[0].length; j++) {
          link[i][j] = nlink[i][j];
        }
      }

      // Randomized probability threshold for connections per generation (0.4 to 0.7)
      const limit = 0.4 + Math.random() * 0.3;

      // Apply symmetry pattern based on type using strategies
      if (params.symmetryType === 'recursive') {
        (symmetryStrategies[params.symmetryType] as any)(nlink, limit, params.depth);
      } else {
        symmetryStrategies[params.symmetryType](nlink, limit);
      }
    };

    configTile();

    // Cache the generated pattern so we can redraw without regenerating
    cachedRef.current = { link, nlink, tnumber, tsize, margin };

    // Update the generated parameters to match what was actually generated
    setGeneratedParams({ ...params });

    // Animate the drawing process
    await animateKolamDrawing(ctx, link, nlink, tnumber, tsize, margin, canvasSize);
    
    setIsGenerating(false);
    toast({
      title: "Kolam Generated!",
    });
  };

  const animateKolamDrawing = (
    ctx: CanvasRenderingContext2D,
    link: number[][],
    nlink: number[][],
    tnumber: number,
    tsize: number,
    margin: number,
    canvasSize: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      let idx = 0;
      
      const animate = () => {
        if (idx >= 1) {
          resolve();
          return;
        }

        // Clear and redraw themed background
        const rootStyle = getComputedStyle(document.documentElement);
        const canvasColor = `hsl(${rootStyle.getPropertyValue('--kolam-canvas').trim()})`;
        const linesColor = `hsl(${rootStyle.getPropertyValue('--kolam-lines').trim()})`;
        const dotsColor = `hsl(${rootStyle.getPropertyValue('--kolam-dots').trim()})`;
        ctx.fillStyle = canvasColor;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Handle recursive pattern specially
        if (params.symmetryType === 'recursive') {
          ctx.save();
          ctx.translate(canvasSize / 2, canvasSize / 2);
          
          // Set up drawing context for recursive pattern
          ctx.strokeStyle = linesColor;
          ctx.lineWidth = params.lineThickness;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Calculate initial size based on canvas dimensions for recursive patterns
          const initialSize = Math.min(canvasSize * 0.15, 120);
          
          // Draw the recursive pattern using the depth parameter
          drawRecursiveKolam(ctx, 0, 0, initialSize, params.depth, params.lineThickness, linesColor, dotsColor);
          
          ctx.restore();
        } else if (params.symmetryType === 'fractal') {
          ctx.save();
          ctx.translate(canvasSize / 2, canvasSize / 2);
          
          // Draw the fractal pattern
          drawFractalKolam(ctx, 0, 0, canvasSize, params.lineThickness, linesColor, dotsColor, params.patternSize);
          
          ctx.restore();
        } else {
        // Center the pattern (no rotation like in the 4-way symmetry version)
        ctx.save();
        ctx.translate(canvasSize / 2, canvasSize / 2);
        ctx.translate(-(tsize * tnumber + 2 * margin) / 2, -(tsize * tnumber + 2 * margin) / 2);

        // Draw using p5.js drawTile logic
          ctx.strokeStyle = linesColor;
          ctx.lineWidth = params.lineThickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < tnumber; i++) {
          for (let j = 0; j < tnumber; j++) {
            if ((i + j) % 2 === 0) {
              // Linear interpolation between link and nlink states
              const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
              
              const topLeft = (tsize / 2) * lerp(link[i][j], nlink[i][j], idx);
              const topRight = (tsize / 2) * lerp(link[i + 1][j], nlink[i + 1][j], idx);
              const bottomRight = (tsize / 2) * lerp(link[i + 1][j + 1], nlink[i + 1][j + 1], idx);
              const bottomLeft = (tsize / 2) * lerp(link[i][j + 1], nlink[i][j + 1], idx);

              const x = i * tsize + margin;
              const y = j * tsize + margin;

              // Draw rounded rectangle (p5.js rect with corner radii)
              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(x, y, tsize, tsize, [topLeft, topRight, bottomRight, bottomLeft]);
              } else {
                // Fallback for browsers without roundRect
                ctx.rect(x, y, tsize, tsize);
              }
              ctx.stroke();

              // Draw center point
              ctx.fillStyle = dotsColor;
              ctx.beginPath();
              const dotRadius = Math.max(1, tsize * 0.05); // Proportional to tile size
              ctx.arc(x + tsize / 2, y + tsize / 2, dotRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        ctx.restore();
        }
        idx += 0.02; // Same increment as p5.js
        requestAnimationFrame(animate);
      };
      animate();
    });
  };

  // Redraw using cached pattern with current theme colors (no regeneration)
  const redrawKolamUsingCache = () => {
    const cache = cachedRef.current;
    const canvas = canvasRef.current;
    if (!cache || !canvas) return;

    const { link, nlink, tnumber, tsize, margin } = cache;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate responsive canvas size based on screen height
    const screenHeight = window.innerHeight;
    const availableHeight = screenHeight - 200; // Account for header, footer, and padding
    const canvasSize = Math.min(700, Math.max(500, availableHeight * 0.7)); // Responsive size between 500-700px

    const rootStyle = getComputedStyle(document.documentElement);
    const canvasColor = `hsl(${rootStyle.getPropertyValue('--kolam-canvas').trim()})`;
    const linesColor = `hsl(${rootStyle.getPropertyValue('--kolam-lines').trim()})`;
    const dotsColor = `hsl(${rootStyle.getPropertyValue('--kolam-dots').trim()})`;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Handle recursive pattern specially
    if (params.symmetryType === 'recursive') {
      ctx.save();
      ctx.translate(canvasSize / 2, canvasSize / 2);
      
      // Set up drawing context for recursive pattern
      ctx.strokeStyle = linesColor;
      ctx.lineWidth = params.lineThickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Calculate initial size based on canvas dimensions for recursive patterns
      const initialSize = Math.min(canvasSize * 0.15, 120);
      
      // Draw the recursive pattern using the depth parameter
      drawRecursiveKolam(ctx, 0, 0, initialSize, params.depth, params.lineThickness, linesColor, dotsColor);
      
      ctx.restore();
    } else if (params.symmetryType === 'fractal') {
      ctx.save();
      ctx.translate(canvasSize / 2, canvasSize / 2);
      
      // Draw the fractal pattern
      drawFractalKolam(ctx, 0, 0, canvasSize, params.lineThickness, linesColor, dotsColor, params.patternSize);
      
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(canvasSize / 2, canvasSize / 2);
      ctx.translate(-(tsize * tnumber + 2 * margin) / 2, -(tsize * tnumber + 2 * margin) / 2);

      ctx.strokeStyle = linesColor;
      ctx.lineWidth = params.lineThickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const idx = 1; // final state
    for (let i = 0; i < tnumber; i++) {
      for (let j = 0; j < tnumber; j++) {
        if ((i + j) % 2 === 0) {
          const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
          const topLeft = (tsize / 2) * lerp(link[i][j], nlink[i][j], idx);
          const topRight = (tsize / 2) * lerp(link[i + 1][j], nlink[i + 1][j], idx);
          const bottomRight = (tsize / 2) * lerp(link[i + 1][j + 1], nlink[i + 1][j + 1], idx);
          const bottomLeft = (tsize / 2) * lerp(link[i][j + 1], nlink[i][j + 1], idx);
          const x = i * tsize + margin;
          const y = j * tsize + margin;
          ctx.beginPath();
          if ((ctx as any).roundRect) {
            (ctx as any).roundRect(x, y, tsize, tsize, [topLeft, topRight, bottomRight, bottomLeft]);
          } else {
            ctx.rect(x, y, tsize, tsize);
          }
          ctx.stroke();
          ctx.fillStyle = dotsColor;
          ctx.beginPath();
          const dotRadius = Math.max(1, tsize * 0.05); // Proportional to tile size
          ctx.arc(x + tsize / 2, y + tsize / 2, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
      ctx.restore();
    }
  };

  const downloadKolam = () => {
    const cache = cachedRef.current;
    if (!cache) return;
    const off = document.createElement('canvas');
    renderCachedToCanvas(off, 3);
    const link = document.createElement('a');
    link.download = 'kolam.jpeg';
    link.href = off.toDataURL('image/jpeg', 0.98);
    link.click();

    toast({
      title: "Download Started",
      description: "Your Kolam pattern is being downloaded.",
    });
  };

  // removed SVG export per request

  const downloadAsPDF = async () => {
    const cache = cachedRef.current;
    if (!cache) return;
    try {
      const mod = await import(/* @vite-ignore */ 'https://cdn.skypack.dev/jspdf');
      const jsPDF = (mod as any).jsPDF || (mod as any).default;
      // Render at high scale for crisp PDF embedding
      const off = document.createElement('canvas');
      renderCachedToCanvas(off, 4);
      const imgData = off.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [off.width, off.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, off.width, off.height);
      pdf.save('kolam.pdf');
    } catch (e) {
      toast({ title: 'PDF export failed', description: 'Dependency not available.' });
    }
  };

  // Render cached pattern to a provided canvas with an optional scale factor for high-res exports
  const renderCachedToCanvas = (targetCanvas: HTMLCanvasElement, scale = 1) => {
    const cache = cachedRef.current;
    if (!cache) return;
    const { link, nlink, tnumber, tsize, margin } = cache;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate responsive canvas size based on screen height
    const screenHeight = window.innerHeight;
    const availableHeight = screenHeight - 200; // Account for header, footer, and padding
    const canvasSize = Math.min(700, Math.max(500, availableHeight * 0.7)); // Responsive size between 500-700px
    
    const rootStyle = getComputedStyle(document.documentElement);
    const canvasColor = `hsl(${rootStyle.getPropertyValue('--kolam-canvas').trim()})`;
    const linesColor = `hsl(${rootStyle.getPropertyValue('--kolam-lines').trim()})`;
    const dotsColor = `hsl(${rootStyle.getPropertyValue('--kolam-dots').trim()})`;

    const scaledSize = Math.round(canvasSize * scale);
    const tsizeScaled = tsize * scale;
    const marginScaled = margin * scale;

    targetCanvas.width = scaledSize;
    targetCanvas.height = scaledSize;

    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, scaledSize, scaledSize);

    // Handle recursive pattern specially
    if (params.symmetryType === 'recursive') {
      ctx.save();
      ctx.translate(scaledSize / 2, scaledSize / 2);
      
      // Set up drawing context for recursive pattern
      ctx.strokeStyle = linesColor;
      ctx.lineWidth = params.lineThickness * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Calculate initial size based on canvas dimensions for recursive patterns
      const initialSize = Math.min(scaledSize * 0.15, 120 * scale);
      
      // Draw the recursive pattern using the depth parameter
      drawRecursiveKolam(ctx, 0, 0, initialSize, params.depth, params.lineThickness * scale, linesColor, dotsColor);
      
      ctx.restore();
    } else if (params.symmetryType === 'fractal') {
      ctx.save();
      ctx.translate(scaledSize / 2, scaledSize / 2);
      
      // Draw the fractal pattern
      drawFractalKolam(ctx, 0, 0, scaledSize, params.lineThickness * scale, linesColor, dotsColor, params.patternSize * scale);
      
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(scaledSize / 2, scaledSize / 2);
      ctx.translate(-(tsizeScaled * tnumber + 2 * marginScaled) / 2, -(tsizeScaled * tnumber + 2 * marginScaled) / 2);

      ctx.strokeStyle = linesColor;
      ctx.lineWidth = params.lineThickness * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const idx = 1;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    for (let i = 0; i < tnumber; i++) {
      for (let j = 0; j < tnumber; j++) {
        if ((i + j) % 2 === 0) {
          const topLeft = (tsizeScaled / 2) * lerp(link[i][j], nlink[i][j], idx);
          const topRight = (tsizeScaled / 2) * lerp(link[i + 1][j], nlink[i + 1][j], idx);
          const bottomRight = (tsizeScaled / 2) * lerp(link[i + 1][j + 1], nlink[i + 1][j + 1], idx);
          const bottomLeft = (tsizeScaled / 2) * lerp(link[i][j + 1], nlink[i][j + 1], idx);
          const x = i * tsizeScaled + marginScaled;
          const y = j * tsizeScaled + marginScaled;
          ctx.beginPath();
          if ((ctx as any).roundRect) {
            (ctx as any).roundRect(x, y, tsizeScaled, tsizeScaled, [topLeft, topRight, bottomRight, bottomLeft]);
          } else {
            ctx.rect(x, y, tsizeScaled, tsizeScaled);
          }
          ctx.stroke();
          ctx.fillStyle = dotsColor;
          ctx.beginPath();
          const dotRadius = Math.max(1, tsizeScaled * 0.05); // Proportional to scaled tile size
          ctx.arc(x + tsizeScaled / 2, y + tsizeScaled / 2, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
      ctx.restore();
    }
  };

  useEffect(() => {
    generateKolam();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', shouldDark);
    setIsDark(shouldDark);
    // Listen for system theme changes when no explicit theme is stored
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const nextIsDark = event.matches;
        document.documentElement.classList.toggle('dark', nextIsDark);
        setIsDark(nextIsDark);
        // Redraw with cached pattern to match new theme
        redrawKolamUsingCache();
      }
    };
    try {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } catch {
      // Safari fallback
      mediaQuery.addListener(handleSystemThemeChange as any);
    }
    return () => {
      try {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } catch {
        mediaQuery.removeListener(handleSystemThemeChange as any);
      }
    };
  }, []);

  // Window resize listener for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (cachedRef.current) {
        redrawKolamUsingCache();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    // Redraw with cached pattern and new theme colors
    redrawKolamUsingCache();
  };

  return (
    <div className="h-screen flex flex-col grid-background overflow-hidden">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/kolamkari-logo.png" 
              alt="KolamKari" 
              className="h-10 w-auto"
              onError={(e) => {
                // Fallback to text logo if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center gap-0.5 bg-primary px-3 py-1 rounded-lg">
              <span className="text-3xl font-bold text-background leading-none">K</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium tracking-tight leading-none text-background">olam</span>
                <span className="text-sm font-medium tracking-tight leading-none text-background">ari</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
            <Button variant="secondary" size="sm" onClick={toggleTheme} className="ml-2">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-4 py-6 overflow-hidden min-h-0">
        <div className="grid lg:grid-cols-7 gap-8 h-full min-h-0">
          {/* Control Panel */}
          <motion.div 
            className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="glass-panel flex-1 flex flex-col min-h-0 overflow-hidden" style={{ maxHeight: '100%' }}>
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="section-title text-primary">
                  Pattern Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 panel-scroll flex-1 overflow-y-auto pr-2 pb-6 min-h-0 max-h-full" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {/* Grid Size - Hidden for Recursive and Fractal patterns */}
                {params.symmetryType !== 'recursive' && params.symmetryType !== 'fractal' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Grid Size: {params.gridSize}x{params.gridSize}
                  </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setParams(prev => ({ ...prev, gridSize: Math.max(5, prev.gridSize - 2) }))}
                        aria-label="Decrease grid size"
                      >
                        -
                      </Button>
                      <div className="min-w-[3rem] text-center font-medium">{params.gridSize}</div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setParams(prev => ({ ...prev, gridSize: Math.min(9, prev.gridSize + 2) }))}
                        aria-label="Increase grid size"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Controls the number of tiles drawn across and down.</p>
                </div>
                )}

                {/* Dot Spacing - Hidden for Recursive and Fractal patterns */}
                {params.symmetryType !== 'recursive' && params.symmetryType !== 'fractal' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Dot Spacing: {params.dotSpacing}px
                  </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setParams(prev => ({ ...prev, dotSpacing: Math.max(20, prev.dotSpacing - 5) }))}
                        aria-label="Decrease dot spacing"
                      >
                        -
                      </Button>
                      <div className="min-w-[3rem] text-center font-medium">{params.dotSpacing}</div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setParams(prev => ({ ...prev, dotSpacing: Math.min(50, prev.dotSpacing + 5) }))}
                        aria-label="Increase dot spacing"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Distance between grid points; higher values yield more breathing room.</p>
                </div>
                )}

                {/* Symmetry Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Symmetry Type
                  </label>
                  <Select
                    value={params.symmetryType}
                    onValueChange={(value: KolamParams['symmetryType']) => 
                      setParams(prev => ({ ...prev, symmetryType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8way">8-Way Rotational</SelectItem>
                      <SelectItem value="4way">4-Way Mirror</SelectItem>
                      <SelectItem value="vertical">Vertical Mirror</SelectItem>
                      <SelectItem value="horizontal">Horizontal Mirror</SelectItem>
                      <SelectItem value="diagonal">Diagonal</SelectItem>
                      <SelectItem value="recursive">Recursive</SelectItem>
                      <SelectItem value="fractal">Fractal</SelectItem>
                      <SelectItem value="fibonacci">Fibonacci</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choose the geometric principle used to mirror or repeat motifs.</p>
                </div>

                {/* Depth - Only show for Recursive symmetry */}
                {params.symmetryType === 'recursive' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                      Depth: {params.depth}
                  </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setParams(prev => ({ ...prev, depth: Math.max(1, prev.depth - 1) }))}
                        aria-label="Decrease depth"
                      >
                        -
                      </Button>
                      <div className="min-w-[3rem] text-center font-medium">{params.depth}</div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setParams(prev => ({ ...prev, depth: Math.min(4, prev.depth + 1) }))}
                        aria-label="Increase depth"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Controls how many levels of recursion the pattern will have.</p>
                </div>
                )}

                {/* Line Thickness */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Line Thickness: {params.lineThickness}px
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setParams(prev => ({ ...prev, lineThickness: Math.max(1, prev.lineThickness - 1) }))}
                      aria-label="Decrease line thickness"
                    >
                      -
                    </Button>
                    <div className="min-w-[3rem] text-center font-medium">{params.lineThickness}</div>
                <Button 
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setParams(prev => ({ ...prev, lineThickness: Math.min(8, prev.lineThickness + 1) }))}
                      aria-label="Increase line thickness"
                    >
                      +
                </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Adjusts stroke width of lines on the canvas.</p>
                </div>

                {/* Pattern Size - Only show for Fractal patterns */}
                {params.symmetryType === 'fractal' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Pattern Size: {params.patternSize}px
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setParams(prev => ({ ...prev, patternSize: Math.max(20, prev.patternSize - 5) }))}
                        aria-label="Decrease pattern size"
                      >
                        -
                      </Button>
                      <div className="min-w-[3rem] text-center font-medium">{params.patternSize}</div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setParams(prev => ({ ...prev, patternSize: Math.min(80, prev.patternSize + 5) }))}
                        aria-label="Increase pattern size"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Controls the size of individual square patterns in the fractal.</p>
                  </div>
                )}

                
              </CardContent>
            </Card>
          </motion.div>

          {/* Canvas Area */}
          <motion.div 
            className="lg:col-span-3 flex flex-col -mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Card className="kolam-canvas flex-1 flex flex-col">
              <CardHeader className="space-y-2 flex-shrink-0 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary section-title">Kolam Canvas</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={generateKolam} disabled={isGenerating} variant="secondary" className="hidden sm:inline-flex">
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Regenerate'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="btn-cultural">
                  <Download className="w-4 h-4 mr-2" />
                          Download
                </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={downloadKolam}>JPEG</DropdownMenuItem>
                        <DropdownMenuItem onClick={downloadAsPDF}>PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center flex-1 pt-2">
                <div className="relative soft-border">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-border/30 rounded-lg shadow-inner bg-kolam-canvas"
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      maxHeight: '70vh',
                      width: 'auto'
                    }}
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Characteristics Panel */}
          <motion.div 
            className="lg:col-span-2 flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Card className="glass-panel flex-1 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="section-title text-primary">Kolam Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto">
                {generatedParams ? (
                  <>
                <div className="grid gap-3 text-sm">
                  {generatedParams.symmetryType !== 'recursive' && generatedParams.symmetryType !== 'fractal' && (
                    <>
                  <div className="flex justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">Grid Size</span>
                            <span className="font-medium">{generatedParams.gridSize}×{generatedParams.gridSize}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">Dot Spacing</span>
                            <span className="font-medium">{generatedParams.dotSpacing}px</span>
                  </div>
                    </>
                  )}
                  
                  {generatedParams.symmetryType === 'fractal' && (
                    <div className="flex justify-between border-b border-border/20 pb-2">
                      <span className="text-muted-foreground">Pattern Size</span>
                      <span className="font-medium">{generatedParams.patternSize}px</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-b border-border/20 pb-2">
                    <span className="text-muted-foreground">Symmetry</span>
                    <span className="font-medium capitalize">
                          {generatedParams.symmetryType === '8way' ? '8-Way Rotational' : 
                           generatedParams.symmetryType === '4way' ? '4-Way Mirror' : 
                           generatedParams.symmetryType}
                    </span>
                  </div>
                  
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cultural Origin</span>
                    <span className="font-medium">South Indian</span>
                  </div>
                </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="secondary">{generatedParams.gridSize} × {generatedParams.gridSize}</Badge>
                      <Badge variant="outline" className="capitalize">{generatedParams.symmetryType}</Badge>
                      <Badge variant="secondary">{generatedParams.dotSpacing}px spacing</Badge>
                </div>

                <div className="mt-6 p-3 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2 text-primary section-title text-base">About This Pattern</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                        {generatedParams.symmetryType === '8way' && "This Kolam features traditional 8-way rotational symmetry, creating harmonious patterns that radiate from the center with perfect balance."}
                        {generatedParams.symmetryType === '4way' && "This Kolam uses 4-way mirror symmetry, reflecting horizontally and vertically to create a balanced, cross-like pattern structure."}
                        {generatedParams.symmetryType === 'recursive' && "This recursive Kolam pattern contains self-similar structures at different scales, creating fractal-like beauty within the traditional format."}
                        {generatedParams.symmetryType === 'fractal' && "This fractal Kolam uses mathematical principles to create patterns that repeat at multiple levels, inspired by sacred geometry."}
                        {generatedParams.symmetryType === 'fibonacci' && "This Fibonacci Kolam incorporates the golden ratio and natural spiral patterns, connecting ancient art with mathematical harmony."}
                  </p>
                </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No Kolam generated yet</p>
                    <p className="text-sm">Generate a pattern to see its characteristics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <footer className="site-footer sticky bottom-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/70 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between text-xs">
          <span>© {new Date().getFullYear()} Kolamkari</span>
          <span className="text-center">Inspired by traditional Kolam art</span>
          <span>A SIH 2025 Project Demo</span>
        </div>
      </footer>
    </div>
  );
};

export default KolamGenerator;