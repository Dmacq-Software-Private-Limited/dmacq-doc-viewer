import React, { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import contentCopy from "../../assets/icons/content_copy.svg";
import rotate2 from "../../assets/icons/rotate2.svg";
import deleteManagePdf from "../../assets/icons/delete_managepdf.svg";
import dragIndicator from "../../assets/icons/drag_indicator.svg";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface PageCardProps {
    page: any;                // Your PageCardData
    onDuplicate: (uid: string) => void;
    onRotate: (uid: string, angle: number) => void;
    onDelete: (uid: string) => void;
    onToggleSelect: (uid: string) => void;
    documentId: string;
    apiService: any;
}

const PageCard: React.FC<PageCardProps> = ({
    page, onDuplicate, onRotate, onDelete, onToggleSelect, documentId, apiService
}) => {
    const [hovered, setHovered] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: page.uid });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1000 : 1,
        cursor: "grab",
        width: 138,
        minHeight: 220,
        background: page.selected || hovered ? 'var(--neutral-light-for-white-bg-neutral-100, #F1F5FA)' : '#FFFFFF',
        borderRadius: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        margin: "8px"
    } as React.CSSProperties;

    const thumbUrl =
        page.inserted && page.insertDocId
            ? apiService.getDocumentPageUrl(page.insertDocId, page.sourceIndex + 1)
            : apiService.getDocumentPageUrl(documentId, page.sourceIndex + 1);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            tabIndex={0}
            aria-selected={page.selected}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{
                display: 'flex',
                padding: '0 12px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flex: "1 1 auto"
            }}>
                <div
                    className="flex justify-between items-center z-10 transition-opacity"
                    style={{
                        opacity: hovered || page.selected ? 1 : 0,
                        pointerEvents: hovered || page.selected ? "all" : "none",
                        height: '32px',
                        width: '114px',
                    }}
                >
                    <div className="p-1 mt-1" style={{ opacity: hovered || page.selected ? 1 : 0 }}>
                        <Checkbox
                            checked={page.selected}
                            onCheckedChange={() => onToggleSelect(page.uid)}
                        />
                    </div>
                    <div className="flex gap-1" style={{ opacity: hovered ? 1 : 0 }}>
                        <button onClick={() => onDuplicate(page.uid)} className="p-1">
                            <img src={contentCopy} alt="Duplicate" className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRotate(page.uid, 90)} className="p-1">
                            <img src={rotate2} alt="Rotate" className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(page.uid)} className="p-1">
                            <img src={deleteManagePdf} alt="Delete" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div style={{
                    width: 114,
                    height: 160,
                    flexShrink: 0,
                    borderRadius: 2,
                    background: hovered ? 'var(--neutral-light-for-white-bg-neutral-100, #F1F5FA)' : '#FFFFFF',
                }}>
                    <img
                        src={thumbUrl}
                        onError={(e) => (e.currentTarget.src = "/assets/pdf_icon.svg")}
                        alt={`Page ${page.displayIndex} thumbnail`}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transition: "transform 0.15s",
                            transform: `rotate(${page.rotation}deg)`,
                            backgroundColor: "#F1F5FA",
                            padding: "1px"
                        }}
                        draggable={false}
                    />
                </div>
                <div style={{
                    display: "flex", justifyContent: "center", alignItems: "center", width: 114, height: 24, userSelect: "none",
                }}>
                    {hovered ? (
                        <img src={dragIndicator} alt="drag handle" style={{ width: 16, height: 16 }} />
                    ) : (
                        <div className="text-xs py-1 text-center font-medium tracking-tight">
                            {page.displayIndex}
                        </div>
                    )}
                </div>
            </div>
            {page.isDeleted && (
                <div className="absolute inset-0 bg-red-100/60 backdrop-blur flex items-center justify-center text-red-500 text-xl font-bold">
                    Deleted
                </div>
            )}
        </div>
    );
};

export default PageCard;
