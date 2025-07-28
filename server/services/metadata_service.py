# services/metadata_service.py
import os
from pathlib import Path
from core.registry.handler_registry import HandlerRegistry
from models.document import DocumentMetadata

class MetadataService:
    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract metadata using the appropriate handler"""
        file_ext = Path(file_path).suffix.lower()
        handler = HandlerRegistry.get_handler(file_ext)
        return await handler.extract_metadata(file_path)