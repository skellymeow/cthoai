'use client';

import { ReactNode } from 'react';
import { useSidebar } from './SidebarProvider';

interface ResponsiveMainProps {
  children: ReactNode;
}

export function ResponsiveMain({ children }: ResponsiveMainProps) {
  const { isCollapsed } = useSidebar();

  return (
    <main 
      className={`flex-1 overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}
    >
      {children}
    </main>
  );
} 