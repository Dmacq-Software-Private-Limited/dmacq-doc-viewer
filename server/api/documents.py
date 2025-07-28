from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Optional
import os
import uuid
import traceback
from pathlib import Path

from services.document_service import DocumentService
from services.metadata_service import MetadataService
from services.annotation_service import AnnotationService
from models.document import Document

router = APIRouter()

document_service = DocumentService()
metadata_service = MetadataService()
annotation_service = AnnotationService()

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    is_supported = document_service.is_supported_file(file.filename, file.content_type)
    if not is_supported:
        error_detail = (
            f"Unsupported file. "
            f"Filename: '{file.filename}', "
            f"Content-Type received: '{file.content_type}'"
        )
        print(error_detail)
        raise HTTPException(status_code=400, detail=error_detail)

    try:
        document_id = str(uuid.uuid4())
        file_path = await document_service.save_uploaded_file(file, document_id)
        processed_info = await document_service.process_document(file_path, document_id)
        metadata = await metadata_service.extract_metadata(file_path)

        document = Document(
            id=document_id,
            name=file.filename,
            original_name=file.filename,
            file_type=file.content_type,
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

@router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Document Viewer API is running"}
