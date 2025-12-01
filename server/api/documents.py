from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from config import settings

from PyPDF2 import PdfReader, PdfWriter

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import FileResponse
import os
import uuid
import traceback
from pathlib import Path

from services.document_service import DocumentService
from services.metadata_service import MetadataService
from services.annotation_service import AnnotationService
from models.document import Document
from core.utils.file_utils import get_mime_type
from core.registry.handler_registry import HandlerRegistry

router = APIRouter()

document_service = DocumentService()
metadata_service = MetadataService()
annotation_service = AnnotationService()

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        document_id = str(uuid.uuid4())
        file_path = await document_service.save_uploaded_file(file, document_id)
        
        # Get MIME type using python-magic
        mime_type = get_mime_type(file_path)

        # Now, check if the file type is supported
        is_supported = document_service.is_supported_file(file.filename, mime_type)
        if not is_supported:
            error_detail = (
                f"Unsupported file type. "
                f"Filename: '{file.filename}', "
                f"Detected Content-Type: '{mime_type}'"
            )
            print(error_detail)
            # Clean up the saved file
            os.remove(file_path)
            raise HTTPException(status_code=400, detail=error_detail)
        
        processed_info = await document_service.process_document(file_path, document_id)
        metadata = await metadata_service.extract_metadata(file_path)

        document = Document(
            id=document_id,
            name=file.filename,
            original_name=file.filename,
            file_type=mime_type,
            size=Path(file_path).stat().st_size,
            file_path=file_path,
            converted_path=processed_info.get("converted_path"),
            thumbnail_path=processed_info.get("thumbnail_path"),
            total_pages=processed_info.get("total_pages", 1),
            metadata=metadata,
            is_plain_text=processed_info.get("is_plain_text", False)
        )

        document_service.store_document(document)

        return {
            "id": document.id,
            "name": document.name,
            "size": document.size,
            "type": document.file_type,
            "uploadedAt": document.created_at.isoformat(),
            "totalPages": document.total_pages,
            "previewUrl": f"/api/documents/{document.id}/preview",
            "downloadUrl": f"/api/documents/{document.id}/download"
        }

    except Exception as e:
        print("Error in /upload:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}")
async def get_document(document_id: str):
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": document.id,
        "name": document.name,
        "originalName": document.original_name,
        "fileType": document.file_type,
        "size": document.size,
        "totalPages": document.total_pages,
        "createdAt": document.created_at.isoformat(),
        "updatedAt": document.updated_at.isoformat(),
        "previewUrl": f"/api/documents/{document_id}/preview",
        "downloadUrl": f"/api/documents/{document_id}/download",
        "metadata": document.metadata,
        "is_plain_text": document.is_plain_text,
    }

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    try:
        document_service.delete_document(document_id)
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/preview")
async def get_document_preview(document_id: str):
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if document.is_plain_text:
        preview_path = document.file_path
        media_type = "text/plain; charset=utf-8"
    else:
        preview_path = document.converted_path or document.file_path
        media_type = None

    if not os.path.exists(preview_path):
        raise HTTPException(status_code=404, detail="Preview file not found on server.")

    return FileResponse(preview_path, media_type=media_type)

@router.get("/documents/{document_id}/page/{page_number}")
async def get_document_page(document_id: str, page_number: int):
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if page_number < 1 or page_number > document.total_pages:
        raise HTTPException(status_code=400, detail="Invalid page number requested.")

    page_image_path = await document_service.get_page_image(document_id, page_number)
    if not page_image_path or not os.path.exists(page_image_path):
        raise HTTPException(status_code=404, detail="Page image could not be found or generated.")

    return FileResponse(page_image_path, media_type="image/png")

@router.get("/documents/{document_id}/download")
async def download_document(document_id: str):
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=document.file_path,
        filename=document.original_name,
        media_type=document.file_type or 'application/octet-stream'
    )

@router.get("/documents/{document_id}/metadata")
async def get_document_metadata(document_id: str):
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document.metadata

@router.get("/documents/{document_id}/list_files")
async def list_archive_files(document_id: str):
    """Endpoint to list files inside an archive."""
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Ensure this is an archive file type before proceeding
    file_ext = Path(document.file_path).suffix.lower()
    handler = HandlerRegistry.get_handler(file_ext)
    
    # A bit of a hacky way to check if it's an ArchiveHandler
    if "archive_handler" not in handler.__class__.__module__:
         raise HTTPException(status_code=400, detail="This document is not an archive.")

    try:
        file_list = await handler.list_archive_contents(document.file_path)
        return {"file_list": file_list}
    except Exception as e:
        print(f"Error listing archive contents for {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to list archive contents.")

