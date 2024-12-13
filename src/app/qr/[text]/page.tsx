"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

export default function QRPage() {
  const params = useParams();
  const [qrCode, setQrCode] = useState<string>("");
  const text = decodeURIComponent(params.text as string);

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        console.log(text);
        const qr = await QRCode.toDataURL(text, {
          width: 300,
          margin: 2,
        });
        setQrCode(qr);
      } catch (err) {
        console.error(err);
      }
    };

    generateQrCode();
  }, [text]);

  const downloadQrCode = () => {
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrCode;
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
            {qrCode && (
              <>
                <Image
                  src={qrCode}
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
