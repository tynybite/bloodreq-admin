import nodemailer from 'nodemailer';
import { getCollection, Collections, AdminUserDocument } from '@/lib/db/mongodb';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Define interface for SMTP config
interface SmtpConfigDocument extends Document {
  _id: string; // 'smtp_config'
  host: string;
  port: number | string;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const settingsCollection = await getCollection<SmtpConfigDocument>(Collections.SYSTEM_SETTINGS);
  
  // Find smtp_config document
  const smtpConfig = await settingsCollection.findOne({ _id: 'smtp_config' });

  if (!smtpConfig) {
    console.warn('SMTP settings not configured in system_settings (smtp_config)');
    return null; 
  }

  const { host, port, user, pass, fromName, fromEmail, secure } = smtpConfig;

  const transporter = nodemailer.createTransport({
    host,
    port: typeof port === 'string' ? parseInt(port) : port,
    secure: secure || port === 465 || port === '465',
    auth: { user, pass },
  });

  try {
    const info = await transporter.sendMail({
      from: `"${fromName || 'BloodReq'}" <${fromEmail || user}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
