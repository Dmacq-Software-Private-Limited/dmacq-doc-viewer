import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Button } from '../components/ui/button';
import PageCard from '../components/manage-pdf/PageCard';
import InsertButton from '../components/manage-pdf/InsertButton';
import BulkToolbar from '../components/manage-pdf/BulkToolbar';
import InsertModal from '../components/manage-pdf/InsertModal';
import DiscardModal from '../components/manage-pdf/DiscardModal';
import DeleteAllPagesModal from '../components/manage-pdf/DeleteAllPagesModal';
import SuccessToast from '../components/manage-pdf/SuccessToast';
import metadataIcon from "../assets/icons/Icon=Metadata.svg";
import detailsIcon from "../assets/icons/Icon=Details.svg";
import auditIcon from "../assets/icons/Icon=Audit Log.svg";
import commentsIcon from "../assets/icons/Icon=Comment.svg";
import annotationIcon from "@/assets/icons/AnnotationIcon.svg";
import managePdfIcon from "@/assets/icons/ManagePdf.svg";
import managePdfOnClickIcon from "@/assets/icons/ManagePdfonclick.svg";
import undoIcon from "@/assets/icons/undo.svg";
import redoIcon from "@/assets/icons/redo.svg";
import undoNothingIcon from "@/assets/icons/undo_nothing.svg";
import redoNothingIcon from "@/assets/icons/redo_nothing.svg";
import { apiService } from '../services/apiService';
import { cn } from "@/lib/utils";
import { Checkbox } from '@/components/ui/checkbox';

type PageUID = string;
type PageCardData = {
    uid: PageUID;
    sourceIndex: number;
    displayIndex: number;
    rotation: number;
    isDeleted: boolean;
    inserted?: boolean;
    selected: boolean;
    insertDocId?: string;
};
type HistorySnapshot = { pages: PageCardData[] };
type PanelType = "metadata" | "details" | "audit" | "comments" | "annotation" | "manage";

