"use client";
import { ReactNode } from "react";

interface BottomBarProps {
  children: ReactNode;
  className?: string;
}

export function BottomBar({ children, className = "" }: BottomBarProps) {
  return (
    <div className={`border-t border-border p-4 bg-background flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
} 