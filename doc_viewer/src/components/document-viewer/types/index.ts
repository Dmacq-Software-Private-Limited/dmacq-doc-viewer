/**
 * Represents the basic structure of a document object used throughout the viewer.
 */
export interface Document {
    id?: string;
    name: string;
    fileType: string;
    url:string;
    convertedUrl?: string;
    is_plain_text?: boolean;
}

/**
 * Represents the metadata extracted from a document.
 */
export interface DocumentMetadata {
    title?: string;
    author?: string;
    creationDate?: string;
    modificationDate?: string;
    keywords?: string[];
    [key: string]: any; // Allows for other custom metadata fields
}