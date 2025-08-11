import React, { useEffect, useState } from 'react';
import { DocumentViewerProps } from '../DocumentViewer';
import { apiService } from '../../../services/apiService';

const ArchiveViewer: React.FC<DocumentViewerProps> = ({ document }) => {
    const [fileList, setFileList] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFileList = async () => {
            if (!document.id) {
                setError("Document ID is missing.");
                setLoading(false);
                return;
            }
            try {
                const response = await apiService.getArchiveFileList(document.id);
                if (response && response.file_list) {
                    setFileList(response.file_list);
                } else {
                    setError("Invalid response from server.");
                }
            } catch (err) {
                setError("Failed to fetch file list.");
            } finally {
                setLoading(false);
            }
        };

        fetchFileList();
    }, [document.id]);

    if (loading) {
        return <div className="p-4">Loading archive contents...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 h-full overflow-y-auto hide-scrollbar">
            <h2 className="text-lg font-bold mb-2">Archive Contents</h2>
            <ol className="list-decimal pl-5">
                {fileList.map((file, index) => (
                    <li key={index}>{file}</li>
                ))}
            </ol>
        </div>
    );
};

export default ArchiveViewer;
