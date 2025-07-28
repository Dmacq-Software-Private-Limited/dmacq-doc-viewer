import type { Document } from "../types"; // Assuming you have a types file

export type ViewerType =
    | 'PDF'
    | 'TEXT'
    | 'IMAGE'
    | 'MEDIA'
    | 'MODEL_3D'
    | 'COMIC'
    | 'DB'
    | 'FB2'
    | 'UNSUPPORTED_EBOOK'
    | 'UNSUPPORTED';

export const getViewerType = (document: Document): ViewerType => {
    if (document.is_plain_text) {
        return 'TEXT';
    }

    const fileType = document.fileType.toLowerCase();
    const fileName = document.name.toLowerCase();
    const ext = fileName.split('.').pop() || '';

    if (fileType.startsWith("audio") || fileType.startsWith("video")) {
        return 'MEDIA';
    }

    if (['glb', 'gltf', 'obj', 'stl', '3ds'].includes(ext)) {
        return 'MODEL_3D';
    }

    if (fileType.startsWith('image/') || ext === 'picon') {
        return 'IMAGE';
    }

    if (fileName.endsWith(".cbz") || fileName.endsWith(".cbr")) {
        return 'COMIC';
    }

    if (fileName.endsWith(".fb2")) {
        return 'FB2';
    }

    if ([".sqlite", ".db", ".mdb", ".accdb"].some(e => fileName.endsWith(e))) {
        return 'DB';
    }

    if ([".azw", ".azw3", ".lit", ".mht"].some(e => fileName.endsWith(e))) {
        return 'UNSUPPORTED_EBOOK';
    }

    // Default to PDF for common document types that get converted
    if (fileType === 'application/pdf' || ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
        return 'PDF';
    }

    // Fallback for anything else
    return 'UNSUPPORTED';
};