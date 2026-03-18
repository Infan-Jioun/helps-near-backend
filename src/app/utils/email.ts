import nodemailler from "nodemailer";
import { envConfig } from "../../config/env";
import { SendEmailOptions } from "../interface/sendEmailOptions";
import AppError from "../errorHelper/appError";
import status from "http-status";
import path from "path";
import ejs from 'ejs';
const transporter = nodemailler.createTransport({
    host: envConfig.EMAIL_SENDER_SMTP_HOST,
    secure: false,
    auth: {
        user: envConfig.EMAIL_SENDER_SMTP_USER,
        pass: envConfig.EMAIL_SENDER_SMTP_PASS
    },
    port: Number(envConfig.EMAIL_SENDER_SMTP_PORT)
})
export const sendEmail = async ({ subject, templateName, templateData, to, attachments }: SendEmailOptions) => {
    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);

        const html = await ejs.renderFile(templatePath, templateData);
        const info = await transporter.sendMail({
            from: envConfig.EMAIL_SENDER_SMTP_FROM,
            subject: subject,
            to: to,
            html: html,
            attachments: attachments?.map((attachment) => ({
                fileName: attachment.fileName,
                content: attachment.content,
                contentType: typeof attachment.contentType === 'string' ? attachment.contentType : undefined
            }))
        })
        console.log(`Email send to ${to} : ${info.messageId} `);
    } catch (error) {
        console.log("email error",error)
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to send email!")
    }
}
