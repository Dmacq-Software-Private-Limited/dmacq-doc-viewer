# Document Viewer - Knowledge Transfer Email Content

---

**Subject:** Document Viewer Project - Complete Knowledge Transfer Documentation

---

**Body:**

Namaste,

Aapke Document Viewer project ke liye complete Knowledge Transfer documentation yahan hai. Ye frontend implementation ke baare mein detailed information hai.

## 1. Document Details & Management - Manage PDF Save Functionality

### Problem:
"Manage PDF" mein PDF add karne ke baad file save nahi ho rahi thi.

### Solution & Implementation:

**Location:** `doc_viewer/src/pages/ManagePdf.tsx`

**Save Functionality:**
- User jab pages ko organize karta hai (delete, rotate, reorder, insert), to ye changes locally state mein store hote hain
- "Save Changes" button click karne par `handleSave()` function call hota hai
- Ye function `apiService.organizePdf()` ko call karta hai jo backend API endpoint `/documents/{documentId}/organize` ko hit karta hai

**Key Code Flow:**
1. User pages ko modify karta hai (drag-drop, delete, rotate, insert)
2. Har action ke baad `saveHistory()` call hota hai (undo/redo ke liye)
3. `dirty` state `true` ho jata hai jab koi changes hote hain
4. "Save Changes" button enable ho jata hai
5. Save button click par:
   - Non-deleted pages ka recipe banaya jata hai
   - Recipe mein har page ke liye:
     - `sourceDocumentId` (original ya inserted document ID)
     - `sourcePageIndex` (0-based page index)
     - `rotation` (0, 90, 180, 270 degrees)
   - API call: `POST /api/documents/{documentId}/organize`
   - Backend ek naya PDF create karta hai with organized pages
   - Response mein naya document ID aata hai
   - Success toast show hota hai
   - `newDocumentId` set hota hai jo navigation ke liye use hota hai

**Important Points:**
- Save ke baad ek naya document create hota hai (original file modify nahi hoti)
- New document ID return hota hai jo redirect ke liye use hota hai
- Undo/Redo functionality hai jo local state mein kaam karta hai
- Insert functionality: User ek naya PDF upload kar sakta hai aur uske specific pages insert kar sakta hai

**API Endpoint:**
```
POST /api/documents/{documentId}/organize
Body: {
  "recipe": [
    {
      "sourceDocumentId": "doc-id-1",
      "sourcePageIndex": 0,
      "rotation": 90
    },
    ...
  ]
}
```

---

## 2. Audit Trail - How It Works & Integration

### Current Implementation:

**Location:** `doc_viewer/src/components/document-viewer/AuditTrailPanel.tsx`

**Features:**
- File actions ka history display karta hai
- Actions include:
  - File Created
  - File Viewed
  - File Downloaded
  - File Shared Externally
  - File Access Revoked
  - PDF Edited
  - PPT Edited
  - Word Edited

**Current State:**
- Abhi **hardcoded/mock data** use ho raha hai
- Real API integration pending hai
- Component ready hai but backend se data fetch nahi kar raha

**Integration Steps (Backend Required):**

1. **Backend API Endpoint Banana:**
   ```
   GET /api/documents/{documentId}/audit-trail
   Response: [
     {
       "id": "audit-001",
       "action": "File Created",
       "user": "Sumit Pawar",
       "timestamp": "2024-12-10T11:35:00Z",
       "details": "Optional details"
     },
     ...
   ]
   ```

2. **Frontend Integration:**
   - `AuditTrailPanel.tsx` mein `useEffect` add karna hoga
   - `apiService.ts` mein function add karna hoga:
     ```typescript
     async getAuditTrail(documentId: string): Promise<AuditEntry[]>
     ```
   - Component mein API call karke data fetch karna hoga
   - Loading state aur error handling add karni hogi

**UI Features:**
- Sort by A-Z / Z-A
- Action-specific icons with colored backgrounds
- Timestamp display
- User information display
- Details field for additional information

**Note:** Abhi component UI complete hai, sirf backend API integration pending hai.

---

## 3. Comments Functionality - Features & Implementation

### Current Implementation:

**Location:** `doc_viewer/src/components/document-viewer/CommentsPanel.tsx`

**Available Features:**

1. **Add Comment:**
   - Input field at bottom
   - Enter key ya send button se comment add hota hai
   - New comment immediately list mein add ho jata hai

2. **View Comments:**
   - All comments display hote hain
   - User avatar, name, timestamp show hota hai
   - Empty state (No comments yet) display hota hai

3. **Sort Comments:**
   - Latest first (default)
   - Oldest first
   - Dropdown se sort order change kar sakte hain

4. **Comment Actions:**
   - **Reply:** Reply icon (UI ready, functionality pending)
   - **Edit:** Edit option in menu (UI ready, functionality pending)
   - **Delete:** Delete option with confirmation modal

