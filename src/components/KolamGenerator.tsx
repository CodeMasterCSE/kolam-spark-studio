import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Sparkles, Grid3X3, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KolamParams {
  gridSize: number;
  dotSpacing: number;
  symmetryType: 'mirror' | 'rotational' | 'radial' | 'freeform';
  complexity: number;
}

const KolamGenerator = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<KolamParams>({
    gridSize: 9,
    dotSpacing: 40,
    symmetryType: 'rotational',
    complexity: 50,
  });
  const [patternId, setPatternId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Kolam generation using p5.js algorithm
  const generateKolam = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasSize = 600;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    gradient.addColorStop(0, 'hsl(32, 50%, 98%)');
    gradient.addColorStop(1, 'hsl(32, 40%, 96%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Generate pattern seed
    const seed = Date.now().toString(36);
    setPatternId(seed);

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

      // Calculate limit based on complexity
      const limit = (100 - params.complexity) / 100 * 0.3 + 0.4; // 0.4 to 0.7 range

      // Apply symmetry pattern based on type
      if (params.symmetryType === 'rotational') {
        // Original p5.js 8-way rotational symmetry
        for (let i = 0; i < nlink.length; i++) {
          for (let j = i; j < nlink[0].length / 2; j++) {
            const l = Math.random() > limit ? 1 : 0;

            nlink[i][j] = l;
            nlink[i][nlink[0].length - j - 1] = l;
            nlink[j][i] = l;
            nlink[nlink[0].length - j - 1][i] = l;
            nlink[nlink.length - 1 - i][j] = l;
            nlink[nlink.length - 1 - i][nlink[0].length - j - 1] = l;
            nlink[j][nlink.length - 1 - i] = l;
            nlink[nlink[0].length - 1 - j][nlink.length - 1 - i] = l;
          }
        }
      } else {
        // Other symmetry types
        for (let i = 0; i < nlink.length; i++) {
          for (let j = 0; j < nlink[0].length; j++) {
            if (Math.random() > limit) {
              const shouldConnect = 1;
              
              switch (params.symmetryType) {
                case 'mirror':
                  nlink[i][j] = shouldConnect;
                  nlink[i][nlink[0].length - j - 1] = shouldConnect;
                  nlink[nlink.length - 1 - i][j] = shouldConnect;
                  nlink[nlink.length - 1 - i][nlink[0].length - j - 1] = shouldConnect;
                  break;
                case 'radial':
                  const centerX = Math.floor(nlink.length / 2);
                  const centerY = Math.floor(nlink[0].length / 2);
                  const distance = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);
                  for (let angle = 0; angle < 8; angle++) {
                    const rad = (angle * Math.PI) / 4;
                    const x = Math.round(centerX + distance * Math.cos(rad));
                    const y = Math.round(centerY + distance * Math.sin(rad));
                    if (x >= 0 && x < nlink.length && y >= 0 && y < nlink[0].length) {
                      nlink[x][y] = shouldConnect;
                    }
                  }
                  break;
                case 'freeform':
                  nlink[i][j] = shouldConnect;
                  break;
              }
            } else {
              nlink[i][j] = 0;
            }
          }
        }
      }
    };

    configTile();

    // Animate the drawing process
    await animateKolamDrawing(ctx, link, nlink, tnumber, tsize, margin, canvasSize);
    
    setIsGenerating(false);
    toast({
      title: "Kolam Generated!",
      description: `Pattern ID: ${seed}`,
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

        // Clear and redraw background
        const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
        gradient.addColorStop(0, 'hsl(32, 50%, 98%)');
        gradient.addColorStop(1, 'hsl(32, 40%, 96%)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Center the pattern
        ctx.save();
        ctx.translate(canvasSize / 2, canvasSize / 2);
        ctx.rotate(Math.PI / 4); // 45 degree rotation like p5.js
        ctx.translate(-(tsize * tnumber + 2 * margin) / 2, -(tsize * tnumber + 2 * margin) / 2);

        // Draw using p5.js drawTile logic
        ctx.strokeStyle = 'hsl(348, 70%, 40%)';
        ctx.lineWidth = 3;
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
              ctx.fillStyle = 'hsl(20, 25%, 25%)';
              ctx.beginPath();
              ctx.arc(x + tsize / 2, y + tsize / 2, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        ctx.restore();
        idx += 0.02; // Same increment as p5.js
        requestAnimationFrame(animate);
      };
      animate();
    });
  };

  const downloadKolam = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `kolam-${patternId}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Download Started",
      description: "Your Kolam pattern is being downloaded.",
    });
  };

  useEffect(() => {
    generateKolam();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Hero Section */}
      <motion.div 
        className="text-center py-16 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className="heading-traditional mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Kolam Design Identification & Recreation
        </motion.h1>
        <motion.p 
          className="text-cultural mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          AI-powered exploration of traditional Indian Kolam art patterns
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button 
            onClick={generateKolam}
            disabled={isGenerating}
            className="btn-hero"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Kolam'}
          </Button>
        </motion.div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Control Panel */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="kolam-canvas">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Settings2 className="w-5 h-5" />
                  Pattern Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Grid Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Grid Size: {params.gridSize}x{params.gridSize}
                  </label>
                  <Slider
                    value={[params.gridSize]}
                    onValueChange={(value) => setParams(prev => ({ ...prev, gridSize: value[0] }))}
                    min={5}
                    max={15}
                    step={2}
                    className="w-full"
                  />
                </div>

                {/* Dot Spacing */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Dot Spacing: {params.dotSpacing}px
                  </label>
                  <Slider
                    value={[params.dotSpacing]}
                    onValueChange={(value) => setParams(prev => ({ ...prev, dotSpacing: value[0] }))}
                    min={20}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>

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
                      <SelectItem value="rotational">Rotational (8-way)</SelectItem>
                      <SelectItem value="mirror">Mirror</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                      <SelectItem value="freeform">Freeform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Complexity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Complexity: {params.complexity}%
                  </label>
                  <Slider
                    value={[params.complexity]}
                    onValueChange={(value) => setParams(prev => ({ ...prev, complexity: value[0] }))}
                    min={10}
                    max={90}
                    step={10}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={generateKolam}
                  disabled={isGenerating}
                  className="w-full btn-cultural"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </CardContent>
            </Card>

            {/* Pattern Info */}
            {patternId && (
              <Card className="kolam-canvas">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-foreground">Pattern ID</p>
                    <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                      {patternId}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Canvas Area */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Card className="kolam-canvas">
              <CardHeader className="text-center">
                <CardTitle className="text-primary">Kolam Canvas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative animate-float">
                  <canvas
                    ref={canvasRef}
                    className="border-2 border-border/30 rounded-lg shadow-inner bg-kolam-canvas"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={downloadKolam}
                  disabled={!patternId}
                  className="btn-cultural"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default KolamGenerator;