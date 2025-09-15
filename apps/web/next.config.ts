import type { NextConfig } from "next";
import dotenv from "dotenv"
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  /* config options here */

  env: {
    HTTP_BACKEND_URL: process.env.HTTP_BACKEND_URL,
    WS_BACKEND_URL: process.env.WS_BACKEND_URL
  }
};

export default nextConfig;