5. **Delete Confirmation:**
   - Delete click par confirmation modal show hota hai
   - Cancel ya Confirm options available hain

**Current State:**
- **Frontend UI complete hai**
- **Local state management working hai**
- **Backend API integration pending hai**

**Integration Steps (Backend Required):**

1. **Backend API Endpoints:**
   ```
   GET /api/documents/{documentId}/comments
   POST /api/documents/{documentId}/comments
   PUT /api/documents/{documentId}/comments/{commentId}
   DELETE /api/documents/{documentId}/comments/{commentId}
   ```

2. **Frontend API Service:**
   `apiService.ts` mein add karna hoga:
   ```typescript
   async getComments(documentId: string): Promise<Comment[]>
   async createComment(documentId: string, content: string): Promise<Comment>
   async updateComment(documentId: string, commentId: string, content: string): Promise<Comment>
   async deleteComment(documentId: string, commentId: string): Promise<void>
   ```

3. **Component Updates:**
   - `useEffect` se initial load par comments fetch karna
   - `handleAddComment` mein API call add karna
   - `handleDeleteComment` mein API call add karna
   - Edit functionality implement karna
   - Reply functionality implement karna

**Data Structure:**
```typescript
interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  isEdited?: boolean;
}
```

**Note:** UI completely ready hai, sirf backend integration required hai.

---

## 4. Metadata Integration - API Integration & Configuration

### Current Implementation:

**Location:** `doc_viewer/src/components/document-viewer/MetadataPanel.tsx`

**Features:**
- Metadata display in organized sections
- Folder, DocType, Master information
- Common Properties section (accordion)
- DocType-specific fields section (accordion)
- Edit button (shows locked modal - placeholder)

**API Integration:**

**Current API Endpoint:**
```
GET /api/documents/{documentId}/metadata
```

**Location:** `doc_viewer/src/services/apiService.ts`
```typescript
async getDocumentMetadata(documentId: string): Promise<any>
```

**How It Works:**
1. `DocumentViewer.tsx` mein `useEffect` se document load hote hi metadata fetch hota hai
2. `apiService.getDocumentMetadata(documentId)` call hota hai
3. Response `extractedMetadata` state mein store hota hai
4. `MetadataPanel` component ko `extractedMetadata` prop ke through pass hota hai

**Backend Implementation:**
- Backend mein `MetadataService` hai jo file se metadata extract karta hai
- Upload time par metadata extract hota hai aur document object mein store hota hai
- Metadata endpoint se stored metadata return hota hai

**Metadata Structure:**
```typescript
{
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
  lines_of_code?: number;  // For code files
  character_count?: number;  // For text files
  additional_info?: Record<string, any>;
}
```

**Current Issue:**
- `MetadataPanel` component abhi **hardcoded dummy data** use kar raha hai
- Real metadata prop ko use nahi kar raha
- Component ko update karna hoga to use `extractedMetadata` prop

**Fix Required:**
```typescript
// MetadataPanel.tsx mein
interface MetadataPanelProps {
  documentId?: string;
  extractedMetadata?: any;  // Add this prop
}

// Component mein use karna:
const MetadataPanel: React.FC<MetadataPanelProps> = ({ documentId, extractedMetadata }) => {
  // extractedMetadata ko use karo instead of DUMMY_METADATA
}
```

**Edit Functionality:**
- Edit button abhi locked modal show karta hai (placeholder)
- Real edit functionality implement karni hogi with API endpoint:
  ```
  PUT /api/documents/{documentId}/metadata
  Body: { metadata: {...} }
  ```

---

## 5. Document Viewer Integration - Complete Implementation Guide

### Project Structure:

```
doc_viewer/
├── src/
│   ├── pages/
│   │   ├── DocumentViewer.tsx      # Main viewer page
│   │   ├── ManagePdf.tsx          # PDF management page
│   │   └── Index.tsx              # Home/upload page
│   ├── components/
│   │   ├── document-viewer/       # Viewer components
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── MetadataPanel.tsx
│   │   │   ├── CommentsPanel.tsx
│   │   │   ├── AuditTrailPanel.tsx
│   │   │   └── ...
│   │   └── manage-pdf/            # PDF management components
│   ├── services/
│   │   ├── apiService.ts          # All API calls
│   │   └── rbacService.ts         # RBAC permissions
│   └── App.tsx                    # Main app with routing
```

### Key Components:

#### 1. **DocumentViewer Page** (`DocumentViewer.tsx`)
- Main document viewing interface
- Left sidebar: Page thumbnails navigation
- Center: Document preview with zoom, rotate, fullscreen
- Right sidebar: Metadata, Details, Comments, Audit Trail, Annotations panels
- Bottom toolbar: Search, page navigation, zoom controls

