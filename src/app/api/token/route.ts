import { generateToken } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const token = generateToken();
  return NextResponse.json({ token });
}
