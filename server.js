import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { connectDB } from "./lib/db.js";
import { initSocket } from "./lib/socket.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

await connectDB();
initSocket(server);

// ✅ CORS محدود به کلاینت
const allowedOrigins = process.env.CLIENT_URL?.split(",") || [
  "http://localhost:5173",
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: "6mb" }));

app.get("/api/status", (req, res) => res.send("Server is Live"));

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ✅ error handler سراسری
app.use((err, req, res, next) => {
  console.log("GLOBAL ERROR:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));

export default server;
