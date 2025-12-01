import React, { useEffect, useState, useMemo, useRef } from 'react';
import type { DocumentViewerProps } from '../DocumentViewer';

const FB2Viewer: React.FC<DocumentViewerProps> = ({
    document: { url: documentUrl },
    searchQuery,
    onSearchResults,
    searchResult,
}) => {
    const [content, setContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const highlightedContent = useMemo(() => {
        if (!searchQuery || !content) return content;
        const query = escapeRegExp(searchQuery);
        const regex = new RegExp(query, 'gi');
        const parts = content.split(regex);
        const matches = content.match(regex);
        if (!matches) return content;

        return (
            <>
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < matches.length && <mark style={{ backgroundColor: '#F4ED9C' }}>{matches[index]}</mark>}
                    </React.Fragment>
                ))}
            </>
        );
    }, [content, searchQuery]);

    useEffect(() => {
        if (!searchQuery || !content || !onSearchResults) {
            if (onSearchResults) onSearchResults({ count: 0, current: 0 });
            return;
        }
        const query = escapeRegExp(searchQuery);
        const regex = new RegExp(query, 'gi');
        const matches = content.match(regex);
        const count = matches ? matches.length : 0;
        onSearchResults({ count, current: count > 0 ? 1 : 0 });
    }, [content, searchQuery, onSearchResults]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !searchResult || searchResult.current === 0) return;

        const highlightedElements = container.querySelectorAll('mark');
        if (highlightedElements.length > 0 && searchResult.current <= highlightedElements.length) {
            const currentElement = highlightedElements[searchResult.current - 1];
            currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [searchResult]);

    if (loading) return <div className="text-center p-4">Loading FB2 document...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div ref={containerRef} className="h-full overflow-auto bg-gray-50">
            <div className="p-8 max-w-4xl mx-auto whitespace-pre-wrap text-justify text-gray-800">
                {highlightedContent}
            </div>
        </div>
    );
};

export default FB2Viewer;
