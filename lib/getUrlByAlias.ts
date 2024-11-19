import getCollection from '../db';

export async function getUrlByAlias(alias: string) {
    const collection = await getCollection('urls');
    return await collection.findOne({ alias });
}
