# services/document_service.py
import os
import shutil
import uuid
from typing import Dict, Any, Optional
from pathlib import Path
from fastapi import UploadFile

from config import settings
from models.document import Document
from core.registry.handler_registry import HandlerRegistry

class DocumentService:
    def __init__(self):
        self.documents: Dict[str, Document] = {}

    def is_supported_file(self, filename: str, content_type: str) -> bool:
        """Check if file type is supported by extension or MIME type."""
        if not filename:
            return False

        file_ext = Path(filename).suffix.lower()
        return (file_ext in settings.SUPPORTED_EXTENSIONS or
                content_type in settings.SUPPORTED_MIME_TYPES)

    async def save_uploaded_file(self, file: UploadFile, document_id: str) -> str:
        """Save uploaded file to disk"""
        file_ext = Path(file.filename).suffix.lower()
        filename = f"{document_id}{file_ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return file_path

    async def process_document(self, file_path: str, document_id: str) -> Dict[str, Any]:
        """Process document using the appropriate handler"""
        file_ext = Path(file_path).suffix.lower()
        handler = HandlerRegistry.get_handler(file_ext)
        return await handler.process(file_path, document_id)

    def store_document(self, document: Document):
        """Store document in memory (in production, use a database)"""
        self.documents[document.id] = document

    def get_document(self, document_id: str) -> Optional[Document]:
        """Get document by ID"""
        return self.documents.get(document_id)

    async def get_page_image(self, document_id: str, page_number: int) -> Optional[str]:
        """Get page as image using the appropriate handler"""
        document = self.get_document(document_id)
        if not document:
            return None

        source_file = document.converted_path or document.file_path
        file_ext = Path(source_file).suffix.lower()
        handler = HandlerRegistry.get_handler(file_ext)

        return await handler.get_page_as_image(
            source_file, page_number, document_id
        )