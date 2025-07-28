# core/file_handlers/default_handler.py
from .base_handler import FileHandler
from models.document import DocumentMetadata
from datetime import datetime
import os
from core.utils.file_utils import format_file_size
from core.utils.command_utils import run_command
from config import settings
from typing import  Dict, Optional, Any
from pathlib import Path

class DefaultHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Basic processing for unknown file types"""
        return {
            "total_pages": 1,
            "is_plain_text": False
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Fallback conversion using LibreOffice"""
        output_dir = os.path.join(settings.CONVERTED_DIR, doc_id)
        os.makedirs(output_dir, exist_ok=True)
        final_pdf_path = os.path.join(output_dir, f"{doc_id}.pdf")

        cmd = ["libreoffice", "--headless", "--convert-to", "pdf",
               "--outdir", output_dir, file_path]
        returncode, stdout, stderr = await run_command(cmd)

        if returncode == 0:
            original_stem = Path(file_path).stem
            generated_pdf = os.path.join(output_dir, f"{original_stem}.pdf")
            if os.path.exists(generated_pdf):
                os.rename(generated_pdf, final_pdf_path)
            return final_pdf_path if os.path.exists(final_pdf_path) else None
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Basic metadata extraction"""
        return DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Fallback thumbnail generation - use generic icon"""
        # In production, you'd return a path to a generic file icon
        return None