'use client';

import { ReactNode } from 'react';
import { useSidebar } from './SidebarProvider';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-background">
      {children}
    </div>
  );
} 