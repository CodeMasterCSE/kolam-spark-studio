import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Brain, Loader2, AlertCircle, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiAPI, SymmetryAnalysis } from '@/lib/gemini-api';

interface AIInterfaceProps {
  onClose: () => void;
}

const AIInterface: React.FC<AIInterfaceProps> = ({ onClose }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymmetryAnalysis | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isUsingGemini, setIsUsingGemini] = useState(false);

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
      setActiveTab('analyze');
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setIsUsingGemini(true);

    try {
      // Pass the full data URL to the API
      console.log('Starting Gemini AI analysis for image:', uploadedImage.substring(0, 50) + '...');
      console.log('Image data length:', uploadedImage.length);
      console.log('Image MIME type:', uploadedImage.split(',')[0]);
      
      const result = await geminiAPI.analyzeKolamSymmetry(uploadedImage);
      console.log('Gemini analysis result:', result);
      
      setAnalysis(result);
      setActiveTab('results');
      setAnalysisCount(prev => prev + 1);
      
      toast({
        title: "Gemini AI Analysis Complete!",
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
      setIsUsingGemini(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setUploadedImage(null);
    setActiveTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Kolam Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">Upload and analyze Kolam patterns with AI</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} className="space-y-6 mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="analyze" disabled={!uploadedImage}>Analyze</TabsTrigger>
              <TabsTrigger value="results" disabled={!analysis}>Results</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                >
                  <Upload className="w-5 h-5" />
                  Click to Upload Image
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">or drag and drop an image here (max 10MB)</p>
              </div>
              {uploadedImage && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploaded Image:</h4>
                  <img
                    src={uploadedImage}
                    alt="Uploaded Kolam"
                    className="w-full h-64 object-contain rounded-lg border shadow-lg"
                  />
                  <div className="flex gap-2">
                    <Button onClick={analyzeImage} className="flex-1" disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isUsingGemini ? 'Gemini AI Analyzing...' : 'Analyzing...'}
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze with Gemini AI
                        </>
                      )}
                    </Button>
                    <Button onClick={resetAnalysis} variant="outline" className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Clear Image
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="analyze" className="space-y-4 mt-4">
              {/* Content for analyze tab */}
              {uploadedImage ? (
                <div className="space-y-4">
                  <h4 className="font-medium">Image to Analyze:</h4>
                  <img
                    src={uploadedImage}
                    alt="Uploaded Kolam"
                    className="w-full h-64 object-contain rounded-lg border shadow-lg"
                  />
                  <div className="flex gap-2">
                    <Button onClick={analyzeImage} className="flex-1" disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isUsingGemini ? 'Gemini AI Analyzing...' : 'Analyzing...'}
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze with Gemini AI
                        </>
                      )}
                    </Button>
                    <Button onClick={resetAnalysis} variant="outline" className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Clear Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No image uploaded.</p>
                  <p>Please upload an image in the "Upload Image" tab.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="results" className="space-y-4 mt-4">
              {/* Content for results tab */}
              {analysis ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Analysis complete! Detected <span className="text-2xl font-bold text-primary">{analysis.symmetryType}</span> symmetry with{' '}
                      <span className={`font-semibold ${getConfidenceColor(analysis.confidence)}`}>
                        {analysis.confidence}%
                      </span>{' '}
                      confidence.
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Symmetry Details:</h4>
                      <p>
                        <span className="font-semibold">Type:</span> <span className="text-xl font-bold text-primary">{analysis.symmetryType}</span>
                      </p>
                      <p>
                        <span className="font-semibold">Confidence:</span>{' '}
                        <span className={`text-lg font-bold ${getConfidenceColor(analysis.confidence)}`}>{analysis.confidence}%</span>
                      </p>
                      {analysis.axis && (
                        <p>
                          <span className="font-semibold">Axis:</span> {analysis.axis}
                        </p>
                      )}
                      {analysis.explanation && (
                        <p>
                          <span className="font-semibold">Explanation:</span> {analysis.explanation}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {analysis.description}
                      </p>
                    </div>
                    
                    {/* Cultural Significance */}
                    {/* <h4 className="font-medium mb-2">Cultural Significance:</h4>
                    <p>{analysis.culturalSignificance || 'No specific cultural significance provided for this symmetry type.'}</p> */}
                    
                    {/* Geometric Properties */}
                    {/* <h4 className="font-medium mb-2">Geometric Properties:</h4> */}
                  </div>
                  <Button onClick={resetAnalysis} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Analyze Another Kolam
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No analysis results yet.</p>
                  <p>Upload an image and click 'Analyze' to see results.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInterface;
