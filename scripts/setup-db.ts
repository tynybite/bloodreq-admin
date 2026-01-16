const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

// Simple .env parser to avoid dependencies
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

async function setup() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);

    // 1. Users Collection
    console.log("Setting up 'users' collection...");
    // Drop logic to ensure schema updates applied if exists (optional but cleaner for dev)
    // await db.collection("users").drop().catch(() => {}); 
    
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["_id", "email", "created_at"],
          properties: {
            _id: { bsonType: "string", description: "Firebase UID" },
            email: { bsonType: "string" },
            full_name: { bsonType: ["string", "null"] },
            role: { enum: ["admin", "donor", "requester", "volunteer"] },
            is_available_to_donate: { bsonType: "bool" },
            emergency_contact: { bsonType: ["string", "null"] },
            last_active: { bsonType: ["date", "null"] },
            total_donations: { bsonType: "int" }
          }
        }
      }
    }).catch((e: any) => {
        if (e.codeName !== 'NamespaceExists') console.error("Error creating users:", e);
        // If it exists, we might want to update validator command, but for now simple create is okay.
    });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ blood_group: 1 });
    await db.collection("users").createIndex({ "admin_details.role": 1 });

    // 2. Blood Requests
    console.log("Setting up 'blood_requests' collection...");
    await db.createCollection("blood_requests", {
       validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["requester_id", "patient_name", "blood_group", "location", "units", "status"],
          properties: {
             location: {
                bsonType: "object",
                required: ["type", "coordinates"],
                properties: {
                   type: { enum: ["Point"] },
                   coordinates: { bsonType: "array", minItems: 2, maxItems: 2 }
                }
             },
             status: { enum: ['pending', 'approved', 'in_progress', 'fulfilled', 'rejected', 'cancelled'] },
             admin_notes: { bsonType: ["string", "null"] }
          }
        }
       }
    }).catch((e: any) => {
         if (e.codeName !== 'NamespaceExists') console.error("Error creating blood_requests:", e);
    });
    // 2dsphere index for geospatial queries
    await db.collection("blood_requests").createIndex({ location: "2dsphere" });
    await db.collection("blood_requests").createIndex({ status: 1 });
    await db.collection("blood_requests").createIndex({ requester_id: 1 });

    // 3. Fundraisers
    console.log("Setting up 'fundraisers' collection...");
    await db.createCollection("fundraisers").catch((e: any) => {
        if (e.codeName !== 'NamespaceExists') console.error("Error creating fundraisers:", e);
    });
    await db.collection("fundraisers").createIndex({ requester_id: 1 });
    await db.collection("fundraisers").createIndex({ status: 1 });

    // 4. Donations (Fundraiser Contributions)
    console.log("Setting up 'fundraiser_donations' collection...");
    await db.createCollection("fundraiser_donations").catch((e: any) => {
         if (e.codeName !== 'NamespaceExists') console.error("Error creating fundraiser_donations:", e);
    });
    await db.collection("fundraiser_donations").createIndex({ fundraiser_id: 1 });
    await db.collection("fundraiser_donations").createIndex({ donor_id: 1 });

    // 5. Blood Donations (Fulfillment)
    console.log("Setting up 'blood_donations' collection...");
    await db.createCollection("blood_donations").catch((e: any) => {
         if (e.codeName !== 'NamespaceExists') console.error("Error creating blood_donations:", e);
    });
    await db.collection("blood_donations").createIndex({ request_id: 1 });
    await db.collection("blood_donations").createIndex({ donor_id: 1 });

    // 6. Notifications
    console.log("Setting up 'notifications' collection...");
    await db.createCollection("notifications").catch((e: any) => {
        if (e.codeName !== 'NamespaceExists') console.error("Error creating notifications:", e);
    });
    await db.collection("notifications").createIndex({ created_at: -1 });

    console.log("\nSetup completed successfully!");

  } catch (error) {
    console.error("Setup failed:", error);
  } finally {
    await client.close();
  }
}

setup();
export {};
