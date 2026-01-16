const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

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

async function check() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    
    const uid = "FCbQiq3iQeNMoQpyv79gJnSUqpW2";
    console.log(`Checking for user with _id: ${uid}`);

    const user = await db.collection("users").findOne({ _id: uid });
    
    if (user) {
        console.log("User FOUND:");
        console.log(JSON.stringify(user, null, 2));
        console.log(`Role match 'admin'? ${user.role === 'admin'}`);
    } else {
        console.log("User NOT FOUND.");
        // List all users to see what's there
        const allUsers = await db.collection("users").find({}).toArray();
        console.log("All User IDs in DB:", allUsers.map((u: any) => u._id));
    }

  } catch (error) {
    console.error("Check failed:", error);
  } finally {
    await client.close();
  }
}

check();
export {};
