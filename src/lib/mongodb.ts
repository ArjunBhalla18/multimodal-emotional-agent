import { MongoClient, Db } from "mongodb";

// This file sets up a single reusable MongoDB connection
// Without this fix, every API call created a NEW connection — crashing the DB under load

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please add MONGODB_URI to your .env.local file");
  }
  const client = new MongoClient(uri);
  return client.connect();
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, reuse the connection across hot reloads
  // (Next.js hot reloads the module but keeps global variables)
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create once per server instance
  clientPromise = createClientPromise();
}

export default clientPromise;

export async function getDatabase(dbName = "emotional-ai"): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}