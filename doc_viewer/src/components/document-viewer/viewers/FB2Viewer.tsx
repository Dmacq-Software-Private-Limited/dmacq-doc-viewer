import React, { useEffect, useState } from 'react';

const FB2Viewer = ({ documentUrl }: { documentUrl: string }) => {
    const [content, setContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFB2 = async () => {
            try {
                const res = await fetch(documentUrl);
                if (!res.ok) throw new Error(`Failed to fetch document: ${res.statusText}`);
                const text = await res.text();

                // Dynamically import parser
                const { XMLParser } = await import("fast-xml-parser");
                const parser = new XMLParser({ ignoreAttributes: true, textNodeName: "_text" });
                const json = parser.parse(text);

                const body = json?.FictionBook?.body;
                let extractedText = "";

                // Recursive function to extract text from nested sections and paragraphs
                const processNode = (node: any) => {
                    if (!node) return;
                    if (typeof node === 'string') {
                        extractedText += node + "\n\n";
                        return;
                    }
                    if (node._text) extractedText += node._text + "\n\n";
                    if (node.p) {
                        if(Array.isArray(node.p)) node.p.forEach(processNode);
                        else processNode(node.p);
                    }
                    if (node.section) {
                        if(Array.isArray(node.section)) node.section.forEach(processNode);
                        else processNode(node.section);
                    }
                };

                processNode(body);
                setContent(extractedText.trim() || "No content found in document body.");

            } catch (err) {
                console.error("FB2Viewer error:", err);
                setError(err instanceof Error ? err.message : "Failed to load FB2 document");
            } finally {
                setLoading(false);
            }
        };
        loadFB2();
    }, [documentUrl]);

    if (loading) return <div className="text-center p-4">Loading FB2 document...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="h-full overflow-auto bg-gray-50">
            <div className="p-8 max-w-4xl mx-auto whitespace-pre-wrap text-justify text-gray-800">
                {content}
            </div>
        </div>
    );
};

export default FB2Viewer;