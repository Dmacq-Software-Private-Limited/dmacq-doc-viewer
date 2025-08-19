# core/file_handlers/misc_handler.py
import os
from pathlib import Path
from typing import Dict, Any, Optional

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils.file_utils import format_file_size
from datetime import datetime


class MiscHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Processes miscellaneous file types based on their extension."""
        file_ext = Path(file_path).suffix.lower()
        result = {"total_pages": 1, "content": None}

        if file_ext in [".outlook", ".pes", ".pfm", ".mpp"]:
            with open(file_path, "rb") as f:
                data = f.read(1024)
                content = data.decode(errors="ignore")
            result["is_plain_text"] = True
            return result
        
        elif file_ext == ".mht":
            result["is_plain_text"] = True
            return result

        elif file_ext == ".picon":
            result["is_plain_text"] = True
            return result

        return {
            "total_pages": 1,
            "is_plain_text": False
        }

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Basic metadata extraction for miscellaneous files."""
        return DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )
    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """PDFs don't need conversion - return original path"""
        return file_path

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """No thumbnail for these file types."""
        return None
