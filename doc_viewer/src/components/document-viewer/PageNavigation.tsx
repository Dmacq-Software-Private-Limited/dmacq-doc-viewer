import React, { useEffect, useRef } from 'react';
import { apiService } from '@/services/apiService'; // Ensure this path is correct

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  documentId?: string;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  documentId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, totalPages);
  }, [totalPages]);

  useEffect(() => {
    const activeItem = itemRefs.current[currentPage - 1];
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [currentPage]);

  return (
    <div
      className="h-full flex flex-col"
      style={{
        display: 'flex',
        padding: '8px 12px 12px 12px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        alignSelf: 'stretch',
        background: '#FFF'
      }}
    >
     

      <div
        className="flex-1 overflow-auto scroll-smooth no-scrollbar"
        ref={containerRef}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <div
            key={page}
            ref={(el) => (itemRefs.current[page - 1] = el)}
            onClick={() => onPageChange(page)}
            className={`cursor-pointer overflow-hidden transition-all duration-200`}
            style={{
              width: '76px',
              height: '108px',
              flexShrink: 0,
              borderRadius: '2px',
              border: `1px solid ${page === currentPage ? '#2950DA' : 'var(--dms-primary-primary-600, #2950DA)'}`,
              background: 'rgba(255, 255, 255, 0.70)',
              boxShadow: '0 0 1.3px 0 rgba(8, 31, 82, 0.54)',
            }}
          >
            <div className="relative w-full h-full">
              <img
                src={apiService.getDocumentPageUrl(documentId ?? '', page)}
                alt={`Page ${page}`}
                className={`w-full h-full object-cover ${
                  page === currentPage ? 'blur-sm opacity-70' : ''
                }`}
              />
              {page === currentPage && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    color: '#192839',
                    fontFeatureSettings: "'liga' off, 'clig' off",
                    fontFamily: 'Noto Sans',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    lineHeight: '100%'
                  }}
                >
                  {page}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageNavigation;
