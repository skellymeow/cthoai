'use client';

import { usePageTracking } from "@/lib/persistence";

export function PageTrackingWrapper({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
} 