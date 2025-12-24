import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  override: process.env.NODE_ENV !== "production"
});

const nextConfig: NextConfig = {
  /* config options here */

  env: {
    NEXT_PUBLIC_HTTP_BACKEND_URL: process.env.NEXT_PUBLIC_HTTP_BACKEND_URL,
    NEXT_PUBLIC_WS_BACKEND_URL: process.env.NEXT_PUBLIC_WS_BACKEND_URL
  }
};

export default nextConfig;
