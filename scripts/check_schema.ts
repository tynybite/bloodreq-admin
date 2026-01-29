import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "bloodreq";

async function checkSchema() {
  const client = new MongoClient(MONGODB_URI!);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const collections = await db.listCollections().toArray();
    console.log(JSON.stringify(collections, null, 2));
  } finally {
    await client.close();
  }
}

checkSchema();
