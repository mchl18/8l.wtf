"use client";

import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <Analytics />
      <Toaster />
    </QueryClientProvider>
  );
};

export default Providers;
