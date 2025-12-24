
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../../.env"),
    override: process.env.NODE_ENV !== "production"
});

const app = express();

const HTTP_PORT = process.env.HTTP_PORT;

if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL must be defined in production");
}

const FRONTEND_URL = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL! : `http://localhost:3000`;

app.use(cors({
    origin: [FRONTEND_URL],
    credentials: true
}))

app.use(express.json());

app.listen(HTTP_PORT, () => {
    console.log(`http server is running on port ${HTTP_PORT}`);
});

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/room", roomRoutes);