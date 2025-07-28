# core/file_handlers/pdf_handler.py
import os
import PyPDF2
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils import command_utils
from core.utils.file_utils import format_file_size
from config import settings

class PdfHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process PDF file - minimal processing needed"""
        total_pages = await self.get_page_count(file_path)
        return {
            "total_pages": total_pages,
            "converted_path": None,  # PDFs don't need conversion
            "thumbnail_path": await self.generate_thumbnail(file_path, doc_id),
            "is_plain_text": False
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """PDFs don't need conversion - return original path"""
        return file_path

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract PDF metadata using PyPDF2"""
        metadata = DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )

        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                info = reader.metadata
                metadata.pages = len(reader.pages)
                if info:
                    metadata.title = info.get('/Title') or metadata.title
                    metadata.author = info.get('/Author')
                    metadata.subject = info.get('/Subject')
                    metadata.keywords = info.get('/Keywords')
                    metadata.creator = info.get('/Creator')
                    metadata.producer = info.get('/Producer')
        except Exception:
            pass  # Return basic metadata if extraction fails

        return metadata

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Generate PDF thumbnail using pdftoppm"""
        thumbnail_path = os.path.join(settings.THUMBNAILS_DIR, f"{doc_id}_thumb.png")
        output_prefix = os.path.join(settings.THUMBNAILS_DIR, f"{doc_id}_thumb_temp")

        cmd = [
            "pdftoppm", "-png", "-f", "1", "-l", "1",
            "-scale-to-x", "400", "-scale-to-y", "-1",
            file_path, output_prefix
        ]

        returncode, stdout, stderr = await command_utils.run_command(cmd)

        if returncode == 0:
            # Find generated file (e.g., output_prefix-1.png)
            generated_file = f"{output_prefix}-1.png"
            if os.path.exists(generated_file):
                os.rename(generated_file, thumbnail_path)
                return thumbnail_path
        return None

    async def get_page_count(self, pdf_path: str) -> int:
        """Get PDF page count using pdfinfo"""
        cmd = ["pdfinfo", pdf_path]
        returncode, stdout, stderr = await command_utils.run_command(cmd, timeout=30)

        if returncode == 0:
            for line in stdout.splitlines():
                if line.startswith("Pages:"):
                    try:
                        return int(line.split(":")[1].strip())
                    except (ValueError, IndexError):
                        pass
        return 1  # Fallback to 1 page