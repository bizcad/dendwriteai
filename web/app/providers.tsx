'use client';

import { SessionProvider } from "next-auth/react";
import { ConvexClientProvider } from "./convex-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </SessionProvider>
  );
}
