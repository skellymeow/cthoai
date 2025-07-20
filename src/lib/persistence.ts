import React from 'react';

// Persistence system for cross-tab state management
export interface PersistedState {
  // Chat states
  aiChat: {
    messages: Message[];
    selectedModel: string;
    systemPrompt: string;
    input: string;
  };
  // Image generation states
  aiImage: {
    prompt: string;
    selectedModel: string;
    selectedResolution: string;
    systemPrompt: string;
    generatedImages: GeneratedImage[];
  };
  // Video generation states
  aiVideo: {
    prompt: string;
    selectedModel: string;
    selectedResolution: string;
    selectedDuration: string;
    systemPrompt: string;
    generatedVideos: GeneratedVideo[];
  };
  // Audio generation states
  aiAudio: {
    prompt: string;
    selectedModel: string;
    selectedVoice: string;
    systemPrompt: string;
    generatedAudios: GeneratedAudio[];
  };
  // Global app state
  global: {
    lastVisitedPage: string;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  resolution: string;
  timestamp: Date;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  model: string;
  resolution: string;
  duration: string;
  timestamp: Date;
}

export interface GeneratedAudio {
  id: string;
  url: string;
  prompt: string;
  voice: string;
  timestamp: Date;
}

const STORAGE_KEY = 'cthoworkai_state';
const EVENT_KEY = 'cthoworkai_state_change';

class PersistenceManager {
  private static instance: PersistenceManager;
  private state: PersistedState;
  private listeners: Map<string, Set<() => void>> = new Map();

  private constructor() {
    this.state = this.loadState();
    this.setupCrossTabSync();
  }

  static getInstance(): PersistenceManager {
    if (!PersistenceManager.instance) {
      PersistenceManager.instance = new PersistenceManager();
    }
    return PersistenceManager.instance;
  }

  private getDefaultState(): PersistedState {
    return {
      aiChat: {
        messages: [],
        selectedModel: 'grok-4',
        systemPrompt: 'You are a helpful AI assistant.',
        input: ''
      },
      aiImage: {
        prompt: '',
        selectedModel: 'google/imagen-4-fast',
        selectedResolution: '1:1',
        systemPrompt: 'You are an AI image generator. Create high-quality images based on user prompts.',
        generatedImages: []
      },
      aiVideo: {
        prompt: '',
        selectedModel: 'sora',
        selectedResolution: '1920x1080',
        selectedDuration: '5',
        systemPrompt: 'You are an AI video generator. Create high-quality videos based on user prompts.',
        generatedVideos: []
      },
      aiAudio: {
        prompt: '',
        selectedModel: 'elevenlabs',
        selectedVoice: 'sarah',
        systemPrompt: 'You are an AI audio generator. Create high-quality speech from text prompts.',
        generatedAudios: []
      },
      global: {
        lastVisitedPage: '/',
        theme: 'system'
      }
    };
  }

  private loadState(): PersistedState {
    try {
      if (typeof window === 'undefined') return this.getDefaultState();
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return this.getDefaultState();
      
      const parsed = JSON.parse(stored);
      
      // Convert timestamp strings back to Date objects
      const convertDates = (obj: any): any => {
        if (obj && typeof obj === 'object') {
          if (Array.isArray(obj)) {
            return obj.map(convertDates);
          } else {
            const converted: any = {};
            for (const [key, value] of Object.entries(obj)) {
              if (key === 'timestamp' && typeof value === 'string') {
                converted[key] = new Date(value);
              } else {
                converted[key] = convertDates(value);
              }
            }
            return converted;
          }
        }
        return obj;
      };
      
      return convertDates(parsed);
    } catch (error) {
      console.warn('Failed to load persisted state:', error);
      return this.getDefaultState();
    }
  }

