import { NextRequest, NextResponse } from "next/server";
import getCollection from "@/db";

export async function POST(req: NextRequest) {
    try {
        // Get request data
        const { alias, url } = await req.json();
        console.log('Processing request for:', { alias, url });

        // Basic validation
        if (!alias || !url) {
            return NextResponse.json({
                success: false,
                message: "Alias and URL are required"
            }, { status: 400 });
        }

        // Get collection
        const collection = await getCollection('urls');
        
        // Check for existing alias
        const existing = await collection.findOne({ alias });
        if (existing) {
            return NextResponse.json({
                success: false,
                message: "This alias is already taken"
            }, { status: 409 });
        }

        // Insert new URL
        await collection.insertOne({
            alias,
            url,
            createdAt: new Date()
        });

        return NextResponse.json({
            success: true,
            alias
        }, { status: 201 });

    } catch (error) {
        console.error('Error handling request:', error);
        return NextResponse.json({
            success: false,
            message: "Failed to submit the URL"
        }, { status: 500 });
    }
}