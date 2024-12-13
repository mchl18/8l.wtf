import { Metadata } from "next";

export const metadata: Metadata = {
  title: "8l.wtf API Documentation",
  description:
    "API documentation for 8l.wtf URL shortener service. Learn how to create, protect, manage and retrieve shortened URLs programmatically.",
  keywords: ["API", "URL shortener", "documentation", "8l.wtf", "REST API"],
};

export default function ApiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
