import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ManagePDFProps {
    documentId: string;
    previewUrl: string;
    onClose: () => void;
}

interface PageState {
    pageNumber: number;
    rotation: number;
    deleted: boolean;
}

const ManagePDF: React.FC<ManagePDFProps> = ({ documentId, previewUrl, onClose }) => {
    const [pages, setPages] = useState<PageState[]>([]);
    const [undoStack, setUndoStack] = useState<PageState[][]>([]);
    const [redoStack, setRedoStack] = useState<PageState[][]>([]);

    useEffect(() => {
        // Simulate loading totalPages (for now assume 5)
        const initialPages = Array.from({ length: 5 }, (_, i) => ({
            pageNumber: i + 1,
            rotation: 0,
            deleted: false,
        }));
        setPages(initialPages);
    }, []);

    const saveStateToUndo = () => {
        setUndoStack(prev => [...prev, [...pages]]);
        setRedoStack([]); // clear redo on new change
    };

    const rotatePage = (pageIndex: number, direction: 'left' | 'right') => {
        saveStateToUndo();
        setPages(prev =>
            prev.map((p, i) =>
                i === pageIndex
                    ? { ...p, rotation: (p.rotation + (direction === 'left' ? -90 : 90)) % 360 }
                    : p
            )
        );
    };

    const deletePage = (pageIndex: number) => {
        saveStateToUndo();
        setPages(prev => prev.map((p, i) => (i === pageIndex ? { ...p, deleted: true } : p)));
    };

    const undo = () => {
        if (undoStack.length === 0) return;
        const prevState = undoStack[undoStack.length - 1];
        setRedoStack(r => [...r, [...pages]]);
        setUndoStack(u => u.slice(0, -1));
        setPages(prevState);
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const nextState = redoStack[redoStack.length - 1];
        setUndoStack(u => [...u, [...pages]]);
        setRedoStack(r => r.slice(0, -1));
        setPages(nextState);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold">Manage PDF</h2>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {pages.map((page, i) => (
                        <div
                            key={i}
                            className={`border rounded p-2 relative ${page.deleted ? 'opacity-30 grayscale' : ''}`}
                        >
                            <div className="w-full h-40 bg-gray-200 mb-2 flex items-center justify-center">
                                <span className="text-sm text-gray-600">Page {page.pageNumber}</span>
                            </div>
                            <div className="flex gap-1 justify-center">
                                <Button size="sm" onClick={() => rotatePage(i, 'left')}>⟲</Button>
                                <Button size="sm" onClick={() => rotatePage(i, 'right')}>⟳</Button>
                                <Button size="sm" variant="destructive" onClick={() => deletePage(i)}>🗑️</Button>
                            </div>
                            {page.rotation !== 0 && (
                                <span className="absolute top-1 left-1 text-xs text-orange-600">
                  {page.rotation}°
                </span>
                            )}
                            {page.deleted && (
                                <span className="absolute top-1 right-1 text-xs text-red-600">
                  Deleted
                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-4">
                    <div className="space-x-2">
                        <Button onClick={undo} disabled={undoStack.length === 0}>Undo</Button>
                        <Button onClick={redo} disabled={redoStack.length === 0}>Redo</Button>
                    </div>
                    <div>
                        <Button variant="default">Save (Coming Soon)</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagePDF;
