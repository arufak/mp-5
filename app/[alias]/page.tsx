//URL REDIRECT HANDLER: dynamic route handling for shortened URLs, looks up the alias in the database and redirects to the corresponding URL

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
            <p>The alias &quot;{alias}&quot; does not exist.</p>
        </div>
    );
}