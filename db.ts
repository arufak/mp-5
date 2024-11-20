import { MongoClient, Db, Collection, MongoClientOptions } from "mongodb";

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is undefined");
}

const DB_NAME = "mp-5";

// Increase timeouts and add better connection options
const options: MongoClientOptions = {
    connectTimeoutMS: 30000,    // 30 seconds
    socketTimeoutMS: 30000,     // 30 seconds
    serverSelectionTimeoutMS: 30000, // 30 seconds
    maxPoolSize: 10,
    minPoolSize: 1,
    retryWrites: true,
    w: 'majority'
};

declare global {
    var mongoConnection: {
        client: MongoClient | null;
        db: Db | null;
    };
}

if (!global.mongoConnection) {
    global.mongoConnection = {
        client: null,
        db: null
    };
}

async function connect(): Promise<Db> {
    try {
        if (global.mongoConnection.db) {
            console.log('Using existing database connection');
            return global.mongoConnection.db;
        }

        console.log('Creating new MongoDB connection...');
        const client = new MongoClient(MONGO_URI, options);
        await client.connect();
        
        const db = client.db(DB_NAME);
        global.mongoConnection.client = client;
        global.mongoConnection.db = db;
        
        console.log('Successfully connected to MongoDB');
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Reset connection on error
        global.mongoConnection.client = null;
        global.mongoConnection.db = null;
        throw error;
    }
}

export default async function getCollection(
    collectionName: string,
): Promise<Collection> {
    try {
        const db = await connect();
        return db.collection(collectionName);
    } catch (error) {
        console.error('Error getting collection:', error);
        throw error;
    }
}