import React from 'react';
import pdfIcon from '../../assets/icons/Group.svg';
import Download from '../../assets/icons/Download.svg';
import print from '../../assets/icons/print.svg';
import close from '../../assets/icons/close.svg';
import { apiService } from '@/services/apiService';


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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    if (!doc.id) return;
    try {
      const docDetails = await apiService.getDocument(doc.id);
      const downloadUrl = apiService.getDocumentDownloadUrl(doc.id);
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docDetails.originalName || `${doc.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handlePrint = async () => {
    if (!doc.id) return;
    try {
      const downloadUrl = apiService.getDocumentDownloadUrl(doc.id);
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            const iFrameWindow = iframe.contentWindow;
            if (iFrameWindow) {
              const cleanup = () => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(blobUrl);
                iFrameWindow.removeEventListener('afterprint', cleanup);
              };
              iFrameWindow.addEventListener('afterprint', cleanup);
              iFrameWindow.focus();
              iFrameWindow.print();
            } else {
              throw new Error("Could not get iframe content window.");
            }
          } catch (e) {
            console.error("Printing from iframe failed:", e);
            // Fallback cleanup
            document.body.removeChild(iframe);
            URL.revokeObjectURL(blobUrl);
          }
        }, 500); // Delay to ensure PDF is rendered in iframe
      };
    } catch (error) {
      console.error("Print failed:", error);
    }
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


    <div className="flex items-center gap-2 mr-3">
          <button
            onClick={handleDownload}
            className="p-2 rounded hover:bg-gray-700 flex items-center justify-center"
          >
            <img src={Download} alt="Download" className="w-6 h-6" style={{ filter: 'brightness(0) saturate(100%) invert(93%) sepia(8%) saturate(449%) hue-rotate(181deg) brightness(95%) contrast(86%)' }} />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded hover:bg-gray-700 flex items-center justify-center"
          >
            <img src={print} alt="Print" className="w-6 h-6" style={{ filter: 'brightness(0) saturate(100%) invert(93%) sepia(8%) saturate(449%) hue-rotate(181deg) brightness(95%) contrast(86%)' }} />
          </button>

          <button
            onClick={handleClose}
            className="p-2 rounded hover:bg-gray-700 flex items-center justify-center"
          >
            <img src={close} alt="Close" className="w-6 h-6" style={{ filter: 'brightness(0) saturate(100%) invert(93%) sepia(8%) saturate(449%) hue-rotate(181deg) brightness(95%) contrast(86%)' }} />
          </button>
        </div>
      </div>
   </div>
  );
};

export default DocumentHeader;
