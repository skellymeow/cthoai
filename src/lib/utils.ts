import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export persistence utilities for easy access
export { 
  usePersistedState, 
  usePageTracking, 
  persistenceUtils, 
  persistenceManager 
} from './persistence';
export type { 
  PersistedState, 
  Message, 
  GeneratedImage, 
  GeneratedVideo, 
  GeneratedAudio 
} from './persistence';
