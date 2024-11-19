import getCollection from '../db';
import { UrlRecord } from '@/app/interfaces/types';

export async function getUrlByAlias(alias: string): Promise<UrlRecord | null> {
    const collection = await getCollection('urls');
    return await collection.findOne<UrlRecord>({ alias });
}