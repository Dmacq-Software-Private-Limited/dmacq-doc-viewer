import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
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
    searchQuery,
    onSearchResults,
    searchResult,
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const onPageChangeRef = useRef(onPageChange);
    onPageChangeRef.current = onPageChange;
    const currentPageRef = useRef(currentPage);
    currentPageRef.current = currentPage;


    const textRenderer = useCallback(
        (textItem: any) => {
            if (!searchQuery) {
                return textItem.str;
            }
            const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedQuery, 'gi');
            let count = 0;
            return textItem.str.replace(regex, (match: string) => {
                count++;
                return `<mark data-match-id="${count}">${match}</mark>`;
            });
        },
        [searchQuery]
    );


    // The counting logic is now handled in the parent component.
    useEffect(() => {
        if (!pdf || !searchQuery || !onSearchResults) {
            if (onSearchResults) onSearchResults({ count: 0, current: 0 });
            return;
        }
        const countMatches = async () => {
            let totalCount = 0;
            const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => (item as any).str).join(' ');
                const pageMatches = pageText.match(regex);
                if (pageMatches) {
                    totalCount += pageMatches.length;
                }
            }
            onSearchResults({ count: totalCount, current: totalCount > 0 ? 1 : 0 });
        };
        countMatches();
    }, [pdf, searchQuery, onSearchResults]);

    const onDocumentLoadSuccess = (loadedPdf: PDFDocumentProxy) => {
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        onTotalPagesChange(loadedPdf.numPages);
        setLoading(false);
    };

    useEffect(() => {
        if (!document.url) {
            setError("Document URL is missing.");
        }
    }, [document.url]);

    useEffect(() => {
        const pageRef = pageRefs.current[currentPage - 1];
        if (pageRef) {
            pageRef.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
    }, [currentPage]);

    useEffect(() => {
        if (!onPageChangeRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visiblePages = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visiblePages.length > 0) {
                    const mostVisiblePage = visiblePages[0];
                    const pageNumber = pageRefs.current.indexOf(mostVisiblePage.target as HTMLDivElement) + 1;
                    if (pageNumber > 0 && pageNumber !== currentPageRef.current) {
                        onPageChangeRef.current(pageNumber);
                    }
                }
            },
            {
                root: scrollContainerRef.current,
                threshold: 0.6,
            }
        );

        const currentRefs = pageRefs.current;
        currentRefs.forEach((pageRef) => {
            if (pageRef) {
                observer.observe(pageRef);
            }
        });

        return () => {
            currentRefs.forEach((pageRef) => {
                if (pageRef) {
                    observer.unobserve(pageRef);
                }
            });
        };
    }, [numPages]);


    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || !searchResult || searchResult.current === 0) return;

        const highlightedElements = container.querySelectorAll('mark');
        if (highlightedElements.length > 0 && searchResult.current <= highlightedElements.length) {
            const currentElement = highlightedElements[searchResult.current - 1];
            currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [searchResult]);


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
                            renderTextLayer={true}
                            customTextRenderer={textRenderer}
                        />
                    </div>
                ))}
            </Document>
        </div>
    );
};

export default PdfViewer;
