import React from 'react';
import { useThreeSnapshot } from '../hooks/useThreeSnapshot'; // Adjusted path

const Model3DViewer = ({ document }: { document: { name: string, url: string } }) => {
    const ext = document.name.split('.').pop()?.toLowerCase() || '';
    const { snapshot, isLoading, error } = useThreeSnapshot(document.url, ext);

    return (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center p-4">
            {isLoading && (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-gray-400">Generating 3D preview...</p>
                </div>
            )}
            {error && (
                <div className="text-center p-8">
                    <p className="text-red-500 mb-2">Preview generation failed</p>
                    <p className="text-gray-400 text-sm">Could not create a snapshot for this 3D model.</p>
                </div>
            )}
            {snapshot && (
                <img
                    src={snapshot}
                    alt={`Snapshot of ${document.name}`}
                    className="max-w-full max-h-full object-contain"
                />
            )}
        </div>
    );
};

export default Model3DViewer;