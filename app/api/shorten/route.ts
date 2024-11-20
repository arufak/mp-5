import { NextRequest, NextResponse } from "next/server";
import { createShortUrl } from "@/lib/createShortUrl";
import { ShortenRequest, ShortenResponse } from "@/app/interfaces/types";

export async function POST(req: NextRequest): Promise<NextResponse<ShortenResponse>> {
    try {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out')), 25000); // 25 seconds timeout
        });

        const operationPromise = async (): Promise<NextResponse<ShortenResponse>> => {
            try {
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
            } catch (error) {
                console.error('Operation error:', error);
                throw error;
            }
        };

        return await Promise.race([
            operationPromise(),
            timeoutPromise
        ]);
    } catch (error) {
        console.error('Error in URL shortener:', error);

        if (error instanceof Error) {
            if (error.message === 'Operation timed out') {
                return NextResponse.json<ShortenResponse>(
                    { success: false, message: "Request timed out. Please try again." },
                    { status: 504 }
                );
            }

            if (error.message === "Alias already exists.") {
                return NextResponse.json<ShortenResponse>(
                    { success: false, message: "This alias is already taken." },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json<ShortenResponse>(
            { success: false, message: "Failed to create short URL. Please try again." },
            { status: 500 }
        );
    }
}