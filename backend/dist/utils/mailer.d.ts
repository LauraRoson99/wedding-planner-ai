export type SendMailInput = {
    to: string;
    subject: string;
    html: string;
    text: string;
};
export type SendMailResult = {
    messageId: string;
    previewUrl: string | null;
};
export declare function sendMail(input: SendMailInput): Promise<SendMailResult>;
//# sourceMappingURL=mailer.d.ts.map