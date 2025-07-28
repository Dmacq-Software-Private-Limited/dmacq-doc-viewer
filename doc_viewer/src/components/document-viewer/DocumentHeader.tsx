import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, X, Search } from 'lucide-react';
import pdfIcon from '../../assets/icons/pdf icon.svg';

interface DocumentHeaderProps {
  doc: {
    name: string;
    version: string;
    size: string;
    uploadedBy: string;
    uploadedAt: string;
    fileType: string;
    id?: string;
  };
  onClose?: () => void;
}

const DocumentHeader: React.FC<DocumentHeaderProps> = ({ doc, onClose }) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    console.log('Download PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSearch = () => {
    setShowSearchInput((prev) => !prev);
  };

  const performSearch = () => {
    const viewer = document.querySelector('.react-pdf__Document');
    if (!viewer) return;

    const textLayers = viewer.querySelectorAll('.react-pdf__Page__textContent');
    textLayers.forEach((layer) => {
      layer.querySelectorAll('span').forEach((span) => {
        const content = span.textContent || '';
        if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
          span.style.backgroundColor = 'yellow';
        } else {
          span.style.backgroundColor = 'transparent';
        }
      });
    });
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <div
      className="shadow-sm border-b border-gray-200"
      style={{
        backgroundColor: '#0C1927',
        height: '64px',
        padding: '12px 8px 12px 20px', // top/right/bottom/left
      }}
    > 
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-3">
          <img src={pdfIcon} alt="PDF Icon" className="w-8 h-8" />
          <div>
            <h1 className="text-[14px] leading-[22px] font-semibold not-italic font-noto text-[color:var(--neutral-light-for-white-bg-neutral-050,#F8FAFC)] [font-feature-settings:'liga'_off,'clig'_off]">
              {doc.name} 
              <span className="text-[14px] leading-[22px] font-semibold not-italic font-noto text-[color:var(--neutral-light-for-white-bg-neutral-700,#6C849D)] [font-feature-settings:'liga'_off,'clig'_off]"> &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;  </span> 
              
              Version {doc.version}
            </h1>
            <div className="mt-1 flex items-center flex-wrap gap-x-2 gap-y-1 text-[12px] leading-[12px] font-normal not-italic font-noto text-[color:var(--neutral-light-for-white-bg-neutral-500,#90A5BB)] [font-feature-settings:'liga'_off,'clig'_off]">
              <span>{doc.size}</span>
              <span>•</span>
              <span>Uploaded by {doc.uploadedBy}</span>
              <span>•</span>
              <span>{formatDate(doc.uploadedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[4px] pr-1">
          {showSearchInput && (
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performSearch()}
              className="bg-white text-sm rounded px-2 py-1 outline-none"
            />
          )}

    <div className="flex items-center gap-2 mr-3">
      <button
        onClick={handleSearch}
        className="w-8 h-8 p-2 rounded hover:bg-gray-700 flex items-center justify-center"
        style={{ minWidth: '32px', minHeight: '32px' }}
      >
        <Search className="w-32 h-32 text-white" />
      </button>

      <button
        onClick={handleDownload}
        className="w-8 h-8 p-2 rounded hover:bg-gray-700 flex items-center justify-center"
        style={{ minWidth: '32px', minHeight: '32px' }}
      >
        <Download className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={handlePrint}
        className="w-8 h-8 p-2 rounded hover:bg-gray-700 flex items-center justify-center"
        style={{ minWidth: '32px', minHeight: '32px' }}
      >
        <Printer className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={handleClose}
        className="w-8 h-8 p-2 rounded hover:bg-gray-700 flex items-center justify-center ml-2"
        style={{ minWidth: '32px', minHeight: '32px' }}
      >
        <X className="w-6 h-6 text-white" />
      </button>
    </div>


        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
