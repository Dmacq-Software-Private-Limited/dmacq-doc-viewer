import React from 'react';
// import NoSignatureIcon from '@/assets/icons/no-sign.png';
import SignatureIcon from '@/assets/icons/sign.svg';
import { Separator } from '@/components/ui/separator';

interface SignaturePanelProps {
  documentId: string;
}

const SignaturePanel: React.FC<SignaturePanelProps> = ({ documentId }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="w-full py-3">
        <h2 className="text-[#192839] font-[Noto_Sans] text-[18px] not-italic font-bold leading-normal capitalize">
          Signature
        </h2>
      </div>
      <Separator className="-mx-5 w-[calc(100%+2.5rem)] h-px bg-gray-200" />
      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <img src={NoSignatureIcon} alt="No signature" className="w-24 h-24 mb-4" />
        <h2 className="text-lg font-bold mb-2">No Signature yet</h2>
        <p className="text-center text-gray-500 mb-4">
          This document hasn't been signed yet. Please review the content and add your signature to complete the process.
        </p>
        <button className="flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          + Add Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePanel;
