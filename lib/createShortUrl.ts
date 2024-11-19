import getCollection from '../db';
import { UrlRecord } from '@/app/interfaces/types';

export async function createShortUrl(alias: string, url: string): Promise<string> {
    try {
        console.log('Getting collection for URL creation...');
        const collection = await getCollection('urls');
        
        console.log('Checking for existing alias:', alias);
        const existing = await collection.findOne({ alias });

        if (existing) {
            console.log('Alias already exists:', alias);
            throw new Error('Alias already exists.');
        }

        console.log('Creating new URL record:', { alias, url });
        const newRecord: UrlRecord = {
            alias,
            url,
            createdAt: new Date()
        };

        await collection.insertOne(newRecord);
        console.log('Successfully created URL record');
        
        return alias;
    } catch (error) {
        console.error('Error in createShortUrl:', {
            alias,
            url,
            error
        });
        throw error;
    }
}