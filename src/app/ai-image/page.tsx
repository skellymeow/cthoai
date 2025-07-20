'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Send, Square, RectangleHorizontal, RectangleVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { ContentArea } from "@/components/layout/content-area";
import { BottomBar } from "@/components/layout/bottom-bar";
import { animations, hoverAnimations, variants } from "@/lib/animations";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CldImage } from 'next-cloudinary';
import { useAuth } from "@/components/auth/AuthProvider";

interface Model {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface Resolution {
  id: string;
  name: string;
  icon: React.ReactNode;
  value: string;
}

interface CloudinaryImage {
  id: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  prompt: string;
  model: string;
  resolution: string;
  created_at: string;
}

const models: Model[] = [
  {
    id: 'google/imagen-4-fast',
    name: 'Imagen 4 Fast',
    image: '/Google_AI_Studio.webp',
    description: 'High-quality fast generation'
  },
  {
    id: 'black-forest-labs/flux-schnell',
    name: 'Flux Schnell',
    image: '/Google_AI_Studio.webp', // You can add a proper logo later
    description: 'Fast high-quality generation'
  }
];

const resolutions: Resolution[] = [
  {
    id: 'square',
    name: 'Square',
    icon: <Square className="w-4 h-4" />,
    value: '1:1'
  },
  {
    id: 'landscape',
    name: 'Landscape',
    icon: <RectangleHorizontal className="w-4 h-4" />,
    value: '4:3'
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: <RectangleVertical className="w-4 h-4" />,
    value: '3:4'
  }
];

export default function AiImagePage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/imagen-4-fast');
  const [selectedResolution, setSelectedResolution] = useState('1:1');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch images on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchImages();
    }
  }, [user]);

  // Prevent hydration mismatch by not rendering until we have user data
  if (!user) {
    return null;
  }

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setImages(data.images);
        }
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel,
          aspectRatio: selectedResolution,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      if (data.success) {
        setPrompt('');
        // Refresh images list
        await fetchImages();
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate image');
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

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleResolutionChange = (resolutionId: string) => {
    const resolution = resolutions.find(r => r.id === resolutionId);
    if (resolution) {
      setSelectedResolution(resolution.value);
    }
  };

  const handleSystemPromptChange = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
  };

  const clearImages = () => {
    setImages([]);
  };

  return (
    <PageLayout>
      <ContentArea>
        <motion.div 
          className="flex flex-col h-full"
          {...variants.pageWrapper}
        >
          <motion.div 
            className="flex items-center justify-between p-4 border-b border-border"
            {...animations.fade}
          >
            <div className="flex items-center gap-3">
              <motion.div className="flex items-center gap-2">
                <motion.div {...hoverAnimations.icon}>
                  <Image
                    src={models.find(m => m.id === selectedModel)?.image || '/Google_AI_Studio.webp'}
                    alt="Model"
                    width={24}
                    height={24}
                    className="rounded-sm invert"
                  />
                </motion.div>
                <span className="font-semibold">
                  {models.find(m => m.id === selectedModel)?.name || 'AI Image'}
                </span>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div {...hoverAnimations.button}>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Image Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">System Prompt</label>
                      <Textarea
                        value={systemPrompt}
                        onChange={(e) => handleSystemPromptChange(e.target.value)}
                        placeholder="Enter system prompt..."
                        className="mt-1"
                      />
                    </div>
                    <motion.div {...hoverAnimations.button}>
                      <Button onClick={clearImages} variant="destructive" size="sm">
                        Clear Images
                      </Button>
                    </motion.div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

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

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={animations.stagger.container}
              initial="initial"
              animate="animate"
            >
                          <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  variants={animations.stagger.item}
                  custom={index}
                  className="relative group"
                >
                  <motion.div {...hoverAnimations.card}>
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="aspect-square relative">
                          <CldImage
                            src={image.cloudinary_public_id}
                            alt={image.prompt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <motion.div {...hoverAnimations.button}>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => window.open(image.cloudinary_url, '_blank')}
                              >
                                View Full Size
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {image.prompt}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(image.created_at).toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
            </motion.div>

            {images.length === 0 && !isLoading && (
              <motion.div 
                className="flex flex-col items-center justify-center h-64 text-muted-foreground"
                {...animations.fade}
              >
                <div className="text-4xl mb-4">🎨</div>
                <p className="text-lg font-medium mb-2">No images generated yet</p>
                <p className="text-sm text-center max-w-md">
                  Start by describing the image you want to create. Be specific about style, colors, and composition.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </ContentArea>

      <BottomBar>
        <motion.div 
          className="flex items-center gap-3 bg-card border border-border rounded-lg p-3"
          {...animations.fade}
        >
          <RequireAuth>
            <Select value={selectedModel} onValueChange={handleModelChange}>
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

            <div className="flex items-center gap-1">
              {resolutions.map((resolution) => (
                <motion.div key={resolution.id} {...hoverAnimations.button}>
                  <Button
                    variant={selectedResolution === resolution.value ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleResolutionChange(resolution.id)}
                  >
                    {resolution.icon}
                  </Button>
                </motion.div>
              ))}
            </div>
          </RequireAuth>

          <RequireAuth>
            <div className="flex-1">
                          <Input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the image you want to generate..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              disabled={isLoading}
            />
            </div>
          </RequireAuth>

          <RequireAuth>
            <motion.div {...hoverAnimations.button}>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isLoading}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.div>
          </RequireAuth>
        </motion.div>
      </BottomBar>
    </PageLayout>
  );
} 