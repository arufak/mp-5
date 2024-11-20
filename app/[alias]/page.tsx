import { redirect } from "next/navigation";
import getCollection from "@/db";

export default async function Page({ params }: { params: { alias: string } }) {
    try {
        const { alias } = params;
        const collection = await getCollection("urls");
        const record = await collection.findOne({ alias });

        if (record?.url) {
            redirect(record.url);
        }

        return (
            <div>
                <h1>Alias not found</h1>
                <p>The alias "{alias}" does not exist.</p>
            </div>
        );
    } catch (error) {
        console.error('Error in alias page:', error);
        return (
            <div>
                <h1>Error</h1>
                <p>Failed to process the request. Please try again later.</p>
            </div>
        );
    }
}