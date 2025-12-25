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

// /* ---------- Middleware ---------- */
// app.use(cors({
//   origin: '*',
//   credentials: true,
// }));
// app.use(helmet());
// app.use(express.json());

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
