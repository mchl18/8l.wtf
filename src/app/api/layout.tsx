import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "8l.wtf API Documentation",
  description:
    "API documentation for 8l.wtf URL shortener service. Learn how to create, protect, manage and retrieve shortened URLs programmatically.",
  keywords: ["API", "URL shortener", "documentation", "8l.wtf", "REST API"],
};

export default function ApiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-full mx-auto">
      <h1 className="text-4xl font-extrabold text-purple-600 text-center mb-4">
        8l.wtf API
      </h1>

      <div className="mb-4">
        <Link href="/">
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
          >
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>
      <div className="bg-black rounded-lg shadow-lg p-8 mb-8 border-2 border-purple-600">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">
          API Endpoints
        </h2>

        <div className="space-y-8">{children}</div>
      </div>
    </div>
  );
}
