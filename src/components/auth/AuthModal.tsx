'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { hoverAnimations } from '@/lib/animations';
import { useAuth } from './AuthProvider';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Welcome to CTHOWork AI</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Sign in to continue</h3>
            <p className="text-sm text-muted-foreground">
              Access all AI tools and features with your Google account
            </p>
          </div>
          <motion.div {...hoverAnimations.button} className="w-full">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 text-base"
              variant="outline"
            >
              <Image
                src="/googlelogo.png"
                alt="Google"
                width={24}
                height={24}
                className="mr-3"
              />
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 