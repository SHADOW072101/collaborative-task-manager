import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

import authRoutes from "./modules/auth/auth.routes";
import taskRoutes from "./modules/tasks/task.routes";
import userRoutes from "./modules/users/user.routes";

import { errorHandler } from "./core/middleware/errorHandler";
import { notFoundHandler } from "./core/middleware/notFoundHandler";
import { env } from "./core/config/env";

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, Postman, curl
    if (!origin) return callback(null, true);

    // Allow all Vercel preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Optional: allow custom prod domain later
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MUST exist
app.options('*', cors());

app.use(helmet());
app.use(express.json());

/* ---------- Routes ---------- */
app.get("/api/health", (_, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ---------- Errors ---------- */
app.use(notFoundHandler);
app.use(errorHandler);

/* ---------- REQUIRED FOR VERCEL ---------- */
export default app;
