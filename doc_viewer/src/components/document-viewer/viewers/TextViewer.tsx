import React, { useEffect, useState, useMemo, useRef } from 'react';
import type { DocumentViewerProps } from '../DocumentViewer';

const TextViewer: React.FC<DocumentViewerProps> = ({
    document,
    searchQuery,
    onSearchResults,
    searchResult,
}) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchText = async () => {
            try {
                const response = await fetch(document.url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch text file: ${response.statusText}`);
                }
                const textContent = await response.text();
                setContent(textContent);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not load text file.');
            } finally {
                setLoading(false);
            }
        };

        fetchText();
    }, [document.url]);

    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const highlightedContent = useMemo(() => {
        if (!searchQuery || !content) return content;
        const query = escapeRegExp(searchQuery);
        const regex = new RegExp(query, 'gi'); // 'gi' for global, case-insensitive
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

    // This effect is now simplified to always be case-insensitive
    useEffect(() => {
        if (!searchQuery || !content || !onSearchResults) {
            if (onSearchResults) onSearchResults({ count: 0, current: 0 });
            return;
        }
        const query = escapeRegExp(searchQuery);
        const regex = new RegExp(query, 'gi'); // 'gi' for global, case-insensitive
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

    if (loading) return <div className="p-4 text-center">Loading text...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div ref={containerRef} className="h-full overflow-auto bg-gray-50 p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{highlightedContent}</pre>
        </div>
    );
};

export default TextViewer;
