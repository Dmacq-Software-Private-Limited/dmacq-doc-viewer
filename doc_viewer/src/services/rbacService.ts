// src/services/rbacService.ts
import axios from "axios";
const API_BASE_URL = 'http://13.203.247.119:8001/api';
export async function fetchUserSessionAndPermissions() {
    
    return Promise.resolve({
        token: "mocked-token-1234",
        user: {
            id: "dev-123",
            name: "Developer Tester",
            email: "devtester@example.com",
            roles: ["admin", "editor"],
            department: "Engineering"
        },
        users:[
{
            id: "dev-123",
            name: "Tester",
            email: "devtester@example.com",
            roles: ["admin", "editor"],
            department: "Engineering"
        },{
            id: "dev-13",
            name: "Developer",
            email: "devtester@example.com",
            roles: ["admin", "editor"],
            department: "Engineering"
        }
        ],
        metadata:{
  folder: "Employee_2024",
  docType: "Invoice",
  master: "Invoice_Master, Invoice_Data",
  metaData: {
    commonProperties: {
      fillName: "Akash Sharma",
      emailAddress: "akash.sharma@example.com",
      contactNumber: "9876543210",
    },
    docTypeFields: {
      invoice: "INV-000002",
    },
  },
},
        permissions: {
            canView: true,
            canEdit: true,
            canComment: true,
            canAnnotate: true,
            canManagePdf: true,
            canViewAudit: true,
            canSign: true,
            canSeeVersionHistory: true,
            canViewDetails: true,
            canViewMetadata: true
        },
        document: {
            id: "doc-001",
            name: "Sample Document.pdf",
            type: "PDF",
            size: 2348290, // bytes
            uploadedBy: "Alice Johnson",
            uploadedAt: "2025-08-17T14:23:10Z",
            version: "1.2",
            currentUrl: "/docs/doc-001/view",
            fileType: "pdf",
            previewUrl: "/docs/doc-001/preview",
            isPlainText: false,
            metadata: {
                title: "Quarterly Report",
                description: "Q2 financials and projections",
                tags: ["finance", "confidential", "Q2"],
                customFields: {
                    department: "Finance",
                    audience: "Executives"
                }
            }
        },
        history: [
            {
                action: "created",
                user: "Alice Johnson",
                timestamp: "2025-08-17T14:23:10Z",
                details: "Initial upload"
            },
            {
                action: "edited",
                user: "Bob Smith",
                timestamp: "2025-08-18T09:12:00Z",
                details: "Updated forecast numbers in section 3"
            }
            // ... more history
        ],
        versionHistory: [
            {
                version: "1.0",
                editedBy: "Alice Johnson",
                editedAt: "2025-08-17T14:23:10Z",
                changesSummary: "Initial upload"
            },
            {
                version: "1.2",
                editedBy: "Bob Smith",
                editedAt: "2025-08-18T09:12:00Z",
                changesSummary: "Forecast update"
            }
            // ... more versions
        ],
        comments: [
            {
                id: "comment-001",
                user: "Charlie Brown",
                createdAt: "2025-08-18T10:30:00Z",
                content: "Check figures on page 4",
                page: 4
            }
            // ... more comments
        ],
        annotations: [
            {
                id: "annot-001",
                user: "Dana White",
                page: 5,
                type: "highlight",
                coordinates: [150, 300, 200, 320],
                comment: "Review this paragraph",
                createdAt: "2025-08-18T11:02:00Z"
            }
            // ... more annotations
        ],
        auditTrail: [
            {
                id: "audit-001",
                user: "Alice Johnson",
                action: "accessed",
                timestamp: "2025-08-18T09:30:00Z",
                details: "Viewed document"
            },
            {
                id: "audit-002",
                user: "Bob Smith",
                action: "edited",
                timestamp: "2025-08-18T09:32:00Z",
                details: "Changed metadata"
            }
            // ... more audit events
        ],
        expiresAt: Date.now() + 3600 * 1000 // Token valid for 1 hour from now
    });
}

// ---
// When backend API is ready, REPLACE the above function with this version:
/*
export async function fetchUserSessionAndPermissions() {
  const res = await axios.get(`${API_BASE_URL}/session/permissions`, { withCredentials: true });
  return res.data; // Assumes backend returns { token, user, permissions, expiresAt }
}
*/
