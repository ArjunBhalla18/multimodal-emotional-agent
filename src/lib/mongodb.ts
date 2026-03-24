import { MongoClient, Db } from "mongodb";

const options = {};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri, options);
  return client.connect();
}

export default function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}

export async function getDatabase(dbName = "emotional-ai"): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
