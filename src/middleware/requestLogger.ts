import fs from "fs/promises";
import path from "path";
import { NextFunction, Request, Response } from "express";

const logDir = path.resolve(process.cwd(), "logs");
const accessLogPath = path.join(logDir, "access.log");

const ensureLogDir = async () => {
    await fs.mkdir(logDir, { recursive: true });
};

export const requestLogger = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startTime = process.hrtime.bigint();

    res.on("finish", async () => {
        try {
            const endTime = process.hrtime.bigint();
            const responseTimeMs = Number(endTime - startTime) / 1_000_000;

            const rawIp =
                (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
                ?? req.ip
                ?? req.socket.remoteAddress
                ?? "unknown";

            const cleanIp = rawIp.replace(/^::ffff:/, "");

            const logEntry = JSON.stringify({
                timestamp: new Date().toISOString(),
                method: req.method,
                endpoint: req.originalUrl,
                statusCode: res.statusCode,
                responseTime: `${responseTimeMs.toFixed(2)}ms`,
                ip: cleanIp,
                userAgent: req.headers["user-agent"] ?? "unknown",
            });

            await ensureLogDir();
            await fs.appendFile(accessLogPath, logEntry + "\n", "utf-8");
        } catch (err) {
            console.error(" Failed to write access log:", err);
        }
    });

    next();
};