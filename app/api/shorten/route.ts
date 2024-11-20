import { NextRequest, NextResponse } from "next/server";
import { createShortUrl } from "@/lib/createShortUrl";
import { ShortenRequest, ShortenResponse } from "@/app/interfaces/types";

export async function POST(req: NextRequest): Promise<NextResponse<ShortenResponse>> {
    try {
        // Set a timeout for the entire operation
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out')), 5000);
        });

        const operationPromise = async (): Promise<NextResponse<ShortenResponse>> => {
            const body = await req.json() as ShortenRequest;
            console.log('Received request body:', body);

            const { alias, url } = body;

            if (!alias || !url) {
                return NextResponse.json<ShortenResponse>(
                    { success: false, message: "Alias and URL are required." },
                    { status: 400 }
                );
            }

            await createShortUrl(alias, url);
            return NextResponse.json<ShortenResponse>(
                { success: true, alias },
                { status: 201 }
            );
        };

        // Race between the operation and timeout
        return await Promise.race([
            operationPromise(),
            timeoutPromise
        ]) as NextResponse<ShortenResponse>;
    } catch (error) {
        console.error('Error in URL shortener:', error);

        if (error instanceof Error && error.message === 'Operation timed out') {
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "Request timed out. Please try again." },
                { status: 504 }
            );
        }

        if (error instanceof Error && error.message === "Alias already exists.") {
            return NextResponse.json<ShortenResponse>(
                { success: false, message: "This alias is already taken." },
                { status: 409 }
            );
        }

        return NextResponse.json<ShortenResponse>(
            { success: false, message: "Failed to create short URL. Please try again." },
            { status: 500 }
        );
    }
}