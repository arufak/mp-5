// app/page.tsx
"use client";

import styled from "styled-components";
import { useState } from "react";

const StyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: lightblue;
    padding: 20px;
    height: 100vh;
    justify-content: center;
`;

const StyledInput = styled.input`
    margin: 5px 0;
    padding: 10px;
    width: 300px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
`;

const StyledButton = styled.button`
    margin-top: 10px;
    padding: 10px 20px;
    background-color: white;
    color: black;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-align: center;
    font-size: 16px;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const Error = styled.p`
    color: red;
    margin-top: 10px;
`;

const Result = styled.div`
    margin-top: 20px;
    padding: 15px;
    background-color: white;
    border-radius: 5px;
    text-align: center;
`;

export default function Home() {
    const [alias, setAlias] = useState("");
    const [url, setUrl] = useState("");
    const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);

        try {
            const response = await fetch("/api/shorten", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ alias, url }),
            });

            const data = await response.json();

            if (data.success) {
                setShortenedUrl(`${window.location.origin}/${data.alias}`);
            } else {
                setError(data.message);
            }
        } catch (e) {
            setError("Failed to submit the URL");
        }
    };

    const handleCopy = () => {
        if (shortenedUrl) {
            navigator.clipboard.writeText(shortenedUrl);
            alert("Shortened URL copied to clipboard!");
        }
    };

    return (
        <StyledDiv>
            <StyledInput
                type="text"
                value={alias}
                placeholder="Enter alias"
                onChange={(e) => setAlias(e.target.value)}
            />
            <StyledInput
                type="text"
                value={url}
                placeholder="Enter URL"
                onChange={(e) => setUrl(e.target.value)}
            />
            <StyledButton onClick={handleSubmit}>Create Short URL</StyledButton>
            {error && <Error>{error}</Error>}
            {shortenedUrl && (
                <Result>
                    <p>Shortened URL:</p>
                    <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
                        {shortenedUrl}
                    </a>
                    <StyledButton onClick={handleCopy}>Copy URL</StyledButton>
                </Result>
            )}
        </StyledDiv>
    );
}