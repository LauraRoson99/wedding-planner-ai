"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
let transporterPromise = null;
let usingEthereal = false;
async function createTransporter() {
    // Real SMTP when credentials are configured.
    if (env_1.env.mail.host && env_1.env.mail.user && env_1.env.mail.pass) {
        return nodemailer_1.default.createTransport({
            host: env_1.env.mail.host,
            port: env_1.env.mail.port,
            secure: env_1.env.mail.secure,
            auth: { user: env_1.env.mail.user, pass: env_1.env.mail.pass },
        });
    }
    // Dev fallback: Ethereal test account. Emails are not delivered to real
    // inboxes but each one gets a preview URL, handy for demos and screenshots.
    const testAccount = await nodemailer_1.default.createTestAccount();
    usingEthereal = true;
    console.warn('[mailer] No SMTP configured — using Ethereal test account. ' +
        'Emails will NOT reach real inboxes; use the preview URLs instead.');
    return nodemailer_1.default.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
    });
}
function getTransporter() {
    if (!transporterPromise) {
        transporterPromise = createTransporter();
    }
    return transporterPromise;
}
async function sendMail(input) {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
        from: env_1.env.mail.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
    });
    const previewUrl = usingEthereal
        ? (nodemailer_1.default.getTestMessageUrl(info) || null)
        : null;
    return { messageId: info.messageId, previewUrl };
}
//# sourceMappingURL=mailer.js.map