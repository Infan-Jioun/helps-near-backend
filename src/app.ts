import express, { Application, Request, Response } from "express";
import cors from "cors";
import { envConfig } from "./config/env";
import { notFound } from "./middleware/notFound";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import { authRouter } from "./app/module/auth/auth.router";
import { emergencyRouter } from "./app/module/emergency/emergency.router";
import { userRouter } from "./app/module/user/user.router";
import { volunteerRouter } from "./app/module/volunteer/volunteer.router";
import { volunteerResponseRoutes } from "./app/module/volunteerresponse/volunteerresponse.router";
import { paymentRouter } from "./app/module/payment/payment.router";
import path from "path";
import cookieParser from "cookie-parser";
import qs from "qs";
import { globalErrorHandlar } from "./middleware/globalHandelError";
import { requestLogger } from "./middleware/requestLogger";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));
app.set("query parser", (str: string) => qs.parse(str));
app.set("trust proxy", true);


app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:3000",  
            "http://localhost:3001",
            envConfig.FRONTEND_URL,    
            envConfig.BETTER_AUTH_URL,
        ].filter(Boolean);

        // origin না থাকলে (Postman, server-to-server) allow করো
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
    exposedHeaders: ["Set-Cookie"],
}));

app.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    console.log("Webhook received:", req.body);
    res.status(200).json({ received: true });
});

app.all("/api/auth/*path", toNodeHandler(auth));
app.use(requestLogger);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/emergency", emergencyRouter);
app.use("/api/v1/volunteer", volunteerRouter);
app.use("/api/v1/volunteer-response", volunteerResponseRoutes);
app.use("/api/v1/payment", paymentRouter);

app.get("/", (req: Request, res: Response) => {
    res.status(201).json({
        success: true,
        message: "Helps Near Api is Successfully running",
    });
});

app.use(globalErrorHandlar);
app.use(notFound);

export default app;