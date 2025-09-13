import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

const app = express();
dotenv.config({path: "../../.env"});
app.use(express.json());

const HTTP_PORT = process.env.HTTP_PORT;

app.listen(HTTP_PORT, ()=> {
    console.log(`http server is running on port ${HTTP_PORT}`);
});

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/room", roomRoutes);