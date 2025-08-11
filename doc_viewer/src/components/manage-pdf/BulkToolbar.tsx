import React from "react";
import DuplicateIcon from "../../assets/icons/content_copy.svg";
import RotateIcon from "../../assets/icons/Rotate.svg";
import DeleteIcon from "../../assets/icons/delete_managepdf.svg";
import CloseIcon from "../../assets/icons/close.svg";


export interface BulkToolbarProps {
    selectedCount: number;
    onClear: () => void;
    onDuplicate: () => void;
    onRotate: () => void;
    onDelete: () => void;
}

const BulkToolbar: React.FC<BulkToolbarProps> = ({
                                                     selectedCount, onClear, onDuplicate, onRotate, onDelete
                                                 }) => (
    <div
        className="flex items-center gap-4"
        style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '64px',
            padding: '6px 16px',
            borderRadius: '4px',
            background: 'var(--neutral-light-for-white-bg-neutral-1300, #0C1927)',
            zIndex: 50,
        }}
    >
        <span
            style={{
                color: 'var(--neutral-light-for-white-bg-neutral-300, #CBD5E2)',
                fontFeatureSettings: "'liga' off, 'clig' off",
                fontFamily: '"Noto Sans"',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
            }}
        >
            {selectedCount} Selected
        </span>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <button onClick={onDuplicate} className="p-1.5 rounded-md hover:bg-gray-700">
                    <img src={DuplicateIcon} alt="Duplicate" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                </button>
                <button onClick={onRotate} className="p-1.5 rounded-md hover:bg-gray-700">
                    <img src={RotateIcon} alt="Rotate" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                </button>
                <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-gray-700">
                    <img src={DeleteIcon} alt="Delete" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
                </button>
            </div>
            <button onClick={onClear} className="p-1.5 rounded-md hover:bg-gray-700">
                <img src={CloseIcon} alt="Close" className="w-5 h-5" style={{ filter: 'brightness(0) invert(1)' }} />
            </button>
        </div>
    </div>
);

export default BulkToolbar;
