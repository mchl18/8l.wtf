"use client";

import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { push } from "./matomo";
import init from "./matomo";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    init({
      url: process.env.NEXT_PUBLIC_MATOMO_URL || "",
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || "",
    });
    push(["trackPageView"]);
    push(["enableLinkTracking"]);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster theme="dark" />
    </QueryClientProvider>
  );
};

export default Providers;
