import React from 'react';
import { Separator } from '@/components/ui/separator';

interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creation_date?: string;
  modification_date?: string;
  pages?: number;
  file_size?: string;
  additional_info?: Record<string, unknown>;
  invoiceNumber?: string;
  name?: string;
  billTo?: string;
  invoiceDate?: string;
  dueDate?: string;
  total?: string;
  [key: string]: unknown;
}

interface MetadataPanelProps {
  documentId?: string;
  extractedMetadata?: DocumentMetadata;
}

const MetadataDisplay: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (!value || value === 'N/A') return null;

  const formattedLabel = label.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div>
      <label className="text-[13px] font-medium text-gray-500 tracking-wide">
        {formattedLabel}
      </label>
      <p className="text-sm text-black-500 font-semibold mt-1 break-words whitespace-pre-line">
        {String(value)}
      </p>
    </div>
  );
};

const MetadataPanel: React.FC<MetadataPanelProps> = ({ extractedMetadata }) => {
  if (!extractedMetadata) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-1 pt-0 ">Metadata</h3>
        <p>No metadata available for this file.</p>
      </div>
    );
  }



  const { additional_info = {}, ...mainMetadata } = extractedMetadata;

  // Render known invoice fields
  const invoiceFields = ['invoiceNumber', 'name', 'billTo', 'invoiceDate', 'dueDate', 'total'];

  return (
    <div className="w-full">
        <h3 className="text-[#40566D] font-[Noto_Sans] text-[18px] not-italic font-bold leading-normal capitalize py-3 ">
          Metadata
        </h3>
      <Separator className="-mx-5 w-[calc(100%+3rem)] h-px bg-gray-200 mb-5" />

      <div className="space-y-5">
        {/* Invoice-specific metadata */}
        {invoiceFields.map((key) => (
          <MetadataDisplay key={key} label={key} value={mainMetadata[key]} />
        ))}

        {/* Other standard metadata */}
        {Object.entries(mainMetadata)
          .filter(([key]) => !invoiceFields.includes(key))
          .map(([key, value]) => (
            <MetadataDisplay key={key} label={key} value={value} />
          ))}

        {/* Additional metadata */}
        {Object.entries(additional_info).map(([key, value]) => (
          <MetadataDisplay key={key} label={key} value={value} />
        ))}
      </div>
    </div>
  );
};

export default MetadataPanel;
