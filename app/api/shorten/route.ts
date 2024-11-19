import { NextRequest, NextResponse } from "next/server";
import { createShortUrl } from "@/app/lib/createShortUrl";

export async function POST(req: NextRequest) {
    try {
        const { alias, url } = await req.json();

        if (!alias || !url) {
            return NextResponse.json(
                { success: false, message: "Alias and URL are required." },
                { status: 400 }
            );
        }

        const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/;
        if (!urlRegex.test(url)) {
            return NextResponse.json(
                { success: false, message: "Invalid URL format." },
                { status: 400 }
            );
        }

        await createShortUrl(alias, url);
        return NextResponse.json({ success: true, alias }, { status: 201 });
    } catch (error: any) {
        if (error.message === "Alias already exists.") {
            return NextResponse.json(
                { success: false, message: "Alias already exists." },
                { status: 409 }
            );
        }

        console.error("Error in shorten.ts:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}