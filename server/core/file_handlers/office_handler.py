# core/file_handlers/office_handler.py
import os
from pathlib import Path
from typing import Dict, Any, Optional
import asyncio

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils import command_utils
from core.utils.file_utils import format_file_size
from config import settings
from datetime import  datetime

class OfficeHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process office documents by converting to PDF"""
        converted_path = await self.convert_to_pdf(file_path, doc_id)
        total_pages = await self.get_page_count(converted_path) if converted_path else 1
        thumbnail_path = await self.generate_thumbnail(converted_path or file_path, doc_id)

        return {
            "total_pages": total_pages,
            "converted_path": converted_path,
            "thumbnail_path": thumbnail_path,
            "is_plain_text": False
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Convert office document to PDF using LibreOffice"""
        output_dir = os.path.join(settings.CONVERTED_DIR, doc_id)
        os.makedirs(output_dir, exist_ok=True)
        final_pdf_path = os.path.join(output_dir, f"{doc_id}.pdf")

        cmd = [
            "libreoffice", "--headless", "--convert-to", "pdf",
            "--outdir", output_dir, file_path
        ]

        returncode, stdout, stderr = await command_utils.run_command(cmd)

        if returncode == 0:
            original_stem = Path(file_path).stem
            generated_pdf = os.path.join(output_dir, f"{original_stem}.pdf")
            if os.path.exists(generated_pdf):
                os.rename(generated_pdf, final_pdf_path)
            return final_pdf_path if os.path.exists(final_pdf_path) else None
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Basic metadata extraction for office files"""
        return DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Generate thumbnail from the converted PDF"""
        # First ensure we have a PDF
        if not file_path.endswith('.pdf'):
            pdf_path = await self.convert_to_pdf(file_path, f"thumb_{doc_id}")
            file_path = pdf_path or file_path

        # Delegate to base PDF thumbnail generation
        return await super().generate_thumbnail(file_path, doc_id)

    async def get_page_count(self, file_path: str) -> int:
        """Get page count from converted PDF"""
        if not file_path.endswith('.pdf'):
            return 1  # Fallback if not PDF

        cmd = ["pdfinfo", file_path]
        returncode, stdout, stderr = await command_utils.run_command(cmd, timeout=30)

        if returncode == 0:
            for line in stdout.splitlines():
                if line.startswith("Pages:"):
                    try:
                        return int(line.split(":")[1].strip())
                    except (ValueError, IndexError):
                        pass
        return 1