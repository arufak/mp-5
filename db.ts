import { MongoClient, Db, Collection, MongoClientOptions } from "mongodb";

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is undefined");
}

const DB_NAME = "mp-5";

// Add connection options with reasonable timeouts
const options: MongoClientOptions = {
    connectTimeoutMS: 5000,  // 5 seconds
    socketTimeoutMS: 5000,   // 5 seconds
    serverSelectionTimeoutMS: 5000, // 5 seconds
    maxPoolSize: 10,         // Maximum number of connections
    minPoolSize: 1,          // Minimum number of connections
};

declare global {
    var mongoConnection: {
        client: MongoClient | null;
        db: Db | null;
        promise: Promise<Db> | null;
    };
}

global.mongoConnection = global.mongoConnection || {
    client: null,
    db: null,
    promise: null,
};

async function connect(): Promise<Db> {
    try {
        // If we have a connection, use it
        if (global.mongoConnection.db) {
            return global.mongoConnection.db;
        }

        // If we're connecting, wait for it
        if (global.mongoConnection.promise) {
            return global.mongoConnection.promise;
        }

        // Create new connection with timeout
        console.log('Creating new MongoDB connection...');
        const client = new MongoClient(MONGO_URI, options);
        
        // Set a timeout for the entire connection process
        const connectionPromise = Promise.race([
            client.connect(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 5000)
            )
        ]);

        await connectionPromise;
        global.mongoConnection.client = client;
        global.mongoConnection.db = client.db(DB_NAME);
        
        console.log('Successfully connected to MongoDB');
        return global.mongoConnection.db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export default async function getCollection(
    collectionName: string,
): Promise<Collection> {
    try {
        if (!global.mongoConnection.db) {
            global.mongoConnection.db = await connect();
        }
        return global.mongoConnection.db.collection(collectionName);
    } catch (error) {
        console.error('Error getting collection:', error);
        throw new Error('Failed to connect to database. Please try again.');
    }
}

// Add connection health check
export async function checkConnection(): Promise<boolean> {
    try {
        const db = await connect();
        await db.command({ ping: 1 });
        return true;
    } catch {
        return false;
    }
}

// Cleanup for development
if (process.env.NODE_ENV === 'development') {
    process.on('SIGTERM', async () => {
        if (global.mongoConnection.client) {
            await global.mongoConnection.client.close();
            global.mongoConnection.client = null;
            global.mongoConnection.db = null;
            global.mongoConnection.promise = null;
        }
    });
}