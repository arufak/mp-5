import { NextRequest, NextResponse } from "next/server";
import { createShortUrl } from "@/lib/createShortUrl";
import { ShortenRequest, ShortenResponse } from "@/app/interfaces/types";

export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        let body: ShortenRequest;
        try {
            body = await req.json();
            console.log('Received request body:', body);
        } catch (e) {
            console.error('Failed to parse request body:', e);
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "Invalid request body" },
                { status: 400 }
            );
        }

        const { alias, url } = body;

        // Validate inputs exist
        if (!alias || !url) {
            console.error('Missing required fields:', { alias, url });
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "Alias and URL are required." },
                { status: 400 }
            );
        }

        // Validate alias format
        if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "Alias can only contain letters, numbers, hyphens, and underscores." },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "Invalid URL format." },
                { status: 400 }
            );
        }

        // Try to create the short URL
        try {
            await createShortUrl(alias, url);
            console.log('Successfully created short URL:', { alias, url });
            
            return NextResponse.json<ShortenResponse>(
                { success: true, alias },
                { status: 201 }
            );
        } catch (error) {
            if (error instanceof Error && error.message === "Alias already exists.") {
                return NextResponse.json<ShortenResponse>(
                    { success: false, message: "This alias is already taken." },
                    { status: 409 }
                );
            }
            throw error; // Re-throw other errors to be caught by the outer catch block
        }
    } catch (error) {
        // Log the error for debugging
        console.error('Error in URL shortener:', error);
        
        return NextResponse.json<ShortenResponse>(
            { success: false, message: "Failed to submit the URL. Please try again." },
            { status: 500 }
        );
    }
}