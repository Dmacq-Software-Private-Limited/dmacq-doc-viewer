import React from 'react';

// Prop Types & Helpers
import type { DocumentMetadata } from "../../pages/DocumentViewer";
import { getViewerType, ViewerType } from './lib/getViewerType';

// Specialized Viewer Components
import PdfViewer from './viewers/PdfViewer';
import MediaViewer from './viewers/MediaViewer';
import Model3DViewer from './viewers/Model3DViewer';
import TextViewer from './viewers/TextViewer';
import DBViewer from './viewers/DBViewer';       // Existing component
import ComicViewer from './viewers/ComicViewer';   // Existing component
import FB2Viewer from './viewers/FB2Viewer';     // Existing component
import ImageViewer from './viewers/ImageViewer';
import MhtViewer from './viewers/MhtViewer';

// Define the main props interface
export interface DocumentViewerProps {
    document: {
        id?: string;
        name: string;
        fileType: string;
        url: string;
        convertedUrl?: string;
        is_plain_text?: boolean;
    };
    currentPage: number;
    onPageChange: (page: number) => void;
    onTotalPagesChange: (total: number) => void;
    onMetadataExtracted?: (metadata: DocumentMetadata) => void;
    zoomLevel: number;
    rotation: number;
    isFullscreen: boolean;
}

const UnsupportedViewer = ({ message }: { message: string }) => (
    <div className="h-full flex items-center justify-center bg-gray-100 p-4">
        <p className="text-red-500 text-center">{message}</p>
    </div>
);

const DocumentViewer: React.FC<DocumentViewerProps> = (props) => {
    const { document } = props;
    const viewerType = getViewerType(document);

    switch (viewerType) {
        case 'PDF':
            return <PdfViewer {...props} />;

        case 'TEXT':
            return <TextViewer document={document} />;

        case 'IMAGE':
            return <ImageViewer document={document} />;

        case 'MEDIA':
            return <MediaViewer document={document} />;

        case 'MODEL_3D':
            return <Model3DViewer document={document} />;

        case 'COMIC':
            return <ComicViewer documentUrl={document.url} documentName={document.name} />;

        case 'DB':
            return <DBViewer documentUrl={document.url} />;

        case 'FB2':
            return <FB2Viewer documentUrl={document.url} />;

        case 'UNSUPPORTED_EBOOK':
            if (document.name.toLowerCase().endsWith('.mht')) {
                return <MhtViewer document={document} />;
            }
            return <UnsupportedViewer message="This eBook format is not supported for in-browser preview. Please convert it to PDF." />;

        case 'UNSUPPORTED':
        default:
            return <UnsupportedViewer message="This file type is not supported for preview." />;
    }
};

export default DocumentViewer;