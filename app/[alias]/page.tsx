import { redirect } from "next/navigation";
import getCollection from "@/db";

export default async function Page({ params }: { params: { alias: string } }) {
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
}