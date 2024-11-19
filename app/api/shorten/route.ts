import { NextRequest, NextResponse } from "next/server";
import { createShortUrl } from "@/lib/createShortUrl";
import { ShortenRequest, ShortenResponse } from "@/app/interfaces/types";

export async function POST(req: NextRequest) {
    try {
        // Log the incoming request
        console.log('Received request body:', await req.text());

        // Parse the request body again since we consumed it above
        const { alias, url } = JSON.parse(await req.clone().text()) as ShortenRequest;

        // Input validation logging
        console.log('Validating inputs:', { alias, url });

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

        // Log before database operation
        console.log('Attempting to create short URL:', { alias, url });

        // Create the short URL
        await createShortUrl(alias, url);
        
        console.log('Successfully created short URL');
        
        return NextResponse.json<ShortenResponse>(
            { success: true, alias },
            { status: 201 }
        );
    } catch (error: unknown) {
        // Detailed error logging
        console.error('Error details:', {
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