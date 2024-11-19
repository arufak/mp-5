import getCollection from '../../db';

export async function createShortUrl(alias: string, url: string) {
    const collection = await getCollection('urls');
    const existing = await collection.findOne({ alias });

    if (existing) throw new Error('Alias already exists.');

    const result = await collection.insertOne({ alias, url });
    return result.insertedId;
}