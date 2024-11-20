import { MongoClient, Db, Collection } from "mongodb";

// Type assertion for environment variable
const MONGO_URI = process.env.MONGO_URI as string;
const DB_NAME = "mp-5";

// Better error message with environment check
if (!process.env.MONGO_URI) {
    throw new Error(
        "Please define the MONGO_URI environment variable in .env.local or Vercel settings"
    );
}

let client: MongoClient | null = null;
let db: Db | null = null;

async function connect(): Promise<Db> {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        if (!client) {
            client = new MongoClient(MONGO_URI);
            await client.connect();
            console.log('Successfully connected to MongoDB');
        }
        
        return client.db(DB_NAME);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export default async function getCollection(
    collectionName: string,
): Promise<Collection> {
    try {
        if (!db) {
            console.log('Getting database connection...');
            db = await connect();
            console.log('Successfully got database connection');
        }
        return db.collection(collectionName);
    } catch (error) {
        console.error('Error getting collection:', error);
        throw error;
    }
}