import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface TextViewerProps {
    document: {
        id?: string;
        url: string;
    };
    }

    const TextViewer: React.FC<TextViewerProps> = ({ document }) => {
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!document.id) {
            setError("Document ID is missing.");
            setLoading(false);
            return;
        }

        const fetchTextContent = async () => {
        try {
            const response = await fetch(apiService.getDocumentPreviewUrl(document.id!));
            if (!response.ok) {
            throw new Error(`Failed to fetch text content: ${response.statusText}`);
            }
            const text = await response.text();
            setTextContent(text);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load file content.');
        } finally {
            setLoading(false);
        }
        };

        fetchTextContent();
    }, [document.id]);

    if (loading) {
        return <div className="p-4 text-center">Loading content...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="w-full h-full bg-gray-900 text-white p-4 overflow-auto font-mono text-sm hide-scrollbar">
        <pre>{textContent}</pre>
        </div>
    );
};

export default TextViewer;