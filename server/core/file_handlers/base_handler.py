# core/file_handlers/base_handler.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from models.document import DocumentMetadata

class FileHandler(ABC):
    @abstractmethod
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """
        Process document (convert if needed, generate thumbnails, etc.)
        Returns dictionary with keys:
        - total_pages
        - converted_path (optional)
        - thumbnail_path (optional)
        - is_plain_text
        """
        pass

    @abstractmethod
    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Convert file to PDF, return path to converted file"""
        pass

    @abstractmethod
    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract metadata from file"""
        pass

    @abstractmethod
    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Generate thumbnail image, return path to thumbnail"""
        pass

    async def get_page_as_image(self, source_path: str, page_number: int, doc_id: str) -> Optional[str]:
        """
        Get specific page as image (default implementation using PDF conversion)
        Can be overridden by specific handlers for better performance
        """
        from services.conversion_service import ConversionService
        return await ConversionService().get_page_as_image(source_path, page_number, doc_id)