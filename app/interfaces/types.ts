export interface ShortenRequest {
    alias: string;
    url: string;
}

export interface ShortenResponse {
    success: boolean;
    message?: string;
    alias?: string;
}

export interface UrlRecord {
    alias: string;
    url: string;
    createdAt: Date;
}