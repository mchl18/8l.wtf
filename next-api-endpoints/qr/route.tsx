import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: Request) {
  try {
    const { text, options } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      );
    }

    const qrOptions = {
      width: options?.width || 300,
      margin: options?.margin || 2,
      ...options
    };

    const qrCodeDataUrl = await QRCode.toDataURL(text, qrOptions);

    return NextResponse.json({ qrCode: qrCodeDataUrl });

  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
