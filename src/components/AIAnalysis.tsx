import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Brain, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiAPI, SymmetryAnalysis } from '@/lib/gemini-api';

interface AIAnalysisProps {
  className?: string;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ className }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymmetryAnalysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Convert data URL to base64 for API
      const base64 = uploadedImage.split(',')[1];
      
      const result = await geminiAPI.analyzeKolamSymmetry(base64);
      setAnalysis(result);
      
      toast({
        title: "Analysis Complete!",
        description: `Detected ${result.symmetryType} symmetry with ${result.confidence}% confidence`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the image. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-primary" />
            AI Symmetry Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedImage ? (
            <div className="space-y-3">
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a Kolam image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG up to 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded Kolam"
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={resetAnalysis}
                >
                  ×
                </Button>
              </div>
              
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full"
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Symmetry
                  </>
                )}
              </Button>
            </div>
          )}

          {analysis && (
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Symmetry Type</span>
                <Badge variant="secondary" className="capitalize">
                  {analysis.symmetryType}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analysis.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {analysis.confidence}%
                  </span>
                </div>
              </div>

              {(analysis as any).symmetryScores && (
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-xs">
                  <div className="font-medium mb-2 text-blue-800 dark:text-blue-200">Symmetry Analysis Details:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries((analysis as any).symmetryScores).map(([key, value]) => {
                      const score = value as number * 100;
                      const isHighScore = score > 75;
                      const isMediumScore = score > 50 && score <= 75;
                      const scoreColor = isHighScore ? 'text-green-600 dark:text-green-400' : 
                                        isMediumScore ? 'text-amber-600 dark:text-amber-400' : 
                                        'text-gray-600 dark:text-gray-400';
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="capitalize font-medium">{key}:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 bg-muted/50 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  isHighScore ? 'bg-green-500' : isMediumScore ? 'bg-amber-500' : 'bg-gray-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`font-mono ${scoreColor}`}>{score.toFixed(1)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <div className="font-medium mb-1 text-blue-800 dark:text-blue-200">Detected Symmetry Types:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries((analysis as any).symmetryScores).map(([key, value]) => {
                        const score = value as number * 100;
                        if (score > 65) {
                          let badgeVariant = score > 80 ? 'default' : 'outline';
                          let label = '';
                          
                          switch(key) {
                            case 'horizontal': label = 'Horizontal Mirror'; break;
                            case 'vertical': label = 'Vertical Mirror'; break;
                            case 'diagonal1': label = 'Main Diagonal'; break;
                            case 'diagonal2': label = 'Anti-Diagonal'; break;
                            case 'rotational4': label = '4-Way Rotational'; break;
                            case 'rotational8': label = '8-Way Rotational'; break;
                            case 'combined4Way': label = '4-Way Mirror'; break;
                            default: label = key;
                          }
                          
                          return (
                            <Badge key={key} variant={badgeVariant} className="text-xs">
                              {label} ({score.toFixed(0)}%)
                            </Badge>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-xs text-muted-foreground">
                  {analysis.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Cultural Significance</h4>
                <p className="text-xs text-muted-foreground">
                  {analysis.culturalSignificance}
                </p>
              </div>

              {analysis.geometricProperties.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Geometric Properties</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.geometricProperties.map((prop, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {prop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recommendations</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Please set your Gemini API key in the environment variables to use AI analysis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysis;

