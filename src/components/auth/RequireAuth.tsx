'use client';

import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { AuthModal } from './AuthModal';
import { useState } from 'react';

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!user) {
    return (
      <>
        <div 
          onClick={() => setAuthModalOpen(true)}
          className="cursor-pointer opacity-50 hover:opacity-75 transition-opacity"
        >
          {fallback || children}
        </div>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </>
    );
  }

  return <>{children}</>;
} 