import express, { Application } from "express";
import cors from "cors"
import { envConfig } from "./config/env";
import { notFound } from "./middleware/notFound";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
const app: Application = express();
app.use(cors({
    origin: [envConfig.FRONTEND_URL || "http://localhost:3000", envConfig.BETTER_AUTH_URL || "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["content-type", "Authorization"]
}))
app.use("/api/auth", toNodeHandler(auth))
app.use(express.json());
app.use(notFound)
export default app;