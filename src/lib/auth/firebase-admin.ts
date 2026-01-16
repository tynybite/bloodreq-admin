// Firebase Admin SDK Configuration
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';
import { NextRequest } from 'next/server';

let firebaseApp: App | undefined;
let firebaseAuth: Auth | undefined;

function getFirebaseApp(): App {
  if (firebaseApp) {
    return firebaseApp;
  }

  const apps = getApps();
  if (apps.length > 0) {
    firebaseApp = apps[0];
    return firebaseApp;
  }

  // Initialize Firebase Admin
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Handle both literal newlines (from .env) and escaped newlines (from string)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials in environment variables');
  }

  firebaseApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (firebaseAuth) {
    return firebaseAuth;
  }
  firebaseAuth = getAuth(getFirebaseApp());
  return firebaseAuth;
}

// Verify Firebase ID token from request
export async function verifyFirebaseToken(request: NextRequest): Promise<{
  user: DecodedIdToken | null;
  error: string | null;
}> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    return { user: decodedToken, error: null };
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return { user: null, error: 'Invalid or expired token' };
  }
}

// Get user info from Firebase token
export interface FirebaseUser {
  id: string;
  email: string | undefined;
  name: string | undefined;
  picture: string | undefined;
  emailVerified: boolean;
}

export async function getAuthUser(request: NextRequest): Promise<{
  user: FirebaseUser | null;
  error: Response | null;
}> {
  const { user: decodedToken, error } = await verifyFirebaseToken(request);

  if (error || !decodedToken) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ success: false, message: error || 'Unauthorized', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return {
    user: {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      emailVerified: decodedToken.email_verified || false,
    },
    error: null,
  };
}
