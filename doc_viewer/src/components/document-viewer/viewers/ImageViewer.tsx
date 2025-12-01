import React from 'react';
import type { Document } from '../types';

const ImageViewer = ({ document }: { document: Document }) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 p-4">
            <img
                src={document.url}
                alt={document.name}
                className="max-w-full max-h-full object-contain rounded-md shadow-lg"
            />
        </div>
    );
};

export default ImageViewer;