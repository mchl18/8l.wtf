"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { useQrCode } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function QRPage() {
  const searchParams = useSearchParams();
  const text = decodeURIComponent(searchParams.get("text") as string);
  const format = searchParams.get("format") as string;
  const { data, isLoading, error } = useQrCode(
    decodeURIComponent(format === "base64" ? atob(text) : text)
  );

  const downloadQrCode = () => {
    const link = document.createElement("a");
    link.download = `8l.wtf QR Code - ${new Date().toISOString()}.png`;
    link.href = data || "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <h1 className="text-purple-600 text-2xl mt-12 lg:mt-24">8l.wtf</h1>
      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-6 border-2 border-purple-600">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            {error && (
              <p className="text-red-500">Failed to generate QR code</p>
            )}
            {isLoading && (
              <>
                <Skeleton className="w-[300px] h-[300px] rounded-lg" />
                <Skeleton className="h-10 w-40" />
              </>
            )}
            {data && !error && (
              <>
                <Image
                  src={data}
                  alt="QR Code"
                  className="rounded-lg"
                  width={300}
                  height={300}
                />
                <Button
                  onClick={downloadQrCode}
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={<Skeleton className="w-[300px] h-[300px] rounded-lg" />}
    >
      {children}
    </Suspense>
  );
};

export default function Page() {
  return (
    <Wrapper>
      <QRPage />
    </Wrapper>
  );
}
