import { Injectable, Logger } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);
    private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

    constructor() {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    async sendEmail(to: string, subject: string, htmlContent: string) {
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.sender = { name: process.env.BREVO_SENDER_NAME, email: process.env.BREVO_SENDER_EMAIL };
            sendSmtpEmail.to = [{ email: to }];
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = htmlContent;

            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            this.logger.log(`Email sent successfully to ${to}`);
            return response;
        } catch (error) {
            this.logger.error(`Error sending email to ${to}: ${error.message}`);
            throw error;
        }
    }
}
