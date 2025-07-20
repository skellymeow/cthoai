'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Send, Eye, Upload, Download, Image as ImageIcon, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { ContentArea } from "@/components/layout/content-area";
import { BottomBar } from "@/components/layout/bottom-bar";
import { useAuth } from "@/components/auth/AuthProvider";
import { animations, hoverAnimations, variants } from "@/lib/animations";

interface VisionAnalysis {
  id: string;
  image_url: string;
  prompt: string;
  response: string;
  model: string;
  created_at: string;
}

interface Model {
  id: string;
  name: string;
  image: string;
  description: string;
}

const models: Model[] = [
  {
    id: 'yorickvp/llava-13b',
    name: 'LLaVA 13B',
    image: '/chatgpt.png',
    description: 'Advanced vision-language model'
  }
];

export default function AiVisionPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  const [systemPrompt, setSystemPrompt] = useState('You are an AI vision assistant. Analyze images and provide detailed descriptions and insights.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visionAnalyses, setVisionAnalyses] = useState<VisionAnalysis[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch vision analyses on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchVisionAnalyses();
    }
  }, [user]);

  // Prevent hydration mismatch by not rendering until we have user data
  if (!user) {
    return null;
  }

  const fetchVisionAnalyses = async () => {
    try {
      const response = await fetch('/api/vision');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVisionAnalyses(data.analyses);
        }
      }
    } catch (error) {
      console.error('Failed to fetch vision analyses:', error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedImage || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', prompt.trim());
      formData.append('model', selectedModel.id);

      const response = await fetch('/api/generate-vision', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      
      if (data.success) {
        setPrompt('');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refresh analyses list
        await fetchVisionAnalyses();
      } else {
        throw new Error(data.error || 'Failed to analyze image');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleDownload = async (analysisId: string, imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.slice(0, 30)}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <PageLayout>
      <ContentArea>
        <motion.div 
          className="flex-1 overflow-y-auto p-4"
          {...animations.fade}
        >
          {error && (
            <motion.div
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
              {...animations.slide.up}
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {visionAnalyses.map((analysis) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-square relative bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                              <Eye className="w-8 h-8 text-primary" />
                            </div>
                          </div>
                          
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        
                        {/* Image preview */}
                        <div className="absolute inset-0">
                          <Image
                            src={analysis.image_url}
                            alt="Analyzed image"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      </div>
                      
                      {/* Analysis Content */}
                      <div className="p-4 space-y-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {analysis.prompt}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {analysis.model} • {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {/* Analysis Response */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Analysis</span>
                          </div>
                          <p className="text-sm text-foreground line-clamp-3">
                            {analysis.response}
                          </p>
                        </div>
                        
                        {/* Download Button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDownload(analysis.id, analysis.image_url, analysis.prompt)}
                            className="p-2 hover:bg-muted rounded transition-colors"
                            title="Download image"
                          >
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <Card className="overflow-hidden">
                  <div className="aspect-square relative bg-muted flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <Eye className="w-8 h-8 text-muted-foreground animate-pulse" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-muted-foreground">Analyzing image...</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </ContentArea>

      <BottomBar>
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
          <Select value={selectedModel.id} onValueChange={(value) => {
            const model = models.find(m => m.id === value);
            if (model) setSelectedModel(model);
          }}>
            <SelectTrigger className="w-20 h-8 border-0 bg-transparent p-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={model.image}
                      alt={model.name}
                      width={16}
                      height={16}
                      className="rounded-sm invert"
                    />
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Image Upload */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3"
            >
              <Upload className="w-4 h-4 mr-1" />
              Image
            </Button>
            {imagePreview && (
              <div className="w-8 h-8 rounded overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex-1">
            <Input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the image..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              disabled={isLoading || !selectedImage}
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>System Prompt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  This prompt defines how the AI vision assistant should behave.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <motion.div {...hoverAnimations.button}>
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !prompt.trim() || !selectedImage}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </BottomBar>
    </PageLayout>
  );
} 