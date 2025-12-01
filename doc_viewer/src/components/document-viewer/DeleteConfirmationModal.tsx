import React from 'react';
import CloseIcon from '../../assets/icons/close-comment.svg';

interface DeleteConfirmationModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[475px]">
        {/* Header */}
        <div className="p-2 pl-6">
          <div className="flex justify-between items-center">
            <h2 className="text-[var(--neutral-light-for-white-bg-neutral-1200, #192839)] font-[Noto_Sans] text-lg font-bold leading-[26px]">Delete comment from document?</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 p-1.5">
              <img src={CloseIcon} alt="Close" className="h-6 w-6" />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="px-6 pt-4 border-t">
          <p className="self-stretch text-[var(--neutral-light-for-white-bg-neutral-1200, #192839)] font-[Noto_Sans] text-[14px] font-normal leading-6">This comment will be permanently removed from the document. <br/> You won't be able to restore it later.</p>
        </div>
        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-gray-200">
          <button 
            onClick={onCancel} 
            className="flex h-10 flex-col items-center justify-center rounded-lg border border-[rgba(108,132,157,0.18)] px-4 py-2.5 font-[Noto_Sans] text-sm font-semibold leading-4 text-[#243547]"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="flex h-10 flex-col items-center justify-center rounded-lg bg-[#2950DA] px-4 py-2.5 font-[Noto_Sans] text-sm font-semibold leading-4 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
