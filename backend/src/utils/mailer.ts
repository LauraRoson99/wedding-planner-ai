import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

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

let transporterPromise: Promise<Transporter> | null = null;
let usingEthereal = false;

async function createTransporter(): Promise<Transporter> {
  // Real SMTP when credentials are configured.
  if (env.mail.host && env.mail.user && env.mail.pass) {
    return nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.secure,
      auth: { user: env.mail.user, pass: env.mail.pass },
    });
  }

  // Dev fallback: Ethereal test account. Emails are not delivered to real
  // inboxes but each one gets a preview URL, handy for demos and screenshots.
  const testAccount = await nodemailer.createTestAccount();
  usingEthereal = true;
  console.warn(
    '[mailer] No SMTP configured — using Ethereal test account. ' +
      'Emails will NOT reach real inboxes; use the preview URLs instead.'
  );
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

function getTransporter(): Promise<Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: env.mail.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  const previewUrl = usingEthereal
    ? (nodemailer.getTestMessageUrl(info) || null)
    : null;

  return { messageId: info.messageId, previewUrl };
}
