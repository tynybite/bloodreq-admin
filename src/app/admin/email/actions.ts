'use server';

import { getCollection, Collections, AdminUserDocument, UserDocument } from '@/lib/db/mongodb';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  auth_user: string;
  auth_pass: string;
  from_email: string;
  from_name: string;
}

// Helper to get current user
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return await getFirebaseAuth().verifySessionCookie(token, true);
  } catch {
    return null;
  }
}

/**
 * Get SMTP settings from admin_users collection
 */
export async function getSMTPSettings(): Promise<SMTPSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
    const adminData = await adminUsersCollection.findOne({ _id: user.uid } as any);
    return adminData?.settings?.smtp || null;
  } catch (error) {
    console.error('Error fetching SMTP settings:', error);
    return null;
  }
}

/**
 * Save SMTP settings
 */
export async function saveSMTPSettings(smtp: SMTPSettings) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
    
    // Update with new SMTP settings
    await adminUsersCollection.updateOne(
      { _id: user.uid } as any,
      { 
        $set: { 
          'settings.smtp': smtp,
          updated_at: new Date()
        } 
      },
      { upsert: true }
    );

    revalidatePath('/admin/email');
    return { success: true };
  } catch (error) {
    console.error('Failed to save SMTP settings:', error);
    throw new Error('Failed to save settings');
  }
}

import nodemailer from 'nodemailer';

// Helper to create transporter
async function createTransporter(smtp: SMTPSettings) {
  const isSecure = smtp.port === 465 || smtp.secure === true;
  
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: isSecure, 
    auth: {
      user: smtp.auth_user,
      pass: smtp.auth_pass,
    },
    // Add timeouts to fail faster
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 10000,     // 10 seconds
    // Allow self-signed certificates in case of dev/testing environments
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Send a test email using the configured SMTP settings
 */
export async function sendTestEmail(toEmail: string) {
  const smtp = await getSMTPSettings();
  
  if (!smtp) {
    throw new Error('SMTP not configured');
  }

  // Validate required fields
  if (!smtp.host || !smtp.port || !smtp.auth_user || !smtp.from_email) {
    throw new Error('SMTP configuration incomplete');
  }
  
  try {
    const transporter = await createTransporter(smtp);
    
    // Verify connection configuration
    await transporter.verify();
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"${smtp.from_name || 'BloodReq Admin'}" <${smtp.from_email}>`,
      to: toEmail,
      subject: "BloodReq SMTP Test",
      text: "This is a test email from your BloodReq Admin Panel. If you received this, your SMTP settings are working correctly.",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #dc2626;">BloodReq SMTP Test</h2>
          <p>This is a test email from your BloodReq Admin Panel.</p>
          <p style="color: green;"><strong>✅ SMTP is working correctly!</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <small style="color: #666;">Configuration: ${smtp.host}:${smtp.port}</small>
        </div>
      `,
    });

    console.log('Test email sent: %s', info.messageId);
    
    return { 
      success: true, 
      message: `Test email sent successfully to ${toEmail}` 
    };
  } catch (error: any) {
    console.error('SMTP Test Error:', error);
    throw new Error(`SMTP Error: ${error.message}`);
  }
}

/**
 * Send an email (for use by other parts of the app)
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const smtp = await getSMTPSettings();
  
  if (!smtp) {
    console.warn('SMTP not configured, skipping email send:', options.subject);
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const transporter = await createTransporter(smtp);

    const info = await transporter.sendMail({
      from: `"${smtp.from_name || 'BloodReq'}" <${smtp.from_email}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ''), // Fallback text
      html: options.html,
    });

    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email Send Error:', error);
    return { success: false, error: error.message };
  }
}
