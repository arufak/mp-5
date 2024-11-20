import { NextRequest, NextResponse } from "next/server";
import { createShortUrl } from "@/lib/createShortUrl";
import { ShortenRequest, ShortenResponse } from "@/app/interfaces/types";

export async function POST(req: NextRequest) {
    try {
        // Only parse the body once
        const body = await req.json() as ShortenRequest;
        const { alias, url } = body;

        // Log the request
        console.log('Received request:', { alias, url });

        if (!alias || !url) {
            console.log('Missing required fields');
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "Alias and URL are required." },
                { status: 400 }
            );
        }

        const urlRegex = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/;
        if (!urlRegex.test(url)) {
            console.log('Invalid URL format');
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "Invalid URL format." },
                { status: 400 }
            );
        }

        // Create the short URL
        await createShortUrl(alias, url);
        
        console.log('Successfully created short URL');
        
        return NextResponse.json<ShortenResponse>(
            { success: true, alias },
            { status: 201 }
        );
    } catch (error: unknown) {
        // Detailed error logging
        console.error('Error in shorten route:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            error
        });

        if (error instanceof Error && error.message === "Alias already exists.") {
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "Alias already exists." },
                { status: 409 }
            );
        }

        return NextResponse.json<ShortenResponse>(
            { success: false, message: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
}