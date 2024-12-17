import dotenv from "dotenv";

dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {};
if (process.env.NEXT_OUTPUT) {
  nextConfig.output = process.env.NEXT_OUTPUT;
}

export default nextConfig;
