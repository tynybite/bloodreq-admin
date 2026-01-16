const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Simple .env parser (reused)
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line: string) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const firstEq = trimmed.indexOf('=');
        if (firstEq !== -1) {
          const key = trimmed.substring(0, firstEq).trim();
          let val = trimmed.substring(firstEq + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      });
    }
  } catch (err) {
    console.error("Error loading .env:", err);
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'bloodreq';

if (!uri) {
  console.error("Error: MONGODB_URI not found in .env");
  process.exit(1);
}

const client = new MongoClient(uri);

// Helper to pick random item
const sample = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding...");
    const db = client.db(dbName);

    // --- 1. Users ---
    // We'll Create 5 users with specific roles
    console.log("Seeding Users...");
    const userDocs = [
      {
        _id: "FCbQiq3iQeNMoQpyv79gJnSUqpW2", // Real Firebase Admin UID
        email: "admin@bloodreq.com",
        full_name: "Super Admin",
        avatar_url: "https://i.pravatar.cc/150?u=admin",
        role: "admin", // from profile
        status: "active",
        is_available_to_donate: true,
        blood_group: "O+",
        phone_number: "+8801700000001",
        country: "Bangaldesh",
        city: "Dhaka",
        area: "Gulshan",
        total_donations: 5,
        emergency_contact: "+8801700000099",
        last_active: new Date(),
        admin_details: {
          role: "super_admin",
          permissions: { all: true, create_user: true, delete_user: true },
          assigned_countries: ["Bangladesh"],
          assigned_cities: ["Dhaka"],
          is_active: true,
          settings: { theme: 'dark' }
        },
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: "user_donor_001", 
        email: "donor1@example.com",
        full_name: "John Doe",
        avatar_url: "https://i.pravatar.cc/150?u=donor1",
        role: "donor",
        status: "active",
        is_available_to_donate: true,
        blood_group: "A+",
        phone_number: "+8801700000002",
        country: "Bangladesh",
        city: "Dhaka",
        area: "Dhanmondi",
        total_donations: 2,
        emergency_contact: "+8801700000098",
        last_active: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: "user_donor_002", 
        email: "donor2@example.com",
        full_name: "Jane Smith",
        avatar_url: "https://i.pravatar.cc/150?u=donor2",
        role: "donor",
        status: "active",
        is_available_to_donate: true,
        blood_group: "B-",
        phone_number: "+8801700000003",
        country: "Bangladesh",
        city: "Chittagong",
        area: "GEC",
        total_donations: 0,
        emergency_contact: "+8801700000097",
        last_active: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: "user_requester_001", 
        email: "req1@example.com",
        full_name: "Mike Requester",
        avatar_url: "https://i.pravatar.cc/150?u=req1",
        role: "requester",
        status: "active",
        is_available_to_donate: false,
        blood_group: "AB+",
        phone_number: "+8801700000004",
        country: "Bangladesh",
        city: "Dhaka",
        area: "Mirpur",
        total_donations: 0,
        emergency_contact: "+8801700000096",
        last_active: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        _id: "user_volunteer_001", 
        email: "vol1@example.com",
        full_name: "Sarah Volunteer",
        avatar_url: "https://i.pravatar.cc/150?u=vol1",
        role: "volunteer",
        status: "active",
        is_available_to_donate: true,
        blood_group: "O-",
        phone_number: "+8801700000005",
        country: "Bangladesh",
        city: "Sylhet",
        area: "Zindabazar",
        total_donations: 10,
        emergency_contact: "+8801700000095",
        last_active: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Delete existing to avoid duplicate key errors if re-run
    // We must also delete the old mock ID 'user_admin_001' to prevent email conflict
    const idsToDelete = [...userDocs.map((u: any) => u._id), "user_admin_001"];
    await db.collection("users").deleteMany({ _id: { $in: idsToDelete } });
    await db.collection("users").insertMany(userDocs);

    // --- 2. Blood Requests ---
    console.log("Seeding Blood Requests...");
    const requestDocs = [];
    const cities = ["Dhaka", "Chittagong", "Sylhet"];
    const statuses = ["pending", "approved", "in_progress", "fulfilled", "rejected", "cancelled"];
    const urgencies = ["critical", "urgent", "planned"];

    for (let i = 0; i < 5; i++) {
        // SQL status is 'pending', 'approved', 'completed', 'rejected'. 
        // Our MongDB check in setup used slightly different, let's align. 
        // setup-db.ts used: ['pending', 'approved', 'in_progress', 'fulfilled', 'rejected', 'cancelled']
      requestDocs.push({
        requester_id: "user_requester_001",
        patient_name: `Patient ${i + 1}`,
        hospital: `General Hospital ${i + 1}`,
        location: {
           type: "Point",
           coordinates: [90.4125 + (Math.random() * 0.1), 23.8103 + (Math.random() * 0.1)] // Around Dhaka
        },
        city: sample(cities),
        country: "Bangladesh",
        blood_group: sample(["A+", "B+", "O+", "AB-"]),
        units: randomInt(1, 4),
        urgency: sample(urgencies),
        status: sample(statuses),
        contact_number: "+880190000000" + i,
        notes: "Please help urgently. Patient condition is critical.",
        admin_notes: i % 2 === 0 ? "Verified by phone call." : null,
        updated_by: i % 2 === 0 ? "user_admin_001" : null,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    const rResult = await db.collection("blood_requests").insertMany(requestDocs);
    const requestIds = Object.values(rResult.insertedIds);

    // --- 3. Blood Donations ---
    console.log("Seeding Blood Donations...");
    const bloodDonations = [];
    for (let i = 0; i < 5; i++) {
        // SQL status: 'offered', 'accepted', 'completed'
      bloodDonations.push({
        request_id: sample(requestIds),
        donor_id: sample(["user_donor_001", "user_donor_002", "user_volunteer_001"]),
        status: sample(["offered", "accepted", "completed"]),
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    await db.collection("blood_donations").insertMany(bloodDonations);

    // --- 4. Fundraisers ---
    console.log("Seeding Fundraisers...");
    const fundraiserDocs = [];
    // SQL status: 'pending', 'approved', 'rejected', 'completed', 'paused' (added paused in our plan, standard sql just user defined)
    const fundStatuses = ["pending", "approved", "rejected", "completed"];
    
    for (let i = 0; i < 5; i++) {
        fundraiserDocs.push({
            requester_id: "user_requester_001",
            title: `Help Patient ${i+1} fight Cancer`,
            description: "Detailed description about the condition and need for funds...",
            patient_name: `Patient ${i+1}`,
            condition: "Leukemia",
            hospital: "Cancer Research Hospital",
            location: "Dhaka",
            amount_needed: 500000,
            amount_raised: 0, // Will update with donations
            deadline: new Date(Date.now() + 86400000 * 30), // +30 days
            status: sample(fundStatuses),
            cover_image_url: "https://placehold.co/600x400",
            documents: [
                { url: "https://example.com/doc1.pdf", type: "medical_report", created_at: new Date() }
            ],
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    const fResult = await db.collection("fundraisers").insertMany(fundraiserDocs);
    const fundraiserIds = Object.values(fResult.insertedIds);

    // --- 5. Fundraiser Donations ---
    console.log("Seeding Fundraiser Donations...");
    const fDonations = [];
    // SQL status: 'pending', 'completed', 'failed'
    for (let i = 0; i < 5; i++) {
        fDonations.push({
            fundraiser_id: sample(fundraiserIds),
            donor_id: sample(["user_donor_001", "user_donor_002"]),
            donor_name: "Anonymous Donor", 
            amount: randomInt(500, 5000),
            payment_method: sample(["bkash", "manual"]),
            transaction_id: "TXN" + Math.floor(Math.random() * 1000000),
            status: "completed",
            created_at: new Date()
        });
    }
    await db.collection("fundraiser_donations").insertMany(fDonations);

    // --- 6. Notifications ---
    console.log("Seeding Notifications...");
    const notifications = [];
    for (let i = 0; i < 5; i++) {
        notifications.push({
            title: `Emergency Alert ${i+1}`,
            message: "Urgent need for O+ blood in your area.",
            segment: "All",
            blood_group: "O+", // SQL col is 'blood_group'
            sent_by: "user_admin_001",
            recipients: 150, // SQL col is 'recipients'
            success: true,
            created_at: new Date()
        });
    }
    await db.collection("notifications").insertMany(notifications);

    // --- 7. Stories ---
    console.log("Seeding Stories...");
    const stories = [];
    for (let i = 0; i < 5; i++) {
        stories.push({
            donor_id: sample(["user_donor_001", "user_donor_002"]),
            content: "I donated blood today and it felt great to save a life!",
            image_url: "https://placehold.co/400x400",
            is_public: true,
            likes: randomInt(0, 50),
            created_at: new Date()
        });
    }
    await db.collection("stories").insertMany(stories);

    // --- 8. Reminders ---
    console.log("Seeding Reminders...");
    const reminders = [];
    for (let i = 0; i < 5; i++) {
        reminders.push({
            donor_id: sample(["user_donor_001", "user_donor_002"]),
            reminder_date: new Date(Date.now() + 86400000 * 90), // +90 days
            reminder_type: "push", // SQL col is 'reminder_type'
            is_active: true,
            created_at: new Date()
        });
    }
    await db.collection("reminders").insertMany(reminders);
    
    // --- 9. System Settings ---
    console.log("Seeding System Settings...");
    // Upsert settings
    await db.collection("system_settings").updateOne(
        { _id: "payment_config" },
        { $set: { 
            _id: "payment_config",
            value: { currency: "BDT", methods: ["bkash", "nagad", "stripe"], min_amount: 100 },
            updated_by: "user_admin_001",
            updated_at: new Date() 
        }},
        { upsert: true }
    );
     await db.collection("system_settings").updateOne(
        { _id: "general_settings" },
        { $set: { 
            _id: "general_settings",
            value: { app_name: "BloodReq", maintenance_mode: false },
            updated_by: "user_admin_001",
            updated_at: new Date() 
        }},
        { upsert: true }
    );
    await db.collection("system_settings").updateOne(
        { _id: "smtp_config" },
        { $set: { 
            _id: "smtp_config",
            value: { host: "smtp.example.com", port: 587, user: "mailer@bloodreq.com" },
            updated_by: "user_admin_001",
            updated_at: new Date() 
        }},
        { upsert: true }
    );
    await db.collection("system_settings").updateOne(
        { _id: "onesignal_config" },
        { $set: { 
            _id: "onesignal_config",
            value: { app_id: "xxxx-xxxx", rest_key: "xxxx" },
            updated_by: "user_admin_001",
            updated_at: new Date() 
        }},
        { upsert: true }
    );
    await db.collection("system_settings").updateOne(
        { _id: "donation_rules" },
        { $set: { 
            _id: "donation_rules",
            value: { min_days_interval: 90, min_weight_kg: 50 },
            updated_by: "user_admin_001",
            updated_at: new Date() 
        }},
        { upsert: true }
    );


    console.log("\nSeeding completed successfully!");

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
  }
}

seed();
export {};
