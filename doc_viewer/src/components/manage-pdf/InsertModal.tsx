import React from "react";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CloseIcon from '../../assets/icons/close-comment.svg';

interface InsertModalProps {
    show: boolean;
    insertTotalPages: number;
    insertMethod: string;
    onMethod: (m: string) => void;
    insertPageRange: string;
    onPageRange: (v: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

const InsertModal: React.FC<InsertModalProps> = ({
                                                     show, insertTotalPages, insertMethod, onMethod,
                                                     insertPageRange, onPageRange, onCancel, onConfirm
                                                 }) => !show ? null : (
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
            <div className="p-2 pl-6 w-full">
                <div className="flex justify-between items-center">
                    <h2 className="text-[var(--neutral-light-for-white-bg-neutral-1200, #192839)] font-[Noto_Sans] text-lg font-bold leading-[26px]">Add PDF Pages</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 p-1.5">
                        <img src={CloseIcon} alt="Close" className="h-5 w-5" />
                    </button>
                </div>
            </div>
            {/* Body */}
            <div
                style={{
                    display: 'flex',
                    padding: '16px 24px 0 24px',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '17px',
                    alignSelf: 'stretch',
                }}
            >
                <p
                    style={{
                        alignSelf: 'stretch',
                        color: 'var(--neutral-light-for-white-bg-neutral-1200, #192839)',
                        fontFamily: '"Noto Sans"',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: '20px',
                    }}
                >
                    You selected a PDF with {insertTotalPages} pages. How would you like to insert it?
                </p>
                <RadioGroup value={insertMethod} onValueChange={onMethod} className="grid gap-[17px]">
                    <div className="flex items-center gap-1">
                        
                        <div className="p-[9px]">
                            <RadioGroupItem value="all" id="all" />
                        </div>
                        <Label htmlFor="all">
                            <p
                                style={{
                                    color: 'var(--neutral-light-for-white-bg-neutral-1200, #192839)',
                                    fontFamily: '"Noto Sans"',
                                    fontSize: '14px',
                                    fontStyle: 'normal',
                                    fontWeight: 500,
                                    lineHeight: '20px',
                                }}
                            >
                                Add all {insertTotalPages} pages
                            </p>
                            <p
                                style={{
                                    color: 'var(--neutral-light-for-white-bg-neutral-900, #40566D)',
                                    fontFamily: '"Noto Sans"',
                                    fontSize: '13px',
                                    fontStyle: 'normal',
                                    fontWeight: 400,
                                    lineHeight: '18px',
                                }}
                            >
                                Add the entire PDF between Page 2 and Page 3.
                            </p>
                        </Label>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="p-[9px]">
                            <RadioGroupItem value="range" id="range" />
                        </div>
                        <Label htmlFor="range">
                            <p
                                style={{
                                    color: 'var(--neutral-light-for-white-bg-neutral-1200, #192839)',
                                    fontFamily: '"Noto Sans"',
                                    fontSize: '14px',
                                    fontStyle: 'normal',
                                    fontWeight: 500,
                                    lineHeight: '20px',
                                }}
                            >
                                Choose specific pages
                            </p>
                            <p
                                style={{
                                    color: 'var(--neutral-light-for-white-bg-neutral-900, #40566D)',
                                    fontFamily: '"Noto Sans"',
                                    fontSize: '13px',
                                    fontStyle: 'normal',
                                    fontWeight: 400,
                                    lineHeight: '18px',
                                }}
                            >
                                Pick which pages to insert from the selected PDF.
                            </p>
                        </Label>
                    </div>
                </RadioGroup>
                {insertMethod === "range" && (
                    <input
                        type="text"
                        placeholder="e.g. 1-3, 5"
                        value={insertPageRange}
                        onChange={e => onPageRange(e.target.value)}
                        className="w-[148px] ml-[48px] border rounded px-3 py-2.5"
                    />
                )}
            </div>
            {/* Footer */}
            <div className="flex justify-end gap-4 p-6">
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
                    onClick={onConfirm}
                    disabled={insertMethod === "range" && !insertPageRange.trim()}
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
                    Add Pages
                </Button>
            </div>
        </div>
    </div>
);
export default InsertModal;
