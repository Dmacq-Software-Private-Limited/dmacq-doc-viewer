import React, { useEffect, useState } from 'react';
import type { Document } from '../types';

const TextViewer = ({ document }: { document: Document }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) return <div className="p-4 text-center">Loading text...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="h-full overflow-auto bg-gray-50 p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
    );
};

export default TextViewer;