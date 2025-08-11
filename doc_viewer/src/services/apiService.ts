//const API_BASE_URL = 'http://localhost:8001/api'

const API_BASE_URL = 'http://13.203.247.119:8001/api';

export interface OrganizePageOp {
  sourceDocumentId: string;
  sourcePageIndex: number;
  rotation?: number;
}

export interface OrganizePayload {
  recipe: OrganizePageOp[];
}


export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  totalPages: number;
  previewUrl: string;
  downloadUrl: string;
}

export interface DocumentDetails {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  size: number;
  totalPages: number;
  createdAt: string;
  updatedAt: string;
  previewUrl: string;
  downloadUrl: string;
  is_plain_text?: boolean;
  is_code_file?: boolean; 
  metadata: {
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
    language?: string;
    lines_of_code?: number;
    character_count?: number;
    additional_info?: Record<string, any>;
  };
}

export interface Annotation {
  id: string;
  document_id: string;
  page_number: number;
  annotation_type: string;
  content?: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

class ApiService {

  async organizePdf(documentId: string, recipe: OrganizePageOp[]): Promise<UploadedDocument> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/organize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to save PDF changes!");
    }
    return await response.json();
  }

  async uploadDocument(file: File): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    console.log(response);

    if (!response.ok) {
      const text = await response.text();
      console.error('Server response:', text);
      if (text.includes('404')) {
        throw new Error('Endpoint not found. Check if /documents/upload is implemented on the server.');
      }
      throw new Error(text || 'Upload failed');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
    throw new Error('Server returned non-JSON response');
  }

  async getDocument(documentId: string): Promise<DocumentDetails> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);

    if (!response.ok) {
      throw new Error('Document not found');
    }

    return response.json();
  }

  async getDocumentMetadata(documentId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/metadata`);

    if (!response.ok) {
      throw new Error('Metadata not found');
    }

    return response.json();
  }

  getDocumentPreviewUrl(documentId: string) {
    return `${API_BASE_URL}/documents/${documentId}/preview`; 
  }

  getDocumentUrl(documentId: string) {
    return `${API_BASE_URL}/documents/${documentId}/preview`;
  }

  getDocumentPageUrl(documentId: string, pageNumber: number): string {
    return `${API_BASE_URL}/documents/${documentId}/page/${pageNumber}`;
  }

  getDocumentDownloadUrl(documentId: string): string {
    return `${API_BASE_URL}/documents/${documentId}/download`;
  }

  async deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
  }

  getThumbnailUrl(documentId: string): string {
    return `${API_BASE_URL}/thumbnails/${documentId}.png`;
  }

  async createAnnotation(documentId: string, annotationData: Partial<Annotation>): Promise<Annotation> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/annotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(annotationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create annotation');
    }

    return response.json();
  }

  async getAnnotations(documentId: string, page?: number): Promise<Annotation[]> {
    const url = page 
      ? `${API_BASE_URL}/documents/${documentId}/annotations?page=${page}`
      : `${API_BASE_URL}/documents/${documentId}/annotations`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get annotations');
    }

    return response.json();
  }

  async updateAnnotation(documentId: string, annotationId: string, annotationData: Partial<Annotation>): Promise<Annotation> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/annotations/${annotationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(annotationData),
    });

    if (!response.ok) {
      throw new Error('Failed to update annotation');
    }

    return response.json();
  }

  async deleteAnnotation(documentId: string, annotationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/annotations/${annotationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete annotation');
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
  async getCodeText(documentId: string): Promise<{ code: string }> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/code`);
    if (!response.ok) throw new Error("Failed to fetch code text");
    return response.json();
  }

  async getArchiveFileList(documentId: string): Promise<{ file_list: string[] }> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/list_files`);
    if (!response.ok) {
      throw new Error("Failed to fetch archive file list");
    }
    return response.json();
  }
}

export const apiService = new ApiService();
