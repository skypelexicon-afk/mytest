"use client";

import { useEffect, useState } from "react";
// @ts-expect-error: No type definitions available
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-expect-error: No type definitions available
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

type Props = {
    fileUrl: string;
};
export default function CodeViewer({ fileUrl }: Props) {
    const [code, setCode] = useState<string>("Loading...");
    const [language, setLanguage] = useState<string>("text");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const ext = fileUrl.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "js":
                setLanguage("javascript");
                break;
            case "ts":
                setLanguage("typescript");
                break;
            case "py":
                setLanguage("python");
                break;
            case "c":
                setLanguage("c");
                break;
            case "cpp":
            case "cc":
            case "cxx":
                setLanguage("cpp");
                break;
            case "java":
                setLanguage("java");
                break;
            case "html":
                setLanguage("html");
                break;
            case "css":
                setLanguage("css");
                break;
            case "json":
                setLanguage("json");
                break;
            default:
                setLanguage("text");
        }
    }, [fileUrl]);

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const res = await fetch(fileUrl);
                const text = await res.text();
                setCode(text);
            } catch (error) {
                setCode("// Error loading file");
            }
        };
        fetchCode();
    }, [fileUrl]);

    // Copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            alert("Failed to copy!");
        }
    };

    return (
        <div className="bg-white">
            <div>
                <button
                    onClick={handleCopy}
                    //className="rounded-md mt-2 ml-2 font-bold cursor-pointer bg-purple-700 px-4 py-2 text-sm text-white hover:bg-purple-600 border-2"
                    className="rounded-md mt-2 ml-2 font-bold cursor-pointer bg-yellow-800 px-4 py-2 text-sm text-yellow-200 hover:bg-yellow-200 hover:text-yellow-800 border-2"
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                showLineNumbers
                wrapLongLines={true}
                wrapLines={true}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}