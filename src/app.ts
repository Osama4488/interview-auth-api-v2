// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "auth" }));

// ✅ Mount router properly
app.use("/api/auth", authRoutes);

// ✅ Error handler last
app.use(errorHandler);

export default app;
