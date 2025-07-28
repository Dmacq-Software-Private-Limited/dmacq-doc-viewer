# core/file_handlers/text_handler.py
import os
from pathlib import Path
from typing import Dict, Any, Optional

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils.file_utils import format_file_size
from core.registry import extensions
from datetime import datetime

class TextHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process text files - no conversion needed"""
        return {
            "total_pages": 1,
            "is_plain_text": True
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Text files don't need PDF conversion"""
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract metadata from text files"""
        # Count lines and characters
        lines = 0
        chars = 0
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    lines += 1
                    chars += len(line)
        except Exception:
            pass

        return DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem,
            lines_of_code=lines,
            character_count=chars
        )

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """No thumbnail for text files"""
        return None