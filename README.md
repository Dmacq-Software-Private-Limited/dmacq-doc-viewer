# 📄 Doc Viewer

A full-featured document viewer that allows users to preview and interact with a wide range of file types directly in the browser.

## 🚀 Features

- File preview based on extension or MIME type
- Viewer toolbar: Zoom, Rotate, Scroll, Search, Page Navigation
- Metadata, Details, Comments, Audit Trail, and Annotations
- PDF-specific actions: Manage PDF (rearrange, insert, delete pages)
- Signature tool for digital signing
- Role-based access control (RBAC) for Download, Print, Manage, and Annotate
- Fallback for unsupported or password-protected files

## ✅ Acceptance Criteria

- Users can log in and open folders/documents
- Correct file viewer loads automatically
- Toolbar and document info bar displayed
- Edge case handling: unsupported files, password-protected PDFs, RBAC-based controls

## 🎯 Happy Flow

1. User logs in and navigates to a folder
2. Opens a document and previews it
3. Uses toolbar features and interacts via metadata/comments/audit trail
4. Manages PDF or signs if permitted
5. Closes viewer and returns to folder

## ⚠️ Edge Cases

- Unsupported files: show fallback message with download option
- Password-protected PDFs: prompt for password
- Hide buttons based on permissions or file type
- Detect version changes and alert users
- Prevent file leaks via screenshots or dev tools

---

🔒 Secure, role-aware, and built for real-world document collaboration.

