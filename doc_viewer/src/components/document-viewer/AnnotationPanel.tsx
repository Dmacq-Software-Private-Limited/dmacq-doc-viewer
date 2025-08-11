import React from 'react';
import { Separator } from '@/components/ui/separator';
import EmptyAnnotationIcon from '../../assets/icons/EmptyAnnotationStatus.svg';

const AnnotationPanel: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="py-3 font-['Noto_Sans'] text-[18px] font-bold leading-none text-[#192839] capitalize">
        Annotation
      </h3>
      <Separator className="-mx-5 w-[calc(100%+3rem)] h-px bg-gray-200 mb-5" />
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <img src={EmptyAnnotationIcon} alt="No annotations" className="w-24 h-24 mb-4" />
        <p className="font-['Noto_Sans'] text-[16px] font-semibold leading-[24px] text-[#192839]">
          No Annotations Yet
        </p>
        <p className="font-['Noto_Sans'] text-[13px] font-[400] leading-[18px] text-[#40566D] px-4 mt-2">
          Go to the{' '}
          <span className="font-[600] text-[#192839]">
            bottom center of the PDF
          </span>{' '}
          and use annotation tools. Your actions will be listed here.
        </p>
      </div>
    </div>
  );
};

export default AnnotationPanel;
