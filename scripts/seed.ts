import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bloodreq";

if (!MONGODB_URI) {
  console.error("Please add MONGODB_URI to your .env.local file");
  process.exit(1);
}

const Collections = {
  USERS: "users",
  BLOOD_REQUESTS: "blood_requests",
  DONATIONS: "donations",
  FUNDRAISERS: "fundraisers",
  NOTIFICATIONS: "notifications",
  ADMIN_USERS: "admin_users",
  SYSTEM_SETTINGS: "system_settings",
  LOCATIONS: "locations",
} as const;

async function seed() {
  console.log("🌱 Starting database seeding...");
  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    console.log(`Connected to database: ${MONGODB_DB_NAME}`);

    // --- 1. Reset Database ---
    console.log("🗑️  Clearing existing data...");
    for (const collectionName of Object.values(Collections)) {
      await db.collection(collectionName).deleteMany({});
      console.log(`   - Cleared ${collectionName}`);
    }

    // --- 2. Seed Users ---
    console.log("👤 Seeding Users...");
    const users = Array.from({ length: 5 }).map((_, i) => ({
      _id: `user_${i + 1}`, // Simulate Firebase UID
      email: `user${i + 1}@example.com`,
      full_name: `User ${i + 1} Name`,
      role: "user",
      blood_group: ["A+", "B+", "O+", "AB-", "O-"][i],
      phone_number: `+1234567890${i}`,
      country: "USA",
      city: "New York",
      is_available_to_donate: i % 2 === 0,
      created_at: new Date(),
      updated_at: new Date(),
    }));
    await db.collection(Collections.USERS).insertMany(users as any);

    // --- 3. Seed Blood Requests ---
    console.log("🩸 Seeding Blood Requests...");
    const bloodRequests = Array.from({ length: 5 }).map((_, i) => ({
      requester_id: users[i]._id,
      patient_name: `Patient ${i + 1}`,
      patient_age: 30 + i,
      blood_group: users[i].blood_group,
      units: 1 + (i % 3),
      hospital: `General Hospital ${i + 1}`,
      city: "New York",
      location: {
        type: "Point",
        coordinates: [-74.006, 40.7128 + i * 0.01],
      },
      urgency: ["critical", "urgent", "planned"][i % 3],
      contact_number: users[i].phone_number,
      status: ["pending", "approved", "in_progress", "fulfilled", "cancelled"][i],
      created_at: new Date(),
      updated_at: new Date(),
    }));
    await db.collection(Collections.BLOOD_REQUESTS).insertMany(bloodRequests);

    // --- 4. Seed Donations ---
    console.log("🎁 Seeding Donations...");
    const requestIds = await db
      .collection(Collections.BLOOD_REQUESTS)
      .find({})
      .map((doc) => doc._id.toString())
      .toArray();

    const donations = Array.from({ length: 5 }).map((_, i) => ({
      request_id: requestIds[i % requestIds.length],
      donor_id: users[(i + 1) % users.length]._id,
      status: ["offered", "accepted", "completed", "cancelled", "rejected"][i],
      created_at: new Date(),
      updated_at: new Date(),
    }));
    await db.collection(Collections.DONATIONS).insertMany(donations);

    // --- 5. Seed Fundraisers ---
    console.log("💰 Seeding Fundraisers...");
    const fundraisers = Array.from({ length: 5 }).map((_, i) => ({
      title: `Fundraiser for Patient ${i + 1}`,
      patient_name: `Patient ${i + 1}`,
      amount_needed: 1000 * (i + 1),
      amount_raised: 100 * (i + 1),
      status: ["pending", "approved", "rejected", "completed", "closed"][i],
      requester_id: users[i]._id,
      documents: [],
      created_at: new Date(),
      updated_at: new Date(),
    }));
    await db.collection(Collections.FUNDRAISERS).insertMany(fundraisers);

    // --- 6. Seed Notifications ---
    console.log("🔔 Seeding Notifications...");
    const notifications = Array.from({ length: 5 }).map((_, i) => ({
      user_id: users[i]._id,
      type: "system",
      title: "Welcome!",
      message: "Welcome to BloodReq.",
      is_actionable: false,
      is_read: false,
      created_at: new Date(),
    }));
    await db.collection(Collections.NOTIFICATIONS).insertMany(notifications);

    // --- 7. Seed Admin Users ---
    console.log("👮 Seeding Admin Users...");
    const adminUsers = [
      {
        _id: "FCbQiq3iQeNMoQpyv79gJnSUqpW2",
        role: "super_admin",
        permissions: { all: true },
        assigned_countries: ["All"],
        assigned_cities: ["All"],
        is_active: true,
        created_at: new Date(),
      },
      ...Array.from({ length: 4 }).map((_, i) => ({
        _id: `admin_${i + 1}`,
        role: "admin",
        permissions: { all: true },
        assigned_countries: ["USA"],
        assigned_cities: ["New York"],
        is_active: true,
        created_at: new Date(),
      })),
    ];
    await db.collection(Collections.ADMIN_USERS).insertMany(adminUsers as any);

    // --- 8. Seed Locations ---
    console.log("📍 Seeding Locations...");
    const locations = Array.from({ length: 5 }).map((_, i) => ({
      name: `Country ${i + 1}`,
      code: `C${i + 1}`,
      cities: [
        { name: `City ${i + 1}-A`, slug: `city-${i + 1}-a` },
        { name: `City ${i + 1}-B`, slug: `city-${i + 1}-b` },
      ],
    }));
    await db.collection(Collections.LOCATIONS).insertMany(locations);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seed();
