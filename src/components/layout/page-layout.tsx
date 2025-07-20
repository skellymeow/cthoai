"use client";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`h-screen flex flex-col bg-background pt-16 lg:pt-0 ${className}`}>
      {children}
    </div>
  );
} 