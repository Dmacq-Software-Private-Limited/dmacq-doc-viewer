# core/file_handlers/image_handler.py
import os
from pathlib import Path
from typing import Dict, Any, Optional
from PIL import Image

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils import command_utils
from core.utils.file_utils import format_file_size
from config import settings
from datetime import datetime


class ImageHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process image file - generate thumbnail"""
        thumbnail_path = await self.generate_thumbnail(file_path, doc_id)
        return {
            "total_pages": 1,
            "thumbnail_path": thumbnail_path,
            "is_plain_text": False
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Images don't need PDF conversion for viewing"""
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract image metadata using PIL"""
        metadata = DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )

        try:
            with Image.open(file_path) as img:
                width, height = img.size
                metadata.additional_info = {
                    'width': width,
                    'height': height,
                    'format': img.format,
                    'mode': img.mode
                }
        except Exception:
            pass

        return metadata

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Generate thumbnail for image"""
        thumbnail_path = os.path.join(settings.THUMBNAILS_DIR, f"{doc_id}_thumb.png")

        # Using ImageMagick's convert command
        cmd = [
            "convert", file_path,
            "-thumbnail", "400x400>",
            "-background", "white",
            "-alpha", "remove",
            thumbnail_path
        ]

        returncode, stdout, stderr = await command_utils.run_command(cmd)
        if returncode == 0 and os.path.exists(thumbnail_path):
            return thumbnail_path

        # Fallback to PIL if ImageMagick fails
        try:
            with Image.open(file_path) as img:
                img.thumbnail((400, 400))
                img.save(thumbnail_path, "PNG")
            return thumbnail_path
        except Exception:
            return None