@router.post("/documents/{document_id}/annotations")
async def create_annotation(document_id: str, annotation_data: dict):
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    annotation = await annotation_service.create_annotation(document_id, annotation_data)
    return annotation

@router.get("/documents/{document_id}/annotations")
async def get_annotations(document_id: str, page: Optional[int] = None):
    document = document_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    annotations = await annotation_service.get_annotations(document_id, page)
    return annotations

@router.put("/documents/{document_id}/annotations/{annotation_id}")
async def update_annotation(document_id: str, annotation_id: str, annotation_data: dict):
    annotation = await annotation_service.update_annotation(annotation_id, annotation_data)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return annotation

@router.delete("/documents/{document_id}/annotations/{annotation_id}")
async def delete_annotation(document_id: str, annotation_id: str):
    success = await annotation_service.delete_annotation(annotation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Annotation not found")
    return {"message": "Annotation deleted successfully"}

class PageOp(BaseModel):
    sourceDocumentId: str
    sourcePageIndex: int  # 0-based
    rotation: int = 0     # 0, 90, 180, 270

class OrganizePayload(BaseModel):
    recipe: List[PageOp]

# --- ENDPOINT ---

@router.post("/documents/{document_id}/organize")
async def organize_pdf(document_id: str, operations: OrganizePayload):
    if not operations.recipe or len(operations.recipe) == 0:
        raise HTTPException(status_code=400, detail="No pages specified in recipe.")

    writer = PdfWriter()
    page_sources = {}  # Cache PdfReader per document

    new_doc_id = str(uuid.uuid4())
    new_file_name = f"{new_doc_id}.pdf"
    new_file_path = os.path.join(settings.UPLOAD_DIR, new_file_name)
    page_count = 0

    try:
        for step, pageop in enumerate(operations.recipe):
            src_doc_id = pageop.sourceDocumentId
            src_page_idx = pageop.sourcePageIndex
            rotation = int(pageop.rotation or 0) % 360

            # Get source doc file path
            src_doc: Document = document_service.get_document(src_doc_id)
            if not src_doc or not os.path.exists(src_doc.file_path):
                raise HTTPException(
                    status_code=404,
                    detail=f"Source PDF {src_doc_id} not found on server."
                )

            if src_doc_id not in page_sources:
                reader = PdfReader(src_doc.file_path)
                page_sources[src_doc_id] = reader
            else:
                reader = page_sources[src_doc_id]

            if src_page_idx >= len(reader.pages):
                raise HTTPException(
                    status_code=400,
                    detail=f"Page {src_page_idx+1} out of bounds in source PDF."
                )

            page = reader.pages[src_page_idx]
            if rotation:
                page = page.rotate(rotation)  # pypdf 3.x: returns new rotated Page

            writer.add_page(page)
            page_count += 1

        # Write the merged/organized result to disk
        with open(new_file_path, "wb") as out_f:
            writer.write(out_f)

        # Process the new PDF for metadata/thumbnails as usual
        processed_info = await document_service.process_document(new_file_path, new_doc_id)
        metadata = await metadata_service.extract_metadata(new_file_path)

        # Register the new document (in-memory DB, or update for your DB solution)
        new_doc = Document(
            id=new_doc_id,
            name=new_file_name,
            original_name=new_file_name,
            file_type="application/pdf",
            size=Path(new_file_path).stat().st_size,
            file_path=new_file_path,
            converted_path=processed_info.get("converted_path"),
            thumbnail_path=processed_info.get("thumbnail_path"),
            total_pages=processed_info.get("total_pages", page_count),
            metadata=metadata,
            is_plain_text=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        document_service.store_document(new_doc)

        # Return the new doc's core info for frontend update/redirect
        return {
            "id": new_doc.id,
            "name": new_doc.name,
            "size": new_doc.size,
            "type": new_doc.file_type,
            "uploadedAt": new_doc.created_at.isoformat(),
            "totalPages": new_doc.total_pages,
            "previewUrl": f"/api/documents/{new_doc.id}/preview",
            "downloadUrl": f"/api/documents/{new_doc.id}/download"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to organize PDF: {e}"
        )


@router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Document Viewer API is running"}