#### 2. **ManagePdf Page** (`ManagePdf.tsx`)
- PDF page management interface
- Drag-drop to reorder pages
- Insert pages from other PDFs
- Delete, duplicate, rotate pages
- Undo/Redo functionality
- Save changes to create new organized PDF

#### 3. **API Service** (`apiService.ts`)
- Centralized API communication
- All endpoints defined here
- Error handling
- Base URL from environment variable: `VITE_API_BASE_URL`

### API Endpoints Used:

1. **Document Operations:**
   - `POST /api/documents/upload` - Upload document
   - `GET /api/documents/{id}` - Get document details
   - `GET /api/documents/{id}/preview` - Get preview URL
   - `GET /api/documents/{id}/download` - Download document
   - `GET /api/documents/{id}/page/{pageNumber}` - Get specific page
   - `DELETE /api/documents/{id}` - Delete document

2. **PDF Management:**
   - `POST /api/documents/{id}/organize` - Save organized PDF

3. **Metadata:**
   - `GET /api/documents/{id}/metadata` - Get metadata

4. **Annotations:**
   - `GET /api/documents/{id}/annotations` - Get annotations
   - `POST /api/documents/{id}/annotations` - Create annotation
   - `PUT /api/documents/{id}/annotations/{annotationId}` - Update annotation
   - `DELETE /api/documents/{id}/annotations/{annotationId}` - Delete annotation

### Environment Configuration:

**File:** `.env` (create if not exists)
```
VITE_API_BASE_URL=http://localhost:8001/api
# Or production URL:
# VITE_API_BASE_URL=http://13.203.247.119:8001/api
```

### Routing:

**File:** `App.tsx`
- `/` - Home/Upload page
- `/document/:documentId` - Document viewer
- `/document/:documentId/manage` - PDF management

### RBAC (Role-Based Access Control):

**Location:** `doc_viewer/src/components/rbac/RBACProvider.tsx`

**Permissions:**
- `canManagePdf` - Manage PDF access
- `canComment` - Comment access
- `canAnnotate` - Annotation access
- `canViewAudit` - Audit trail access
- `canViewMetadata` - Metadata access
- `canViewDetails` - Details access

**Current State:**
- Mock permissions use ho rahe hain
- Backend integration pending
- UI mein permission checks working hain

### Key Features:

1. **Multi-format Support:**
   - PDF, Images, Office documents, Code files, Fonts, etc.
   - Different viewers for different file types

2. **Search Functionality:**
   - In-document search
   - Search results navigation

3. **Zoom & Navigation:**
   - Zoom in/out (25% to 500%)
   - Page navigation (keyboard shortcuts)
   - Rotation (90-degree increments)
   - Fullscreen mode

4. **Keyboard Shortcuts:**
   - Arrow Up/Down, Page Up/Down - Navigate pages
   - Ctrl/Cmd + +/- - Zoom
   - Ctrl/Cmd + R - Rotate
   - F11 - Fullscreen
   - Escape - Exit fullscreen

### Integration Checklist:

**Completed:**
✅ Document upload
✅ Document viewing
✅ PDF management (UI)
✅ Metadata display (API working, UI needs update)
✅ Comments UI
✅ Audit Trail UI
✅ Annotations API structure
✅ RBAC UI integration

**Pending:**
❌ Comments API integration
❌ Audit Trail API integration
❌ Metadata Panel real data integration
❌ Edit metadata functionality
❌ Reply to comments functionality
❌ Edit comments functionality

---

## Important Notes:

1. **Backend API Base URL:**
   - Environment variable se set hota hai: `VITE_API_BASE_URL`
   - Development: `http://localhost:8001/api`
   - Production: Set according to your server

2. **Error Handling:**
   - API calls mein try-catch blocks use kiye gaye hain
   - Error messages user ko show hote hain
   - Fallback data use hota hai agar API fail ho

3. **State Management:**
   - React hooks (useState, useEffect) use kiye gaye hain
   - Local state management for UI
   - API calls for data fetching

4. **File Structure:**
   - Components organized by feature
   - Services folder for API calls
   - Reusable UI components in `components/ui/`

---

## Next Steps for Complete Integration:

1. **Comments:**
   - Backend API endpoints implement karni hain
   - Frontend mein API calls add karni hain
   - Reply functionality implement karni hai

2. **Audit Trail:**
   - Backend API endpoint implement karna hai
   - Frontend mein data fetch karna hai
   - Real-time updates (optional)

3. **Metadata:**
   - `MetadataPanel` component ko update karna hai to use real data
   - Edit functionality implement karni hai
   - Backend update endpoint banana hai

4. **Testing:**
   - All features test karni hain
   - Error scenarios handle karni hain
   - Edge cases check karni hain

---

Agar koi aur specific question ya clarification chahiye, to please batayein. Main detailed explanation de sakta hoon kisi bhi specific feature ke baare mein.

Thanks & Regards,
[Your Name]


