import React from 'react';
import { apiService } from '../../../services/apiService';

const MediaViewer = ({ document }: { document: { id?: string, fileType: string } }) => {
    const fileUrl = document.id ? apiService.getDocumentPreviewUrl(document.id) : '';

    if (document.fileType.startsWith('video')) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black p-4">
                <video
                    controls
                    src={fileUrl}
                    className="max-w-full max-h-full rounded-lg shadow-xl"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    if (document.fileType.startsWith('audio')) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
                <audio controls src={fileUrl} className="w-full max-w-md">
                    Your browser does not support the audio element.
                </audio>
            </div>
        );
    }
    return null;
};

export default MediaViewer;