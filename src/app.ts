// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { connectDB } from "./config/db";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ensure DB is connected before hitting route handlers
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "auth" });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;