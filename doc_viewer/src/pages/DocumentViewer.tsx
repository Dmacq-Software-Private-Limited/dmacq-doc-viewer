import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import DocumentHeader from "@/components/document-viewer/DocumentHeader";
import DocumentViewer from "@/components/document-viewer/DocumentViewer";
import PageNavigation from "@/components/document-viewer/PageNavigation";
import MetadataPanel from "@/components/document-viewer/MetadataPanel";
import DetailsPanel from "@/components/document-viewer/DetailsPanel";
import AuditTrailPanel from "@/components/document-viewer/AuditTrailPanel";
import CommentsPanel from "@/components/document-viewer/CommentsPanel";
import FontViewer from "@/components/document-viewer/FontViewer";
import metadataIcon from "../assets/icons/Icon=Metadata.svg";
import commentsIcon from "../assets/icons/Icon=Comment.svg";
import auditIcon from "../assets/icons/Icon=Audit Log.svg";
import detailsIcon from "../assets/icons/Icon=Details.svg";
import PanelLeft from "../assets/icons/sidebar.svg";
import "../App.css";
import { cn } from "@/lib/utils";
import { apiService, DocumentDetails } from "../services/apiService";


export interface DocumentMetadata {
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
  [key: string]: unknown;
}

type PanelType = "metadata" | "details" | "audit" | "comments";

const FONT_MIME_TYPES = [
  'font/otf',
  'font/ttf',
  'font/woff',
  'font/woff2',
  'application/vnd.ms-fontobject',
];

const DocumentViewerPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(10);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>("metadata");
  const [extractedMetadata, setExtractedMetadata] = useState(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Backend integration states
  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback document data (keeping original structure)
  const fallbackDocument = {
    id: documentId,
    name: "Financial_Report_Q4_2024.pdf",
    version: "1.0",
    size: "2.45 MB",
    uploadedBy: "John Doe",
    uploadedAt: "2024-01-15T10:30:00Z",
    fileType: "pdf",
    location: "Reports\\Financial\\Q4_2024",
    createdBy: "Jane Smith",
    lastModified: "2024-01-15T15:45:00Z",
    masterConnected: "Employee Master, Invoice_App",
    docTypeConnected: "Pan Card, Aadhar Card, Voter Id",
    url: "",
    convertedUrl: "",
    is_plain_text: false, // Default to false for fallback
  };

  // Listen for fullscreen changes
  useEffect(() => { 
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);  
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);

  // Backend data fetching effect

  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;

      try {
        setLoading(true);
        const docData = await apiService.getDocument(documentId);
        setDocumentDetails(docData);
        setTotalPages(docData.totalPages);


        // Fetch metadata
        const metadata = await apiService.getDocumentMetadata(documentId);
        setExtractedMetadata(metadata);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load document",
        );
        // On error, use fallback data to maintain UI functionality
        setDocumentDetails(null);

      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Prepare document data for components (backend data with fallback)
  const documentData = documentDetails
    ? {
        id: documentDetails.id,
        name: documentDetails.name,
        version: "1.0",
        size: `${(documentDetails.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedBy: "User",
        uploadedAt: documentDetails.createdAt,
        fileType: documentDetails.fileType,
        location: "Uploads",
        createdBy: "User",
        lastModified: documentDetails.updatedAt,
        masterConnected: "Employee Master, Invoice_App",
        docTypeConnected: "Pan Card, Aadhar Card, Voter Id",
        url: apiService.getDocumentPreviewUrl(documentDetails.id),
        convertedUrl: apiService.getDocumentPreviewUrl(documentDetails.id),
        is_plain_text: documentDetails.is_plain_text,
      }
    : fallbackDocument;

  const handleClose = () => {
    navigate("/");
  };

  const handleMetadataExtracted = (metadata: DocumentMetadata) => {
    console.log("Metadata extracted:", metadata);
    setExtractedMetadata(metadata);
  };


  const handlePanelTabClick = (tabId: PanelType) => {
    if (activePanel === tabId && rightSidebarOpen) {
      setRightSidebarOpen(false);
    } else {
      setActivePanel(tabId);
      setRightSidebarOpen(true);
    }
  };

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(500, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(25, prev - 25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(100);
  }, []);

  // Rotation handler
  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Fullscreen handler
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
        // Fallback: use custom fullscreen
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error attempting to exit fullscreen:", err);
        // Fallback: use custom fullscreen
        setIsFullscreen(false);
      });
    }
  }, []);

  // Navigation handlers
  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          handlePreviousPage();
          break;
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          handleNextPage();
          break;
        case "F11":
          e.preventDefault();
          handleFullscreen();
          break;
        case "=":
        case "+":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case "r":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRotate();
          }
          break;
        case "Escape":
          if (isFullscreen) {
            e.preventDefault();
            handleFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, zoomLevel, isFullscreen, handlePreviousPage, handleNextPage, handleZoomIn, handleZoomOut, handleRotate, handleFullscreen]);

  const panelTabs = [
    { id: "metadata", label: "Metadata", icon: metadataIcon },
    { id: "details", label: "Details", icon: detailsIcon },
    { id: "audit", label: "Audit Trail", icon: auditIcon },
    { id: "comments", label: "Comments", icon: commentsIcon },
  ];


  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }


  // Error state (but still show UI with fallback data)
  if (error && !documentDetails) {
    console.warn("Using fallback document data due to API error:", error);

  }

  console.log("Final check before render. Total Pages:", totalPages);
  
  const isFont = FONT_MIME_TYPES.includes(documentData.fileType) || documentData.name.match(/\.(otf|ttf|woff|woff2|eot)$/);

  return (
    <div
      className={cn(
        "flex flex-col font-nato-sans overflow-hidden text-left",
        isFullscreen
          ? "fixed inset-0 z-50 bg-black"
          : "h-screen w-screen bg-gray-50",
      )}
    >
      {!isFullscreen && (
        <DocumentHeader doc={documentData} onClose={handleClose} />
      )}
      <div className="flex flex-1 overflow-hidden relative">


      {!isFullscreen && (
    <div className={`bg-white flex-shrink-0 hidden md:flex flex-col relative transition-all duration-300 ${leftSidebarOpen ? 'w-120' : 'w-0'}`} style={{ borderRight: '1px solid rgba(108, 132, 157, 0.18)', padding: leftSidebarOpen ? '8px 12px 12px 12px' : '0', alignItems: 'flex-start', gap: '8px', alignSelf: 'stretch', height: '100%' }}>
      <div className="flex flex-col items-center justify-start h-full overflow-y-auto no-scrollbar relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', width: '100%' }}>
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="flex items-center justify-between w-full mt-2 px-3">
          {/* Page Number Display */}
          <div className="text-[10px] leading-[10px] font-normal not-italic font-['Noto_Sans'] text-black [font-feature-settings:'liga'_off,'clig'_off]">
            {currentPage} / {totalPages}
          </div>
          {/* Sidebar Toggle Button */}
          <button
            className="z-10 bg-transparent flex items-center justify-center w-[24px] h-[24px] p-1 gap-2"
            title="Hide sidebar"
            onClick={() => setLeftSidebarOpen(false)}
          >
            <img
              src={PanelLeft}
              alt="Sidebar Icon"
              className="w-4 h-4" // 16x16px
            />
          </button>
        </div>

        {/* Page Navigation */}
        <PageNavigation
          documentId={documentData.id}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )}




        {!isFullscreen && !leftSidebarOpen && (
          <button
            className="absolute left-0 top-2 ml-2 z-20 bg-white hidden md:block rounded"
            style={{ borderRadius: 4 }}
            title="Show sidebar"
            onClick={() => setLeftSidebarOpen(true)}
          >
            <img src={PanelLeft} alt="Sidebar Icon" className="w-6 h-6 m-1.5" />
          </button>
        )}

        <div
          className={cn(
            "flex-1 overflow-hidden relative h-full w-full",
            isFullscreen ? "bg-black" : "bg-[#E3EAF3]",
            isFullscreen ? "justify-center h-[100]" : ""
          )}
          style={{ height: '100%' }}
        >
          {/* Document Preview with zoom and rotation */}
          <div className="flex flex-col items-center justify-center h-full w-full" style={{ padding: '33px 20px', background: '#E3EAF3' }}>
            <div
              className="relative"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: "center",
                transition: "transform 0.2s ease",
                maxWidth: "100%",
                maxHeight: "100%",
                margin: "0 auto", // Centers the preview
                
              }}
            >
              {isFont ? (
                <FontViewer document={documentDetails!} />
              ) : (
                <DocumentViewer
                  document={{
                    ...documentData,
                    url: apiService.getDocumentPreviewUrl(documentData.id),
                    convertedUrl: apiService.getDocumentPreviewUrl(documentData.id),
                  }}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  zoomLevel={zoomLevel / 100}
                  rotation={rotation}
                  onTotalPagesChange={setTotalPages}
                  onMetadataExtracted={handleMetadataExtracted}
                  isFullscreen={isFullscreen}
                />
              )}
            </div>
          </div>

          {/* Bottom Navigation Toolbar */}
          <div
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex p-1.5 items-center gap-1 rounded z-50"
            style={{ backgroundColor: "#0C1927" }}
          >
            <div className="flex w-42 items-center gap-1">
              {/* Page Navigation */}
              <div
                className="flex h-8 px-3 pr-1 items-center gap-2 rounded"
                style={{ backgroundColor: "#192839" }}
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: "rgba(248,250,252,1)" }}
                >
                  {currentPage}
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: "rgba(108,132,157,1)" }}
                >
                  /
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "rgba(108,132,157,1)" }}
                >
                  {totalPages}
                </span>
                <div className="flex w-4 flex-col justify-center items-center gap-0.5">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="flex p-1 flex-col justify-center items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 rounded transition-colors"
                  >
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                      <path
                        d="M4.33031 5.68098L7.21591 2.67318C7.65042 2.22027 8.35232 2.22027 8.78684 2.67318L11.6724 5.68098C12.3743 6.41261 11.873 7.66683 10.8814 7.66683H5.11021C4.11863 7.66683 3.62841 6.41261 4.33031 5.68098Z"
                        fill="#768EA7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex flex-col justify-center items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 rounded transition-colors"
                  >
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                      <path
                        d="M4.33031 4.31902L7.21591 7.32682C7.65042 7.77973 8.35232 7.77973 8.78684 7.32682L11.6724 4.31902C12.3743 3.58739 11.873 2.33317 10.8814 2.33317H5.11021C4.11863 2.33317 3.62841 3.58739 4.33031 4.31902Z"
                        fill="#768EA7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div
                className="flex p-1 items-center gap-1 rounded"
                style={{ backgroundColor: "#192839" }}
              >
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 25}
                  className="flex p-1 items-center gap-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11.9999 8.66683H3.99992C3.63325 8.66683 3.33325 8.36683 3.33325 8.00016C3.33325 7.6335 3.63325 7.3335 3.99992 7.3335H11.9999C12.3666 7.3335 12.6666 7.6335 12.6666 8.00016C12.6666 8.36683 12.3666 8.66683 11.9999 8.66683Z"
                      fill="#CBD5E2"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleZoomReset}
                  className="text-xs font-bold text-white px-2 hover:bg-gray-600 rounded transition-colors"
                >
                  {zoomLevel}%
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 500}
                  className="flex p-1 items-center gap-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11.9999 8.66683H8.66659V12.0002C8.66659 12.3668 8.36659 12.6668 7.99992 12.6668C7.63325 12.6668 7.33325 12.3668 7.33325 12.0002V8.66683H3.99992C3.63325 8.66683 3.33325 8.36683 3.33325 8.00016C3.33325 7.6335 3.63325 7.3335 3.99992 7.3335H7.33325V4.00016C7.33325 3.6335 7.63325 3.3335 7.99992 3.3335C8.36659 3.3335 8.66659 3.6335 8.66659 4.00016V7.3335H11.9999C12.3666 7.3335 12.6666 7.6335 12.6666 8.00016C12.6666 8.36683 12.3666 8.66683 11.9999 8.66683Z"
                      fill="#CBD5E2"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleRotate}
              className="flex p-1.5 items-center gap-2 rounded hover:bg-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M14.7015 5.2928C13.3431 3.93447 11.4181 3.15113 9.30147 3.3678C6.24314 3.67613 3.72647 6.15947 3.38481 9.2178C2.92647 13.2595 6.05147 16.6678 9.99314 16.6678C12.6515 16.6678 14.9348 15.1095 16.0015 12.8678C16.2681 12.3095 15.8681 11.6678 15.2515 11.6678C14.9431 11.6678 14.6515 11.8345 14.5181 12.1095C13.5765 14.1345 11.3181 15.4178 8.85147 14.8678C7.00147 14.4595 5.50981 12.9511 5.11814 11.1011C4.41814 7.8678 6.87647 5.00113 9.99314 5.00113C11.3765 5.00113 12.6098 5.57613 13.5098 6.48447L12.2515 7.7428C11.7265 8.2678 12.0931 9.1678 12.8348 9.1678H15.8265C16.2848 9.1678 16.6598 8.7928 16.6598 8.33447V5.3428C16.6598 4.60113 15.7598 4.22613 15.2348 4.75113L14.7015 5.2928Z"
                  fill="#CBD5E2"
                />
              </svg>
            </button>
            <button
              onClick={handleFullscreen}
              className="flex p-1.5 items-center gap-2 rounded hover:bg-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13.2083 3.20833L14.4167 4.41667L12.6 6.21667C12.275 6.54167 12.275 7.075 12.6 7.4C12.925 7.725 13.4583 7.725 13.7833 7.4L15.5833 5.58333L16.7917 6.79167C17.05 7.05 17.5 6.86667 17.5 6.49167V2.91667C17.5 2.68333 17.3167 2.5 17.0833 2.5H13.5083C13.1333 2.5 12.95 2.95 13.2083 3.20833ZM3.20833 6.79167L4.41667 5.58333L6.21667 7.4C6.54167 7.725 7.075 7.725 7.4 7.4C7.725 7.075 7.725 6.54167 7.4 6.21667L5.58333 4.41667L6.79167 3.20833C7.05 2.95 6.86667 2.5 6.49167 2.5H2.91667C2.68333 2.5 2.5 2.68333 2.5 2.91667V6.49167C2.5 6.86667 2.95 7.05 3.20833 6.79167ZM6.79167 16.7917L5.58333 15.5833L7.4 13.7833C7.725 13.4583 7.725 12.925 7.4 12.6C7.075 12.275 6.54167 12.275 6.21667 12.6L4.41667 14.4167L3.20833 13.2083C2.95 12.95 2.5 13.1333 2.5 13.5083V17.0833C2.5 17.3167 2.68333 17.5 2.91667 17.5H6.49167C6.86667 17.5 7.05 17.05 6.79167 16.7917ZM16.7917 13.2083L15.5833 14.4167L13.7833 12.6C13.4583 12.275 12.925 12.275 12.6 12.6C12.275 12.925 12.275 13.4583 12.6 13.7833L14.4167 15.5833L13.2083 16.7917C12.95 17.05 13.1333 17.5 13.5083 17.5H17.0833C17.3167 17.5 17.5 17.3167 17.5 17.0833V13.5083C17.5 13.1333 17.05 12.95 16.7917 13.2083Z"
                  fill="#CBD5E2"
                />
              </svg>
            </button>
          </div>
        </div>

        {!isFullscreen && (
          <div className="hidden lg:flex h-full">
            {rightSidebarOpen && (
              <div

                className="bg-white border-r border-gray-200 overflow-y-auto w-[320px] no-scrollbar"
                style={{
                  display: "flex",
                  padding: "20px",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "20px",
                  flex: "1 0 0",
                  alignSelf: "stretch",
                }}
              >

                {activePanel === "metadata" && (
                  <MetadataPanel
                    documentId={documentId}
                    extractedMetadata={extractedMetadata}
                  />
                )}
                {activePanel === "details" && (
                  <DetailsPanel document={documentData} />
                )}
                {activePanel === "audit" && (
                  <AuditTrailPanel documentId={documentId} />
                )}
                {activePanel === "comments" && (
                  <CommentsPanel documentId={documentId} />
                )}
              </div>
            )}
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
                height: "704px",
              }}
            >
              {panelTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handlePanelTabClick(tab.id as PanelType)}
                  className={cn(
                    "w-12 h-12 gap-8 flex items-center justify-center",
                    activePanel === tab.id && rightSidebarOpen
                      ? "bg-blue-50 border-l-4 border-[#2950da]"
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
                          activePanel === tab.id && rightSidebarOpen
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
                          activePanel === tab.id && rightSidebarOpen
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
                          activePanel === tab.id && rightSidebarOpen
                            ? "#2950DA"
                            : "#40566D"
                        }
                      />
                      <path
                        d="M10 14.9908C10 14.694 10.385 14.5775 10.5496 14.8244L11.7504 16.6256C11.8691 16.8037 12.1309 16.8037 12.2496 16.6256L13.4504 14.8244C13.615 14.5775 14 14.694 14 14.9908V17.7C14 17.8657 14.1343 18 14.3 18H15.7C15.8657 18 16 17.8657 16 17.7V11.3C16 11.1343 15.8657 11 15.7 11H14.1606C14.0602 11 13.9666 11.0501 13.9109 11.1336L12.2496 13.6256C12.1309 13.8037 11.8691 13.8037 11.7504 13.6256L10.0891 11.1336C10.0334 11.0501 9.93975 11 9.83944 11H8.3C8.13431 11 8 11.1343 8 11.3V17.7C8 17.8657 8.13431 18 8.3 18H9.7C9.86569 18 10 17.8657 10 17.7V14.9908Z"
                        fill={
                          activePanel === tab.id && rightSidebarOpen
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
                          activePanel === tab.id && rightSidebarOpen
                            ? "#2950DA"
                            : "#40566D"
                        }
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewerPage;
