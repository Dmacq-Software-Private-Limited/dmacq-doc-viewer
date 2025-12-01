# core/file_handlers/font_handler.py
import os
from pathlib import Path
from typing import Dict, Any, Optional
from fontTools.ttLib import TTFont

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils.file_utils import format_file_size
from config import settings
from datetime import datetime

class FontHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process font file - no special processing needed"""
        return {
            "total_pages": 1,
            "is_plain_text": False
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Fonts cannot be converted to PDF"""
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract font metadata using fontTools"""
        metadata = DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )

        try:
            with open(file_path, 'rb') as font_file:
                font = TTFont(font_file)
                names = {}
                for record in font['name'].names:
                    names[record.nameID] = record.string.decode(record.getEncoding(), 'ignore')

                char_set = set()
                if 'cmap' in font:
                    for cmap in font.get('cmap').tables:
                        if cmap.isUnicode():
                            for char_code in cmap.cmap:
                                char_set.add(chr(char_code))

                metadata.additional_info = {
                    'family': names.get(1, 'N/A'),
                    'subfamily': names.get(2, 'N/A'),
                    'full_name': names.get(4, 'N/A'),
                    'version': names.get(5, 'N/A'),
                    'character_count': len(char_set)
                }
        except Exception:
            pass

        return metadata

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """No thumbnail for fonts"""
        return None