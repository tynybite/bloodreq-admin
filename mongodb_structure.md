# MongoDB Schema Structure (Proposed)

This structure is mapped from the provided Supabase SQL schema.

### 1. `users`

**Source:** `profiles` + `admin_users` + `auth.users`

```typescript
interface User {
  _id: string; // Firebase UID
  email: string; // from auth.users (implied)
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;

  // Profile Fields
  blood_group?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  role: "admin" | "donor" | "requester" | "volunteer"; // Default: 'donor'
  status: "active" | "suspended" | "banned"; // Default: 'active'
  is_available_donor: boolean; // Default: false (from SQL)
  is_available_to_donate: boolean; // Default: true (from SQL) - Kept both for compatibility if needed, else consolidate.
  total_donations: number;

  // Location
  city?: string;
  country?: string;
  area?: string;

  // Admin Specific (Merged from admin_users)
  admin_details?: {
    role: string; // default 'admin'
    permissions: Record<string, boolean>; // JSONB
    assigned_countries: string[];
    assigned_cities: string[];
    is_active: boolean; // default true
    settings: Record<string, any>; // JSONB
  };

  // Extra
  emergency_contact?: string;
  last_active?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### 2. `blood_requests`

**Source:** `blood_requests`

```typescript
interface BloodRequest {
  _id: ObjectId;
  requester_id: string; // User._id (uuid/string)
  patient_name: string;

  hospital: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  city?: string;
  country?: string;

  blood_group: string;
  units: number;
  urgency: "critical" | "urgent" | "planned";
  status: "pending" | "approved" | "completed" | "rejected"; // mapped from SQL types

  contact_number: string;
  notes?: string;

  // Admin fields
  admin_notes?: string;
  updated_by?: string; // User._id

  created_at: Date;
  updated_at?: Date;
}
```

### 3. `blood_donations`

**Source:** `blood_donations`

```typescript
interface BloodDonation {
  _id: ObjectId;
  request_id: ObjectId;
  donor_id: string; // User._id

  status: "offered" | "accepted" | "completed";

  created_at: Date;
}
```

### 4. `fundraisers`

**Source:** `fundraisers`

```typescript
interface Fundraiser {
  _id: ObjectId;
  requester_id: string;

  title: string;
  description?: string;
  cover_image_url?: string;

  patient_name: string;
  condition: string;
  hospital?: string;
  location?: string;

  amount_needed: number;
  amount_raised: number;
  deadline?: Date;

  status: "pending" | "approved" | "rejected" | "completed" | "paused";

  // Linked docs from fundraiser_documents
  documents: Array<{
    url: string;
    type?: string;
    created_at: Date;
  }>;

  created_at: Date;
  updated_at: Date;
}
```

### 5. `fundraiser_donations`

**Source:** `donations`

```typescript
interface FundraiserDonation {
  _id: ObjectId;
  fundraiser_id: ObjectId;

  amount: number;
  payment_method: "bkash" | "paypal" | "manual";
  transaction_id?: string;

  donor_name?: string;
  donor_phone?: string;

  status: "pending" | "completed" | "failed";

  created_at: Date;
}
```

### 6. `notifications`

**Source:** `notifications_log`

```typescript
interface NotificationLog {
  _id: ObjectId;
  title: string;
  message: string;

  segment: string;
  blood_group?: string;

  sent_by?: string;
  recipients?: number;

  onesignal_id?: string;
  success: boolean;
  error?: string;

  created_at: Date;
}
```

### 7. `stories`

**Source:** `donation_stories`

```typescript
interface DonationStory {
  _id: ObjectId;
  donor_id: string;
  content: string;
  image_url?: string;

  is_public: boolean;
  likes: number;

  created_at: Date;
}
```

### 8. `reminders`

**Source:** `donor_reminders`

```typescript
interface DonorReminder {
  _id: ObjectId;
  donor_id: string;
  reminder_date: Date;
  reminder_type: string; // default 'push'
  is_active: boolean;
  created_at: Date;
}
```

### 9. `system_settings`

**Source:** `system_settings`

```typescript
interface SystemSetting {
  _id: string; // key
  value: any;
  updated_by?: string;
  updated_at: Date;
}
```
