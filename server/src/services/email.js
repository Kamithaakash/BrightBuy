import nodemailer from 'nodemailer';
import { buildOrderEmail } from './order-email.js';

function createTransporter() {
  const port = Number(process.env.BREVO_SMTP_PORT || 465);
  const secure = port === 465;
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port,
    secure,
    pool: false,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });
}

export async function sendOrderInvoiceEmail({ customerEmail, customerName, order }) {
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
        console.warn('[Email] Brevo SMTP not configured. Skipping email.');
        return;
    }
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"BrightBuy Store" <${process.env.BREVO_SMTP_USER}>`,
            to: customerEmail,
            ...buildOrderEmail({ customerName, order }),
        });
        console.log('[Email] Order confirmation sent.');
    } catch (error) {
        console.error('[Email Error] Failed to send email:', error);
    }
}
export async function sendAccountEmail({to, ...message}) {
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY || !process.env.EMAIL_FROM) throw new Error('Account email is not configured.');
    const transporter = createTransporter();
    await transporter.sendMail({from: process.env.EMAIL_FROM, to, ...message});
}
