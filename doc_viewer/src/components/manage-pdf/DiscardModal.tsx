import React from "react";
import { Button } from "../ui/button";
import CloseIcon from '../../assets/icons/close-comment.svg';

interface DiscardModalProps {
    show: boolean;
    onCancel: () => void;
    onDiscard: () => void;
}

const DiscardModal: React.FC<DiscardModalProps> = ({ show, onCancel, onDiscard }) => !show ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
            style={{
                display: 'flex',
                width: '475px',
                flexDirection: 'column',
                alignItems: 'flex-end',
                borderRadius: 'var(--Medium, 8px)',
                background: 'var(--neutral-light-for-white-bg-netral-000, #FFF)',
                boxShadow: '0px 8px 16px -4px rgba(0, 0, 0, 0.10), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }}
        >
            {/* Header */}
            <div className="py-3 pr-2 pl-6 w-full">
                <div className="flex justify-between items-center">
                    <h2 className="text-[var(--neutral-light-for-white-bg-neutral-1200, #192839)] font-[Noto_Sans] text-lg font-bold leading-[26px]">Discard PDF Edits?</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 p-2">
                        <img src={CloseIcon} alt="Close" className="h-5 w-5" />
                    </button>
                </div>
            </div>
            {/* Body */}
            <div className="px-6 pt-4 border-t w-full">
                <p className="self-stretch text-[var(--neutral-light-for-white-bg-neutral-1200, #192839)] font-[Noto_Sans] text-[14px] font-normal leading-6">
                    You've made changes to the PDF (reorder, insert, delete pages).
                    <br />
                    Do you want to discard them?
                </p>
            </div>
            {/* Footer */}
            <div className="flex w-full justify-end gap-3 p-6 pt-8">
                <Button
                    onClick={onCancel}
                    style={{
                        display: 'flex',
                        height: '40px',
                        padding: '10px 16px',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        border: '1px solid rgba(108, 132, 157, 0.18)',
                        color: '#243547',
                        fontFamily: '"Noto Sans"',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        lineHeight: '16px',
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onDiscard}
                    style={{
                        display: 'flex',
                        height: '40px',
                        padding: '10px 16px',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '8px',
                        background: '#2950DA',
                        color: '#FFF',
                        fontFamily: '"Noto Sans"',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        lineHeight: '16px',
                    }}
                >
                    Discard
                </Button>
            </div>
        </div>
    </div>
);

export default DiscardModal;
