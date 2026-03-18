import nodemailler from "nodemailer";
import { envConfig } from "../../config/env";
const transporter = nodemailler.createTransport({
    host: envConfig.EMAIL_SENDER_SMTP_HOST,
    secure: false,
    auth: {
        user: envConfig.EMAIL_SENDER_SMTP_USER,
        pass: envConfig.EMAIL_SENDER_SMTP_PASS
    },
    port: Number(envConfig.EMAIL_SENDER_SMTP_PORT)
})