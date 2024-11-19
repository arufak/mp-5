import getCollection from '../db';
import { UrlRecord } from '@/app/interfaces/types';

export async function createShortUrl(alias: string, url: string): Promise<string> {
    const collection = await getCollection('urls');
    const existing = await collection.findOne({ alias });

    if (existing) throw new Error('Alias already exists.');

    const newRecord: UrlRecord = {
        alias,
        url,
        createdAt: new Date()
    };

    await collection.insertOne(newRecord);
    return alias;
}