'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Send, Music, Mic, User, Play, Pause, Download, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { ContentArea } from "@/components/layout/content-area";
import { BottomBar } from "@/components/layout/bottom-bar";
import { useAuth } from "@/components/auth/AuthProvider";
import { animations, hoverAnimations, variants } from "@/lib/animations";

interface GeneratedAudio {
  id: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  prompt: string;
  model: string;
  voice: string;
  created_at: string;
}

interface Model {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface VoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  region: string;
  icon: React.ReactNode;
  fal_voice_id: string;
}

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

const models: Model[] = [
  {
    id: 'fal-ai/tts',
    name: 'FAL TTS',
    image: '/chatgpt.png',
    description: 'High-quality text-to-speech'
  }
];

const voiceProfiles: VoiceProfile[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    gender: 'female',
    region: 'US/CA',
    icon: <User className="w-4 h-4 text-pink-500" />,
    fal_voice_id: 'Jennifer (English (US)/American)'
  },
  {
    id: 'david',
    name: 'David',
    gender: 'male',
    region: 'US/CA',
    icon: <User className="w-4 h-4 text-blue-500" />,
    fal_voice_id: 'Dexter (English (US)/American)'
  }
];

export default function AiAudioPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(voiceProfiles[0]);
  const [systemPrompt, setSystemPrompt] = useState('You are an AI audio generator. Create high-quality speech from text prompts.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [audioStates, setAudioStates] = useState<Record<string, AudioPlayerState>>({});
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch audios on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchAudios();
    }
  }, [user]);

  // Initialize audio states when audios are loaded
  useEffect(() => {
    const newAudioStates: Record<string, AudioPlayerState> = {};
    generatedAudios.forEach((audio) => {
      if (!audioStates[audio.id]) {
        newAudioStates[audio.id] = {
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          volume: 1,
          isMuted: false
        };
      }
    });
    if (Object.keys(newAudioStates).length > 0) {
      setAudioStates(prev => ({ ...prev, ...newAudioStates }));
    }
  }, [generatedAudios]);

  // Prevent hydration mismatch by not rendering until we have user data
  if (!user) {
    return null;
  }

  const fetchAudios = async () => {
    try {
      const response = await fetch('/api/audios');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGeneratedAudios(data.audios);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audios:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel.id,
          voice: selectedVoice.fal_voice_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      
      if (data.success) {
        setPrompt('');
        // Refresh audios list
        await fetchAudios();
      } else {
        throw new Error(data.error || 'Failed to generate audio');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate audio');
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

  const handlePlayPause = async (audioId: string, audioUrl: string) => {
    try {
      // If clicking the same audio that's currently playing, pause it
      if (currentPlayingId === audioId && audioRef.current) {
        audioRef.current.pause();
        setAudioStates(prev => ({
          ...prev,
          [audioId]: {
            ...prev[audioId],
            isPlaying: false
          }
        }));
        setCurrentPlayingId(null);
        return;
      }

      // If clicking a different audio, stop current and play new one
      if (currentPlayingId && currentPlayingId !== audioId && audioRef.current) {
        audioRef.current.pause();
        setAudioStates(prev => ({
          ...prev,
          [currentPlayingId]: {
            ...prev[currentPlayingId],
            isPlaying: false
          }
        }));
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        setAudioStates(prev => ({
          ...prev,
          [audioId]: {
            ...prev[audioId],
            duration: audio.duration || 0
          }
        }));
      });

      audio.addEventListener('timeupdate', () => {
        setAudioStates(prev => ({
          ...prev,
          [audioId]: {
            ...prev[audioId],
            currentTime: audio.currentTime || 0
          }
        }));
      });

      audio.addEventListener('ended', () => {
        setAudioStates(prev => ({
          ...prev,
          [audioId]: {
            ...prev[audioId],
            isPlaying: false,
            currentTime: 0
          }
        }));
        setCurrentPlayingId(null);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setError('Failed to load audio file');
        setCurrentPlayingId(null);
      });

      // Play the audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioStates(prev => ({
              ...prev,
              [audioId]: {
                ...prev[audioId],
                isPlaying: true
              }
            }));
            setCurrentPlayingId(audioId);
          })
          .catch((error) => {
            console.error('Play failed:', error);
            setError('Failed to play audio');
            setCurrentPlayingId(null);
          });
      }
    } catch (error) {
      console.error('Audio play/pause error:', error);
      setError('Audio playback error');
    }
  };

  const handleSeek = (audioId: string, time: number) => {
    if (audioRef.current && currentPlayingId === audioId) {
      audioRef.current.currentTime = time;
      setAudioStates(prev => ({
        ...prev,
        [audioId]: {
          ...prev[audioId],
          currentTime: time
        }
      }));
    }
  };

  const handleVolumeChange = (audioId: string, volume: number) => {
    if (audioRef.current && currentPlayingId === audioId) {
      audioRef.current.volume = volume;
      setAudioStates(prev => ({
        ...prev,
        [audioId]: {
          ...prev[audioId],
          volume,
          isMuted: volume === 0
        }
      }));
    }
  };

  const handleMuteToggle = (audioId: string) => {
    if (audioRef.current && currentPlayingId === audioId) {
      const newMuted = !audioStates[audioId]?.isMuted;
      audioRef.current.muted = newMuted;
      setAudioStates(prev => ({
        ...prev,
        [audioId]: {
          ...prev[audioId],
          isMuted: newMuted
        }
      }));
    }
  };

  const handleDownload = async (audioId: string, audioUrl: string, prompt: string) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.slice(0, 30)}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get voice profile by voice ID (from database)
  const getVoiceProfile = (voiceId: string) => {
    return voiceProfiles.find(voice => voice.fal_voice_id === voiceId) || voiceProfiles[0];
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
              {generatedAudios.map((audio) => {
                const audioState = audioStates[audio.id] || {
                  isPlaying: false,
                  currentTime: 0,
                  duration: 0,
                  volume: 1,
                  isMuted: false
                };
                
                const voiceProfile = getVoiceProfile(audio.voice);
                const isCurrentlyPlaying = currentPlayingId === audio.id;
                
                return (
                  <motion.div
                    key={audio.id}
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
                              <button
                                onClick={() => handlePlayPause(audio.id, audio.cloudinary_url)}
                                className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                              >
                                {isCurrentlyPlaying && audioState.isPlaying ? (
                                  <Pause className="w-8 h-8 text-primary-foreground" />
                                ) : (
                                  <Play className="w-8 h-8 text-primary-foreground ml-1" />
                                )}
                              </button>
                              
                              {/* Progress ring */}
                              {audioState.duration > 0 && (
                                <svg className="absolute inset-0 w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="36"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="none"
                                    className="text-muted-foreground/20"
                                  />
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="36"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 36}`}
                                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - audioState.currentTime / audioState.duration)}`}
                                    className="text-primary transition-all duration-100"
                                  />
                                </svg>
                              )}
                            </div>
                            
                            <Music className="w-6 h-6 text-muted-foreground" />
                          </div>
                          
                          {/* Voice indicator - shows actual voice used */}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {voiceProfile.icon}
                          </div>
                        </div>
                        
                        {/* Audio Controls */}
                        <div className="p-4 space-y-3">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                              {audio.prompt}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {voiceProfile.name} • {new Date(audio.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {/* Progress Bar */}
                          {audioState.duration > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatTime(audioState.currentTime)}</span>
                                <span>{formatTime(audioState.duration)}</span>
                              </div>
                              <div className="relative h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-100"
                                  style={{ width: `${(audioState.currentTime / audioState.duration) * 100}%` }}
                                />
                                <input
                                  type="range"
                                  min="0"
                                  max={audioState.duration}
                                  value={audioState.currentTime}
                                  onChange={(e) => handleSeek(audio.id, parseFloat(e.target.value))}
                                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Volume and Download Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleMuteToggle(audio.id)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                              >
                                {audioState.isMuted ? (
                                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={audioState.volume}
                                onChange={(e) => handleVolumeChange(audio.id, parseFloat(e.target.value))}
                                className="w-16 h-1 bg-muted rounded-full appearance-none cursor-pointer slider"
                              />
                            </div>
                            
                            <button
                              onClick={() => handleDownload(audio.id, audio.cloudinary_url, audio.prompt)}
                              className="p-2 hover:bg-muted rounded transition-colors"
                              title="Download audio"
                            >
                              <Download className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
                      <Music className="w-8 h-8 text-muted-foreground animate-pulse" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-muted-foreground">Generating audio...</p>
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

          <Select value={selectedVoice.id} onValueChange={(value) => {
            const voice = voiceProfiles.find(v => v.id === value);
            if (voice) setSelectedVoice(voice);
          }}>
            <SelectTrigger className="w-20 h-8 border-0 bg-transparent p-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voiceProfiles.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center gap-2">
                    {voice.icon}
                    <span>{voice.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1">
            <Input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter text to convert to speech..."
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
                  This prompt defines how the AI audio generator should behave.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <motion.div {...hoverAnimations.button}>
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !prompt.trim()}
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