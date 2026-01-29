import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bloodreq";

async function findId() {
  const client = new MongoClient(MONGODB_URI!);
  const targetId = new ObjectId("697af81b5c1a194603d7c110");

  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const doc = await db.collection(col.name).findOne({ _id: targetId }); // Try ObjectId
      // Also try string ID just in case
      const docString = await db.collection(col.name).findOne({ _id: "697af81b5c1a194603d7c110" } as any);
      
      if (doc) {
        console.log(`✅ Found in collection: ${col.name} (as ObjectId)`);
        console.log(doc);
        return;
      }
      if (docString) {
        console.log(`✅ Found in collection: ${col.name} (as String)`);
        console.log(docString);
        return;
      }
    }
    console.log("❌ ID not found in any collection.");

  } finally {
    await client.close();
  }
}

findId();
