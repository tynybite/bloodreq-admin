import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bloodreq";

async function updateSchema() {
  const client = new MongoClient(MONGODB_URI!);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    console.log("🔄 Updating 'users' collection validator...");
    await db.command({
      collMod: "users",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["_id", "email", "full_name", "created_at"],
          properties: {
            _id: { bsonType: "string", description: "Firebase UID" },
            email: { bsonType: "string" },
            full_name: { bsonType: "string" },
            role: { 
              enum: ["user", "admin", "super_admin", "moderator"] 
            },
            is_available_to_donate: { bsonType: "bool" }
          }
        }
      }
    });
    console.log("✅ Validator updated successfully.");
  } catch (error) {
    console.error("❌ Failed to update validator:", error);
  } finally {
    await client.close();
  }
}

updateSchema();
