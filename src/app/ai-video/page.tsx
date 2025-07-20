'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Send, Video, RectangleHorizontal, RectangleVertical, Square, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { animations, hoverAnimations, variants } from "@/lib/animations";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { ContentArea } from "@/components/layout/content-area";
import { BottomBar } from "@/components/layout/bottom-bar";
import { useAuth } from "@/components/auth/AuthProvider";

interface GeneratedVideo {
  id: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  prompt: string;
  model: string;
  resolution: string;
  duration: string;
  created_at: string;
}

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

interface Duration {
  id: string;
  name: string;
  value: string;
}

const models: Model[] = [
  {
    id: 'bytedance/seedance-1-pro',
    name: 'Seedance 1 Pro',
    image: '/chatgpt.png',
    description: 'High-quality video generation by ByteDance'
  }
];

const resolutions: Resolution[] = [
  {
    id: 'landscape',
    name: 'Landscape',
    icon: <RectangleHorizontal className="w-4 h-4" />,
    value: '1920x1080'
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: <RectangleVertical className="w-4 h-4" />,
    value: '1080x1920'
  },
  {
    id: 'square',
    name: 'Square',
    icon: <Square className="w-4 h-4" />,
    value: '1080x1080'
  }
];

const durations: Duration[] = [
  {
    id: '5s',
    name: '5s',
    value: '5'
  },
  {
    id: '10s',
    name: '10s',
    value: '10'
  }
];

export default function AiVideoPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(resolutions[0]);
  const [selectedDuration, setSelectedDuration] = useState<Duration>(durations[0]);
  const [systemPrompt, setSystemPrompt] = useState('You are an AI video generator. Create high-quality videos based on user prompts.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch videos on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  // Prevent hydration mismatch by not rendering until we have user data
  if (!user) {
    return null;
  }

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGeneratedVideos(data.videos);
        }
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel.id,
          resolution: selectedResolution.value,
          duration: selectedDuration.value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const data = await response.json();
      
      if (data.success) {
        setPrompt('');
        // Refresh videos list
        await fetchVideos();
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate video');
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
              {generatedVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group cursor-pointer"
                  onClick={() => window.open(video.cloudinary_url, '_blank')}
                >
                  <Card className="overflow-hidden">
                    <div className="aspect-video relative group">
                      <video
                        src={video.cloudinary_url}
                        controls
                        className="w-full h-full object-cover rounded-t-lg"
                        poster={`${video.cloudinary_url.replace('.mp4', '.jpg')}?f=auto&fl=attachment`}
                        preload="metadata"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.prompt}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {video.resolution} • {video.duration}s • {new Date(video.created_at).toLocaleTimeString()}
                      </p>
                    </div>
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
                  <div className="aspect-video relative bg-muted flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <Video className="w-8 h-8 text-muted-foreground animate-pulse" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-muted-foreground">Generating video...</p>
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

          <div className="flex items-center gap-1">
            {resolutions.map((resolution) => (
              <Button
                key={resolution.id}
                variant={selectedResolution.id === resolution.id ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSelectedResolution(resolution)}
              >
                {resolution.icon}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {durations.map((duration) => (
              <Button
                key={duration.id}
                variant={selectedDuration.id === duration.id ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setSelectedDuration(duration)}
              >
                <Clock className="w-3 h-3 mr-1" />
                {duration.name}
              </Button>
            ))}
          </div>

          <div className="flex-1">
            <Input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the video you want to generate..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              disabled={isLoading}
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
                  This prompt defines how the AI video generator should behave.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleGenerate} 
            disabled={!prompt.trim() || isLoading}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </BottomBar>
    </PageLayout>
  );
} 