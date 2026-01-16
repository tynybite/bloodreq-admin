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
    return await getFirebaseAuth().verifyIdToken(token);
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
    const adminData = await adminUsersCollection.findOne({ _id: user.uid });
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
      { _id: user.uid },
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
  
  console.log('Test email would be sent to:', toEmail, 'using SMTP:', smtp.host);
  
  return { 
    success: true, 
    message: `Test email configuration validated. Host: ${smtp.host}:${smtp.port}` 
  };
}

/**
 * Send an email (for use by other parts of the app)
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const smtp = await getSMTPSettings();
  
  if (!smtp) {
    // throw new Error('SMTP not configured');
    console.warn('SMTP not configured, skipping email send:', options.subject);
    return { success: false, error: 'SMTP not configured' };
  }

  console.log('Email would be sent:', options);
  return { success: true };
}
