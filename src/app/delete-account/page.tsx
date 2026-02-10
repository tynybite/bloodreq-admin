'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Mail, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '@/lib/auth/firebase-client'; // Ensure this path is correct based on findings

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Email Flow State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  
  // Google Flow State
  // (Managed via direct function call)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-deletion-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to send verification code');

      toast.success('Verification code sent to your email');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtpDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/confirm-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Deletion failed');

      toast.success('Account deleted successfully');
      // Redirect to landing page or show success state
      router.push('/'); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDeletion = async () => {
    setLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Call the existing profile deletion API (authenticated via Bearer token)
      // This reuses the logic in /api/profile DELETE method
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Deletion failed');

      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-neutral-950">
      <Card className="w-full max-w-md border-red-100 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
        
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Delete Account</CardTitle>
          <CardDescription>
            Permanently remove your data from BloodReq.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Warning: Irreversible Action</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              Deleting your account will permanently erase your profile, donation history, and badge status. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email Verification</TabsTrigger>
              <TabsTrigger value="google">Google Sign-In</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4 space-y-4">
              {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Registered Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    Send Verification Code
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleConfirmOtpDeletion} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="text-sm text-gray-500 mb-2">
                      Sent to <strong>{email}</strong>. Check your spam folder.
                    </div>
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="123456" 
                      maxLength={6}
                      className="text-center text-2xl tracking-widest letter-spacing-2"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="destructive" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                    Permanently Delete Account
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setStep('email')}
                    disabled={loading}
                  >
                    Change Email
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="google" className="mt-4">
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-500">
                  Authenticate securely with Google to verify ownership and delete your account immediately.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full py-6 relative" 
                  onClick={handleGoogleDeletion}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  Sign in with Google
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-center border-t py-4 bg-gray-50/50 dark:bg-white/5">
          <Button variant="link" className="text-xs text-gray-500" onClick={() => router.push('/')}>
            Cancel and Return Home
          </Button>
        </CardFooter>
      </Card>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 via-white to-white opacity-40 dark:from-red-950/20 dark:via-neutral-950 dark:to-neutral-950 pointer-events-none" />
    </div>
  );
}
