import express, { Application } from "express";
import cors from "cors"
import { envConfig } from "./config/env";
import { notFound } from "./middleware/notFound";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import cookieParser from "cookie-parser";
import { authRouter } from "./app/module/auth/auth.router";
import path from "path";
import qs from "qs";
import { emergencyRouter } from "./app/module/emergency/emergency.router";
import { globalErrorHandlar } from "./middleware/globalHandelError";
import { userRouter } from "./app/module/user/user.router";
import { volunteerRouter } from "./app/module/volunteer/volunteer.router";
// import { userRouter } from "./app/module/user/user.router";
const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs")
app.set("views", path.resolve(process.cwd(), `src/app/templates`))
app.use(cors({
    origin: [envConfig.FRONTEND_URL || "http://localhost:3000", envConfig.BETTER_AUTH_URL || "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["content-type", "Authorization"]
}))
app.set("query parser", (str: string) => qs.parse(str));
app.use("/api/auth", toNodeHandler(auth))
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/emergency", emergencyRouter)
app.use("/api/v1/volunteer", volunteerRouter)
app.get('/', (req, res) => {
    res.send("Helps Near successfully running")
});
app.use(globalErrorHandlar)
app.use(notFound)
export default app;