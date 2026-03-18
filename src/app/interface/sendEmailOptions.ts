export interface SendEmailOptions {
    to: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
    attachments: {
        fileName: string,
        content: string,
        contentType: string
    }[]

}