  private saveState(): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      
      // Notify other tabs
      window.dispatchEvent(new CustomEvent(EVENT_KEY, {
        detail: { state: this.state }
      }));
    } catch (error) {
      console.warn('Failed to save persisted state:', error);
    }
  }

  private setupCrossTabSync(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener(EVENT_KEY, (event: any) => {
      if (event.detail?.state) {
        this.state = event.detail.state;
        this.notifyListeners();
      }
    });

    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          this.state = JSON.parse(event.newValue);
          this.notifyListeners();
        } catch (error) {
          console.warn('Failed to parse storage event:', error);
        }
      }
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach((listenerSet) => {
      listenerSet.forEach(listener => listener());
    });
  }

  // Subscribe to state changes
  subscribe(key: string, listener: () => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
    
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  // Get state for a specific section
  getState<K extends keyof PersistedState>(section: K): PersistedState[K] {
    return this.state[section];
  }

  // Update state for a specific section
  updateState<K extends keyof PersistedState>(
    section: K, 
    updates: Partial<PersistedState[K]>
  ): void {
    this.state[section] = { ...this.state[section], ...updates };
    this.saveState();
    this.notifyListeners();
  }

  // Reset a specific section
  resetSection<K extends keyof PersistedState>(section: K): void {
    const defaultState = this.getDefaultState();
    this.state[section] = defaultState[section];
    this.saveState();
    this.notifyListeners();
  }

  // Reset all state
  resetAll(): void {
    this.state = this.getDefaultState();
    this.saveState();
    this.notifyListeners();
  }

  // Clear generated content (images, videos, audio)
  clearGeneratedContent(): void {
    this.state.aiImage.generatedImages = [];
    this.state.aiVideo.generatedVideos = [];
    this.state.aiAudio.generatedAudios = [];
    this.saveState();
    this.notifyListeners();
  }
}

export const persistenceManager = PersistenceManager.getInstance();

// React hook for using persisted state
export function usePersistedState<K extends keyof PersistedState>(
  section: K
): [PersistedState[K], (updates: Partial<PersistedState[K]>) => void] {
  const [state, setState] = React.useState<PersistedState[K]>(() => 
    persistenceManager.getState(section)
  );

  React.useEffect(() => {
    const unsubscribe = persistenceManager.subscribe(section, () => {
      setState(persistenceManager.getState(section));
    });
    return unsubscribe;
  }, [section]);

  const updateState = React.useCallback((updates: Partial<PersistedState[K]>) => {
    persistenceManager.updateState(section, updates);
  }, [section]);

  return [state, updateState];
}

// Hook to track page visits
export function usePageTracking() {
  const [globalState, updateGlobalState] = usePersistedState('global');

  React.useEffect(() => {
    const updateLastVisited = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== globalState.lastVisitedPage) {
        updateGlobalState({ lastVisitedPage: currentPath });
      }
    };

    updateLastVisited();
    window.addEventListener('popstate', updateLastVisited);
    
    return () => {
      window.removeEventListener('popstate', updateLastVisited);
    };
  }, [globalState.lastVisitedPage, updateGlobalState]);
}

// Utility functions
export const persistenceUtils = {
  // Add a message to chat
  addMessage: (section: 'aiChat', message: Message) => {
    const currentState = persistenceManager.getState(section);
    const updatedMessages = [...currentState.messages, message];
    persistenceManager.updateState(section, { messages: updatedMessages });
  },

  // Add generated content
  addGeneratedImage: (image: GeneratedImage) => {
    const currentState = persistenceManager.getState('aiImage');
    const updatedImages = [image, ...currentState.generatedImages];
    persistenceManager.updateState('aiImage', { generatedImages: updatedImages });
  },

  addGeneratedVideo: (video: GeneratedVideo) => {
    const currentState = persistenceManager.getState('aiVideo');
    const updatedVideos = [video, ...currentState.generatedVideos];
    persistenceManager.updateState('aiVideo', { generatedVideos: updatedVideos });
  },

  addGeneratedAudio: (audio: GeneratedAudio) => {
    const currentState = persistenceManager.getState('aiAudio');
    const updatedAudios = [audio, ...currentState.generatedAudios];
    persistenceManager.updateState('aiAudio', { generatedAudios: updatedAudios });
  },

  // Clear messages for a section
  clearMessages: (section: 'aiChat') => {
    persistenceManager.updateState(section, { messages: [] });
  },

  // Update last visited page
  updateLastVisitedPage: (page: string) => {
    persistenceManager.updateState('global', { lastVisitedPage: page });
  }
}; 