
import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { DocumentViewerProps } from '../DocumentViewer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set workerSrc for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer: React.FC<DocumentViewerProps> = ({
                                                      document,
                                                      currentPage,
                                                      onPageChange,
                                                      onTotalPagesChange,
                                                      zoomLevel,
                                                      rotation,
                                                      isFullscreen,
                                                  }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);


    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        onTotalPagesChange(numPages);
        setLoading(false);
    };

    useEffect(() => {
        if (!document.url) {
            setError("Document URL is missing.");
        }
    }, [document.url]);


    useEffect(() => {
        const container = scrollContainerRef.current;
        const pageNode = pageRefs.current[currentPage - 1];
        if (container && pageNode) {
            container.scrollTop = pageNode.offsetTop;
        }
    }, [currentPage]);


    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-100">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (

        <div
        className="h-full flex flex-col overflow-auto no-scrollbar"
        ref={scrollContainerRef}
        style={{ background: 'transparent', padding: 0 }}
      >
      

            {loading && (
                <div className="text-center py-8 text-gray-600">Loading PDF...</div>
            )}
            <Document
                file={document.url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => setError(err.message)}
            >
                {(isFullscreen
                        ? [currentPage]
                        : Array.from({ length: numPages }, (_, i) => i + 1)
                ).map((pageNumber) => (

                    <div key={pageNumber} ref={(el) => (pageRefs.current[pageNumber - 1] = el)} className="mb-4 flex justify-center">

                        <Page
                            pageNumber={pageNumber}
                            scale={zoomLevel}
                            rotate={rotation}
                        />
                    </div>
                ))}
            </Document>
        </div>
    );
};

export default PdfViewer;