const ManagePdf: React.FC = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const [documentDetails, setDocumentDetails] = useState<any>(null);
    const [pages, setPages] = useState<PageCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [undoStack, setUndoStack] = useState<HistorySnapshot[]>([]);
    const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [insertPdfFile, setInsertPdfFile] = useState<File | null>(null);
    const [insertIdx, setInsertIdx] = useState<number>(0);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [insertMethod, setInsertMethod] = useState("all");
    const [insertPageRange, setInsertPageRange] = useState("");
    const [insertTotalPages, setInsertTotalPages] = useState(0);
    const [insertUploadDocId, setInsertUploadDocId] = useState("");
    const [activePanel, setActivePanel] = useState<PanelType>("manage");
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [newDocumentId, setNewDocumentId] = useState<string | null>(null);
    const [showDeleteAllPagesModal, setShowDeleteAllPagesModal] = useState(false);

    useEffect(() => {
        async function fetchDetails() {
            if (!documentId) return;
            try {
                const doc = await apiService.getDocument(documentId);
                setDocumentDetails(doc);
                let pg: PageCardData[] = [];
                for (let i = 0; i < doc.totalPages; i++) {
                    pg.push({
                        uid: `${documentId}-${i + 1}-${Date.now() + Math.random()}`,
                        sourceIndex: i,
                        displayIndex: i + 1,
                        rotation: 0,
                        isDeleted: false,
                        inserted: false,
                        selected: false,
                    });
                }
                setPages(pg);
                setUndoStack([]); setRedoStack([]); setDirty(false);
            } catch (e) {
                alert("Failed to load PDF: " + (e as Error).message);
            } finally { setLoading(false); }
        }
        fetchDetails();
    }, [documentId]);

    // Undo/Redo logic
    const saveHistory = () => {
        setUndoStack(u => [...u, { pages: JSON.parse(JSON.stringify(pages)) }]);
        setRedoStack([]);
        setDirty(true);
    };
    const undo = () => {
        if (!undoStack.length) return;
        setRedoStack(r => [...r, { pages: JSON.parse(JSON.stringify(pages)) }]);
        setPages(JSON.parse(JSON.stringify(undoStack[undoStack.length - 1].pages)));
        setUndoStack(u => u.slice(0, -1));
        setDirty(true);
    };
    const redo = () => {
        if (!redoStack.length) return;
        setUndoStack(u => [...u, { pages: JSON.parse(JSON.stringify(pages)) }]);
        setPages(JSON.parse(JSON.stringify(redoStack[redoStack.length - 1].pages)));
        setRedoStack(r => r.slice(0, -1));
        setDirty(true);
    };

    // Core page actions
    const rotatePage = (uid: PageUID, angle: number) => { saveHistory(); setPages(list => list.map(p => p.uid === uid ? { ...p, rotation: (p.rotation + angle + 360) % 360 } : p)); };
    const duplicatePage = (uid: PageUID) => {
        const idx = pages.findIndex(p => p.uid === uid);
        if (idx === -1) return;
        saveHistory();
        const orig = pages[idx];
        const copy = { ...orig, uid: `${orig.uid}-copy-${Date.now()}`, selected: false };
        const newList = [...pages.slice(0, idx + 1), copy, ...pages.slice(idx + 1)];
        setPages(newList.map((p, i) => ({ ...p, displayIndex: i + 1 })));
    };
    const deletePage = (uid: PageUID) => {
        if (pages.filter(p => !p.isDeleted).length === 1) {
            setShowDeleteAllPagesModal(true);
            return;
        }
        saveHistory();
        setPages(list =>
            list.map(p => p.uid === uid ? { ...p, isDeleted: true } : p)
                .map((p, i) => ({ ...p, displayIndex: i + 1 }))
        );
    };
    const toggleSelectPage = (uid: PageUID) => {
        setPages(list => list.map(p => p.uid === uid ? { ...p, selected: !p.selected } : p));
    };

    // Bulk
    const selectedPages = pages.filter((p) => p.selected && !p.isDeleted);
    const bulkRotate = (angle: number) => { saveHistory(); setPages(list => list.map(p => p.selected ? { ...p, rotation: (p.rotation + angle + 360) % 360 } : p)); };
    const bulkDelete = () => {
        if (pages.filter(p => p.selected && !p.isDeleted).length >= pages.filter(p => !p.isDeleted).length) {
            setShowDeleteAllPagesModal(true);
            return;
        }
        saveHistory();
        setPages(list => list.map(p => p.selected ? { ...p, isDeleted: true, selected: false } : p));
    };
    const bulkDuplicate = () => {
        saveHistory();
        let withCopies: PageCardData[] = [];
        pages.forEach((p, i) => {
            withCopies.push({ ...p });
            if (p.selected && !p.isDeleted) {
                withCopies.push({ ...p, uid: `${p.uid}-copy-${Date.now()}`, selected: false });
            }
        });
        setPages(withCopies.map((p, i) => ({ ...p, displayIndex: i + 1 })));
    };

    // Insert
    const handleInsert = (idx: number) => {
        setInsertPdfFile(null);
        setInsertIdx(idx);
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/pdf";
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0] ?? null;
            if (!file) return;
            setInsertPdfFile(file);
            const response = await apiService.uploadDocument(file);
            if (response.totalPages === 1) {
                const now = Date.now();
                const insertPages: PageCardData[] = [{
                    uid: `insert-${response.id}-1-${now}`,
                    sourceIndex: 0,
                    displayIndex: 0,
                    rotation: 0,
                    isDeleted: false,
                    inserted: true,
                    selected: false,
                    insertDocId: response.id,
                }];
                setPages(old =>
                    [...old.slice(0, idx), ...insertPages, ...old.slice(idx)].map((p, i) => ({
                        ...p,
                        displayIndex: i + 1,
                    }))
                );
                setToastMessage("Page has been added successfully.");
                setShowSuccessToast(true);
            } else {
                setInsertUploadDocId(response.id);
                setInsertTotalPages(response.totalPages || 1);
                setShowInsertModal(true);
                setInsertMethod("all");
                setInsertPageRange("");
            }
        };
        input.click();
    };
    const handleInsertConfirm = async () => {
        if (!insertPdfFile || !insertUploadDocId) return;
        let insertPageNumbers: number[] = [];
        if (insertMethod === "all") {
            insertPageNumbers = Array.from({ length: insertTotalPages }, (_, i) => i + 1);
        } else {
            const parts = insertPageRange.split(",").map(s => s.trim());
            parts.forEach(part => {
                if (/^\d+$/.test(part)) insertPageNumbers.push(Number(part));
                else if (/^(\d+)-(\d+)$/.test(part)) {
                    const [start, end] = part.split("-").map(Number);
                    for (let i = start; i <= end; i++) insertPageNumbers.push(i);
                }
            });
            insertPageNumbers = insertPageNumbers.filter(n => n >= 1 && n <= insertTotalPages);
            if (insertPageNumbers.length === 0) return;
        }
        saveHistory();
        const now = Date.now();
        const insertPages: PageCardData[] = insertPageNumbers.map((p, idx) => ({
            uid: `insert-${insertUploadDocId}-${p}-${now + idx}`,
            sourceIndex: p - 1,
            displayIndex: 0,
            rotation: 0,
            isDeleted: false,
            inserted: true,
            selected: false,
            insertDocId: insertUploadDocId,
        }));
        setPages(old =>
            [...old.slice(0, insertIdx), ...insertPages, ...old.slice(insertIdx)].map((p, i) => ({
                ...p,
                displayIndex: i + 1,
            }))
        );
        setShowInsertModal(false);
        setInsertPdfFile(null);
        setInsertUploadDocId("");
        setInsertTotalPages(0);
        setInsertPageRange("");
        setInsertMethod("all");
    };

    // Drag & Drop
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const onDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            saveHistory();
            const oldIdx = pages.findIndex(p => p.uid === active.id);
            const newIdx = pages.findIndex(p => p.uid === over.id);
            const reordered = arrayMove(pages, oldIdx, newIdx).map((p, i) => ({
                ...p, displayIndex: i + 1,
            }));
            setPages(reordered);
        }
    };

    const handleExit = () => { if (dirty) setShowDiscardModal(true); else navigate(-1); };
    const handleDeleteAllPages = async () => {
        try {
            await apiService.deleteDocument(documentId!);
            navigate('/');
        } catch (e) {
            alert("Error deleting document: " + (e as Error).message);
        }
    };
    const handleSave = async () => {
        const recipe = pages.filter(p => !p.isDeleted).map(p => ({
            sourceDocumentId: p.inserted ? p.insertDocId : documentId,
            sourcePageIndex: p.sourceIndex,
            rotation: p.rotation || 0,
        }));
        try {
            setIsSaving(true);
            const result = await apiService.organizePdf(documentId!, recipe);
            setIsSaving(false);
            setDirty(false);
            setToastMessage("Changes has been saved successfully");
            setShowSuccessToast(true);
            setNewDocumentId(result.id);
        } catch (e) {
            setIsSaving(false);
            alert("Error saving PDF: " + (e as Error).message);
        }
    };

    // Header data
    const documentDataForHeader = documentDetails
        ? {
            id: documentDetails.id,
            name: documentDetails.name,
            version: "1.0",
            size: `${(documentDetails.size / (1024 * 1024)).toFixed(2)} MB`,
            uploadedBy: "User",
            uploadedAt: documentDetails.createdAt,
            fileType: documentDetails.fileType,
            url: apiService.getDocumentPreviewUrl(documentDetails.id),
            is_plain_text: documentDetails.is_plain_text,
        }
        : {
            id: documentId || "",
            name: "",
            fileType: "pdf",
            url: "",
        };

    if (loading) return <div className="p-6 text-center">Loading PDF pages…</div>;

    const undeleted = pages.filter((p) => !p.isDeleted);
    const bulkToolbarActive = selectedPages.length > 0;
    const panelTabs = [
        { id: "metadata", label: "Metadata", icon: metadataIcon },
        { id: "details", label: "Details", icon: detailsIcon },
        { id: "manage", label: "Manage PDF", icon: managePdfIcon, onClickIcon: managePdfOnClickIcon },
        { id: "annotation", label: "Annotation", icon: annotationIcon },
        { id: "audit", label: "Audit Trail", icon: auditIcon },
        { id: "comments", label: "Comments", icon: commentsIcon },
    ];

    const handlePanelTabClick = (tabId: PanelType) => {
        if (tabId === "manage") {
            if (newDocumentId) {
                navigate(`/document/${newDocumentId}`);
            } else {
                navigate(`/document/${documentId}`);
            }
            return;
        }
        if (tabId === "annotation") {
            navigate(`/document/${documentId}`);
        } else {
            navigate(`/document/${documentId}`);
        }
    };

    return (
        <div className="flex flex-col font-nato-sans overflow-hidden text-left h-screen w-screen bg-white">
            <div
                className="flex items-center justify-between px-5 bg-white"
                style={{
                    display: 'flex',
                    height: '48px',
                    padding: '12px 20px',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    borderBottom: '1px solid rgba(108, 132, 157, 0.18)',
                }}
            >
                <h1
                    style={{
                        color: 'var(--neutral-light-for-white-bg-neutral-1200, #192839)',
                        fontFamily: 'Noto Sans',
                        fontSize: '18px',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: 'normal',
                        textTransform: 'capitalize',
                    }}
                >
                    Manage PDF
                </h1>
                <div className="flex items-center gap-2">
                    <div className='gap-0.5'>
                        <button className='p-1' onClick={undo} disabled={undoStack.length === 0}>
                            <img src={undoStack.length > 0 ? undoIcon : undoNothingIcon} alt="Undo" />
                        </button>
                        <button className='p-1' onClick={redo} disabled={redoStack.length === 0}>
                            <img src={redoStack.length > 0 ? redoIcon : redoNothingIcon} alt="Redo" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-0.5">
                        <Checkbox className='p-1.5'
                            id="select-all"
                            checked={selectedPages.length === undeleted.length && undeleted.length > 0}
                            onCheckedChange={(checked) => {
                                setPages(pages.map(p => ({ ...p, selected: !!checked })))
                            }}
                        />
                        <label
                            htmlFor="select-all"
                            style={{
                                color: 'var(--neutral-light-for-white-bg-neutral-900, #40566D)',
                                fontFamily: '"Noto Sans"',
                                fontSize: '14px',
                                fontStyle: 'normal',
                                fontWeight: 500,
                                lineHeight: '20px',
                            }}
                        >
                            Select All
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 relative flex flex-col">
                    {/* Main manage grid */}
                    <div className="flex-1 overflow-y-auto bg-white">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                            <SortableContext
                                items={undeleted.map((p) => p.uid)}
                                strategy={horizontalListSortingStrategy}
                            >
                                <div className="w-full flex flex-wrap gap-2 p-6">
                                    <InsertButton onInsert={() => handleInsert(0)} />
                                    {undeleted.map((p, i) => (
                                        <React.Fragment key={p.uid}>
                                            <PageCard
                                                page={p}
                                                onDuplicate={duplicatePage}
                                                onRotate={rotatePage}
                                                onDelete={deletePage}
                                                onToggleSelect={toggleSelectPage}
                                                documentId={documentId!}
                                                apiService={apiService}
                                            />
                                            <InsertButton onInsert={() => handleInsert(i + 1)} />
                                        </React.Fragment>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                        {bulkToolbarActive && (
                            <BulkToolbar
                                selectedCount={selectedPages.length}
                                onClear={() => setPages(pages.map(p => ({ ...p, selected: false })))}
                                onDuplicate={bulkDuplicate}
                                onRotate={() => bulkRotate(90)}
                                onDelete={bulkDelete}
                            />
                        )}
                    </div>
                </div>
                {/* Panel Tabs + Panels (right sidebar, icons) */}
                <div className="hidden lg:flex h-full">
                    <div
                        className="bg-white border-l border-gray-200"
                        style={{
                            display: "flex",
                            paddingBottom: "8px",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "4px",
                            alignSelf: "stretch",
                            width: "48px",
                        }}
                    >
                        {panelTabs.map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => handlePanelTabClick(tab.id as PanelType)}
                                className={cn(
                                    "w-12 h-12 gap-8 flex items-center justify-center rounded-md",
                                    activePanel === tab.id
                                        ? "bg-[#F5F8FF] border-2 border-[#2950DA]"
                                        : "hover:bg-gray-100",
                                )}
                            >
                                {tab.id === "audit" && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M18.5 17.8V15.5C18.5 15.3667 18.45 15.25 18.35 15.15C18.25 15.05 18.1333 15 18 15C17.8667 15 17.75 15.05 17.65 15.15C17.55 15.25 17.5 15.3667 17.5 15.5V17.8C17.5 17.9333 17.525 18.0583 17.575 18.175C17.625 18.2917 17.7 18.4 17.8 18.5L19.325 20.025C19.425 20.125 19.5417 20.175 19.675 20.175C19.8083 20.175 19.925 20.125 20.025 20.025C20.125 19.925 20.175 19.8083 20.175 19.675C20.175 19.5417 20.125 19.425 20.025 19.325L18.5 17.8ZM5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H19C19.55 3 20.0208 3.19583 20.4125 3.5875C20.8042 3.97917 21 4.45 21 5V10C21 10.2833 20.9042 10.5208 20.7125 10.7125C20.5208 10.9042 20.2833 11 20 11C19.7167 11 19.4792 10.9042 19.2875 10.7125C19.0958 10.5208 19 10.2833 19 10V5H5V19H10C10.2833 19 10.5208 19.0958 10.7125 19.2875C10.9042 19.4792 11 19.7167 11 20C11 20.2833 10.9042 20.5208 10.7125 20.7125C10.5208 20.9042 10.2833 21 10 21H5ZM5 18V19V5V11.075V11V18ZM7 16C7 16.2833 7.09583 16.5208 7.2875 16.7125C7.47917 16.9042 7.71667 17 8 17H10.075C10.3583 17 10.5958 16.9042 10.7875 16.7125C10.9792 16.5208 11.075 16.2833 11.075 16C11.075 15.7167 10.9792 15.4792 10.7875 15.2875C10.5958 15.0958 10.3583 15 10.075 15H8C7.71667 15 7.47917 15.0958 7.2875 15.2875C7.09583 15.4792 7 15.7167 7 16ZM7 12C7 12.2833 7.09583 12.5208 7.2875 12.7125C7.47917 12.9042 7.71667 13 8 13H13C13.2833 13 13.5208 12.9042 13.7125 12.7125C13.9042 12.5208 14 12.2833 14 12C14 11.7167 13.9042 11.4792 13.7125 11.2875C13.5208 11.0958 13.2833 11 13 11H8C7.71667 11 7.47917 11.0958 7.2875 11.2875C7.09583 11.4792 7 11.7167 7 12ZM7 8C7 8.28333 7.09583 8.52083 7.2875 8.7125C7.47917 8.90417 7.71667 9 8 9H16C16.2833 9 16.5208 8.90417 16.7125 8.7125C16.9042 8.52083 17 8.28333 17 8C17 7.71667 16.9042 7.47917 16.7125 7.2875C16.5208 7.09583 16.2833 7 16 7H8C7.71667 7 7.47917 7.09583 7.2875 7.2875C7.09583 7.47917 7 7.71667 7 8ZM18 23C16.6167 23 15.4375 22.5125 14.4625 21.5375C13.4875 20.5625 13 19.3833 13 18C13 16.6167 13.4875 15.4375 14.4625 14.4625C15.4375 13.4875 16.6167 13 18 13C19.3833 13 20.5625 13.4875 21.5375 14.4625C22.5125 15.4375 23 16.6167 23 18C23 19.3833 22.5125 20.5625 21.5375 21.5375C20.5625 22.5125 19.3833 23 18 23Z"
                                            fill={
                                                activePanel === tab.id
                                                    ? "#2950DA"
                                                    : "#40566D"
                                            }
                                        />
                                    </svg>
                                )}
                                {tab.id === "details" && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="16"
                                        viewBox="0 0 20 16"
                                        fill="none"
                                    >
                                        <path
                                            d="M2.25 6.5C1.42 6.5 0.75 7.17 0.75 8C0.75 8.83 1.42 9.5 2.25 9.5C3.08 9.5 3.75 8.83 3.75 8C3.75 7.17 3.08 6.5 2.25 6.5ZM2.25 0.5C1.42 0.5 0.75 1.17 0.75 2C0.75 2.83 1.42 3.5 2.25 3.5C3.08 3.5 3.75 2.83 3.75 2C3.75 1.17 3.08 0.5 2.25 0.5ZM2.25 12.5C1.42 12.5 0.75 13.18 0.75 14C0.75 14.82 1.43 15.5 2.25 15.5C3.07 15.5 3.75 14.82 3.75 14C3.75 13.18 3.08 12.5 2.25 12.5ZM6.25 15H18.25C18.8 15 19.25 14.55 19.25 14C19.25 13.45 18.8 13 18.25 13H6.25C5.7 13 5.25 13.45 5.25 14C5.25 14.55 5.7 15 6.25 15ZM6.25 9H18.25C18.8 9 19.25 8.55 19.25 8C19.25 7.45 18.8 7 18.25 7H6.25C5.7 7 5.25 7.45 5.25 8C5.25 8.55 5.7 9 6.25 9ZM5.25 2C5.25 2.55 5.7 3 6.25 3H18.25C18.8 3 19.25 2.55 19.25 2C19.25 1.45 18.8 1 18.25 1H6.25C5.7 1 5.25 1.45 5.25 2Z"
                                            fill={
                                                activePanel === tab.id
                                                    ? "#2950DA"
                                                    : "#40566D"
                                            }
                                        />
                                    </svg>
                                )}
                                {tab.id === "metadata" && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM6 20V4H13V9H18V20H6Z"
                                            fill={
                                                activePanel === tab.id
                                                    ? "#2950DA"
                                                    : "#40566D"
                                            }
                                        />
                                        <path
                                            d="M10 14.9908C10 14.694 10.385 14.5775 10.5496 14.8244L11.7504 16.6256C11.8691 16.8037 12.1309 16.8037 12.2496 16.6256L13.4504 14.8244C13.615 14.5775 14 14.694 14 14.9908V17.7C14 17.8657 14.1343 18 14.3 18H15.7C15.8657 18 16 17.8657 16 17.7V11.3C16 11.1343 15.8657 11 15.7 11H14.1606C14.0602 11 13.9666 11.0501 13.9109 11.1336L12.2496 13.6256C12.1309 13.8037 11.8691 13.8037 11.7504 13.6256L10.0891 11.1336C10.0334 11.0501 9.93975 11 9.83944 11H8.3C8.13431 11 8 11.1343 8 11.3V17.7C8 17.8657 8.13431 18 8.3 18H9.7C9.86569 18 10 17.8657 10 17.7V14.9908Z"
                                            fill={
                                                activePanel === tab.id
                                                    ? "#2950DA"
                                                    : "#40566D"
                                            }
                                        />
                                    </svg>
                                )}
                                {tab.id === "comments" && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16ZM7 9H9V11H7V9ZM11 9H13V11H11V9ZM15 9H17V11H15V9Z"
                                            fill={
                                                activePanel === tab.id
                                                    ? "#2950DA"
                                                    : "#40566D"
                                            }
                                        />
                                    </svg>
                                )}
                                {tab.id === "annotation" && (
                                    <img
                                        src={tab.icon}
                                        alt={tab.label}
                                        className="w-6 h-6"
                                    />
                                )}
                                {tab.id === "manage" && (
                                    <img
                                        src={activePanel === tab.id ? tab.onClickIcon : tab.icon}
                                        alt={tab.label}
                                        className="w-6 h-6"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {/* Modals */}
            <InsertModal
                show={showInsertModal}
                insertTotalPages={insertTotalPages}
                insertMethod={insertMethod}
                onMethod={setInsertMethod}
                insertPageRange={insertPageRange}
                onPageRange={setInsertPageRange}
                onCancel={() => setShowInsertModal(false)}
                onConfirm={handleInsertConfirm}
            />
            <DiscardModal
                show={showDiscardModal}
                onCancel={() => setShowDiscardModal(false)}
                onDiscard={() => { setShowDiscardModal(false); setDirty(false); navigate(-1); }}
            />
            <DeleteAllPagesModal
                show={showDeleteAllPagesModal}
                onCancel={() => setShowDeleteAllPagesModal(false)}
                onConfirm={handleDeleteAllPages}
            />
            {showSuccessToast && (
                <SuccessToast
                    message={toastMessage}
                    onClose={() => setShowSuccessToast(false)}
                />
            )}
            <div className="flex justify-end items-center px-4 py-3 bg-white border-t border-gray-200 gap-2">
                {dirty && (
                    <Button
                        variant="outline"
                        onClick={handleExit}
                        style={{
                            display: 'flex',
                            height: '32px',
                            padding: '8px 16px',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '4px',
                            border: '1px solid var(--neutral-light-for-white-bg-neutral-a-100, rgba(108, 132, 157, 0.18))',
                        }}
                    >
                        <span style={{
                            color: 'var(--neutral-light-for-white-bg-neutral-1100, #243547)',
                            fontFamily: '"Noto Sans"',
                            fontSize: '14px',
                            fontStyle: 'normal',
                            fontWeight: 500,
                            lineHeight: '26px',
                            textTransform: 'capitalize',
                        }}>
                            Discard
                        </span>
                    </Button>
                )}
                <Button
                    onClick={handleSave}
                    disabled={!dirty || isSaving}
                    style={dirty ? {
                        display: 'flex',
                        height: '32px',
                        padding: '4px 16px',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 'var(--borderRadius_S, 4px)',
                        background: 'var(--dms-primary-primary-600, #2950DA)',
                    } : {
                        display: 'flex',
                        height: '32px',
                        padding: '4px 16px',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 'var(--borderRadius_S, 4px)',
                        background: 'var(--dms-primary-primary-100, #D8E4FD)',
                    }}
                >
                    <span style={dirty ? {
                        color: 'var(--neutral-light-for-white-bg-neutral-000, #FFF)',
                        fontFamily: '"Noto Sans"',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '22px',
                        textTransform: 'capitalize',
                    } : {
                        color: 'var(--dms-primary-primary-300, #75A3FF)',
                        fontFamily: '"Noto Sans"',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '22px',
                        textTransform: 'capitalize',
                    }}>
                        Save Changes
                    </span>
                </Button>
            </div>
        </div>
    );
};
export default ManagePdf;
