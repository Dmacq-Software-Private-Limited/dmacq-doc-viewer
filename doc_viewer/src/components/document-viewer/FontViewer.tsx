import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Type as FontIcon, AlertTriangle } from 'lucide-react';
import { apiService, DocumentDetails } from '../../services/apiService';

interface FontViewerProps {
    document: DocumentDetails;
    }

    const FONT_FAMILY_NAME = 'dynamic-font-preview';

    const FontViewer: React.FC<FontViewerProps> = ({ document }) => {

    const fontPreviewAvailable = !document.metadata?.additional_info?.error;

    useEffect(() => {
        if (!document || !fontPreviewAvailable) return;
        
        const fontUrl = apiService.getDocumentDownloadUrl(document.id);
        const style = window.document.createElement('style');
        style.innerHTML = `
        @font-face {
            font-family: '${FONT_FAMILY_NAME}';
            src: url('${fontUrl}');
        }
        `;
        window.document.head.appendChild(style);

        return () => {
        window.document.head.removeChild(style);
        };
    }, [document, fontPreviewAvailable]);

    const previewStyle = {
        fontFamily: fontPreviewAvailable ? FONT_FAMILY_NAME : 'sans-serif',
    };
    
    const characterSet = document.metadata?.additional_info?.character_set;
    const errorMessage = document.metadata?.additional_info?.error;

    return (
        <div className="p-4 md:p-8 w-full">
            {/* <CardContent className="w-full h-full "> */}
            <div className="p-4 rounded-lg">
                {/* <h3 className="text-sm font-medium text-gray-500 mb-2">Available Characters</h3> */}
                {errorMessage ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <p>{errorMessage}</p>
                </div>
                ) : (
                <textarea
                    readOnly
                    className="w-full h-96 p-2 text-2xl bg-transparent border-none focus:outline-none resize-none hide-scrollbar"
                    style={previewStyle}
                    value={characterSet || "Loading characters..."}
                />
                )}
            </div>
            {/* </CardContent> */}
        </div>
    );
};

export default FontViewer;