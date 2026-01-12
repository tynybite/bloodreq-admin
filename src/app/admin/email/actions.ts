'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  auth_user: string;
  auth_pass: string;
  from_email: string;
  from_name: string;
}

/**
 * Get SMTP settings from admin_users table (stored in settings JSON)
 */
export async function getSMTPSettings(): Promise<SMTPSettings | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('admin_users')
    .select('settings')
    .eq('id', user.id)
    .single();

  return data?.settings?.smtp || null;
}

/**
 * Save SMTP settings
 */
export async function saveSMTPSettings(smtp: SMTPSettings) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get current settings
  const { data: current } = await supabase
    .from('admin_users')
    .select('settings')
    .eq('id', user.id)
    .single();

  const currentSettings = current?.settings || {};

  // Update with new SMTP settings
  const { error } = await supabase
    .from('admin_users')
    .update({
      settings: {
        ...currentSettings,
        smtp
      }
    })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to save SMTP settings:', error);
    throw new Error('Failed to save settings');
  }

  revalidatePath('/admin/email');
  return { success: true };
}

/**
 * Send a test email using the configured SMTP settings
 */
export async function sendTestEmail(toEmail: string) {
  const smtp = await getSMTPSettings();
  
  if (!smtp) {
    throw new Error('SMTP not configured');
  }

  // Note: In production, you would use nodemailer or similar
  // For now, this is a placeholder that validates the config
  
  // Validate required fields
  if (!smtp.host || !smtp.port || !smtp.auth_user || !smtp.from_email) {
    throw new Error('SMTP configuration incomplete');
  }

  // In a real implementation, you would:
  // 1. Create a nodemailer transporter
  // 2. Send a test email
  // For now, we'll just return success as a placeholder
  
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
    throw new Error('SMTP not configured');
  }

  // Placeholder for actual email sending
  // In production, use nodemailer:
  /*
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.auth_user,
      pass: smtp.auth_pass,
    },
  });

  await transporter.sendMail({
    from: `"${smtp.from_name}" <${smtp.from_email}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
  */

  console.log('Email would be sent:', options);
  return { success: true };
}
