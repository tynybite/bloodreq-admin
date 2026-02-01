// MongoDB Connection Configuration
import {
  MongoClient,
  Db,
  Collection,
  ObjectId,
  Document,
  WithId,
} from "mongodb";

// Re-export types
export { ObjectId, type WithId, type Document };

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bloodreq";

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to your .env file");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let cachedDb: Db | null = null;

// In development, use a global variable to preserve connection across HMR
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// Get database instance
export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }
  const client = await clientPromise;
  cachedDb = client.db(MONGODB_DB_NAME);
  return cachedDb;
}

// Collection helpers with type safety
export async function getCollection<T extends Document>(
  name: string,
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

// Collection names as constants
export const Collections = {
  USERS: "users",
  BLOOD_REQUESTS: "blood_requests",
  DONATIONS: "donations",
  FUNDRAISERS: "fundraisers",
  NOTIFICATIONS: "notifications",
  ADMIN_USERS: "admin_users",
  SYSTEM_SETTINGS: "system_settings",
  LOCATIONS: "locations",
  CAMPAIGNS: "campaigns",
} as const;

export interface LocationDocument extends Document {
  _id?: ObjectId;
  name: string;
  code: string;
  cities: {
    name: string;
    slug: string;
  }[];
}

// Common Interfaces
export interface UserDocument extends Document {
  _id: string; // Firebase UID
  email?: string;
  full_name?: string;
  role?: 'user' | 'admin'; // 'user' is the unified role for mobile app users
  blood_group?: string;
  phone_number?: string;
  country?: string;
  city?: string;
  area?: string;
  address?: string; // Some places use address
  emergency_contact?: string;
  is_available_to_donate: boolean;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  // Admin-specific fields
  admin_details?: {
    role?: string; // e.g. 'super_admin', 'manager' ('moderator', 'finance', 'analyst' removed)
    permissions?: any;
    assigned_countries?: string[];
    assigned_cities?: string[];
    is_active?: boolean;
    settings?: {
      general?: {
        platformName?: string;
        supportEmail?: string;
        language?: string;
        timezone?: string;
      };
      notifications?: {
        push?: boolean;
        sms?: boolean;
        email?: boolean;
        radius?: string;
      };
      security?: {
        twoFactor?: boolean;
        ipRestriction?: boolean;
        sessionTimeout?: string;
      };
      appearance?: {
        theme?: string;
        primaryColor?: string;
        enableAnimations?: boolean;
      };
      apiKeys?: {
        mongodbUri?: string;
        firebaseProjectId?: string;
        admobAppId?: string;
        facebookAppId?: string;
      };
    };
  };
}

export interface BloodRequestDocument extends Document {
  _id?: ObjectId;
  requester_id: string;
  patient_name: string;
  patient_age?: number;
  blood_group: string;
  units: number;
  hospital: string;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  urgency: "critical" | "urgent" | "planned";
  contact_number: string;
  alternate_contact?: string;
  notes?: string;
  status:
    | "pending"
    | "approved"
    | "in_progress"
    | "fulfilled"
    | "rejected"
    | "cancelled"; // Added internal statuses
  created_at: Date;
  updated_at: Date;
}

export interface DonationDocument extends Document {
  _id?: ObjectId;
  request_id: string;
  donor_id: string; // Firebase UID
  status: "offered" | "accepted" | "completed" | "cancelled" | "rejected";
  message?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface NotificationLogDocument extends Document {
  _id?: ObjectId;
  title: string;
  message: string;
  segment: string;
  blood_group?: string | null;
  sent_by: string;
  recipients: number;
  onesignal_id?: string | null;
  success: boolean;
  error?: string | null;
  created_at: Date;
  image_url?: string;
  url?: string;
  data?: any;
}

export interface NotificationDocument extends Document {
  _id?: ObjectId;
  user_id: string; // Firebase UID
  type: "request_nearby" | "donation_update" | "fundraiser_update" | "system";
  title: string;
  message: string;
  payload?: any;
  is_actionable: boolean;
  is_read: boolean;
  created_at: Date;
}

export interface AdminUserDocument extends Document {
  _id: string; // Firebase UID
  role: string;
  permissions: any;
  assigned_countries: string[];
  assigned_cities: string[];
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
  settings?: {
    smtp?: any;
    [key: string]: any;
  };
}

export interface FundraiserDocument extends Document {
  _id?: ObjectId;
  title: string;
  patient_name: string;
  condition?: string;
  hospital?: string;
  location?: string;
  amount_needed: number;
  amount_raised: number;
  deadline?: Date;
  status: "pending" | "approved" | "rejected" | "completed" | "closed";
  description?: string;
  requester_id: string; // Firebase UID
  cover_image_url?: string;
  documents: {
    url: string;
    type?: string;
    id?: string; // or generating one
  }[];
  created_at: Date;
  updated_at: Date;
}

export interface CampaignDocument extends Document {
  _id?: ObjectId;

  // Core info
  title: string;
  description: string;
  type: string; // Dynamic from system_settings campaign_types

  // Banners (carousel support)
  banners: {
    url: string;
    alt_text?: string;
    order: number;
  }[];

  // Sponsor info
  sponsor: {
    name: string;
    logo_url?: string;
    contact_email?: string;
    contact_phone?: string;
  };

  // Billing
  billing: {
    amount_paid: number;
    payment_status: "pending" | "paid" | "overdue";
    payment_date?: Date;
    invoice_id?: string;
  };

  // Location targeting
  target_cities: string[];

  // Scheduling
  start_date: Date;
  end_date: Date;

  // Priority (manual + urgency auto-boost)
  priority: number; // 1-100, higher = shown first

  // Status
  is_active: boolean;
  status: "draft" | "scheduled" | "active" | "paused" | "completed";

  // Action
  action: {
    type: "link" | "phone" | "email" | "in_app";
    value: string;
    button_text: string;
  };

  // Analytics
  views: number;
  clicks: number;

  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export default clientPromise;
