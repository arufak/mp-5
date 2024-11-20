import { MongoClient, Collection } from "mongodb";

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is undefined");
}

const DB_NAME = "mp-5";

// Configure MongoDB client with simpler options
const client = new MongoClient(MONGO_URI, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
});

export default async function getCollection(
    collectionName: string,
): Promise<Collection> {
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        return db.collection(collectionName);
    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error('Failed to connect to database');
    }
}

// Cleanup function
export async function closeConnection() {
    try {
        await client.close();
    } catch (error) {
        console.error('Error closing connection:', error);
    }
}