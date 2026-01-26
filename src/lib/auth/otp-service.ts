import { getCollection } from '@/lib/db/mongodb';

interface OtpDocument {
  email: string;
  otp: string;
  expires_at: Date;
  created_at: Date;
}

export async function generateOtp(email: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
  
  // Use a dedicated collection for OTPs
  const otpsCollection = await getCollection<OtpDocument>('otps' as any);
  
  // Ensure index exists for automatic expiration
  await otpsCollection.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
  
  await otpsCollection.updateOne(
    { email },
    { $set: { otp, expires_at, created_at: new Date() } },
    { upsert: true }
  );
  
  return otp;
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const otpsCollection = await getCollection<OtpDocument>('otps' as any);
  
  const record = await otpsCollection.findOne({ email, otp });
  
  if (record && record.expires_at > new Date()) {
    // Valid OTP
    // Delete it so it can't be reused
    await otpsCollection.deleteOne({ _id: record._id });
    return true;
  }
  
  return false;
}
