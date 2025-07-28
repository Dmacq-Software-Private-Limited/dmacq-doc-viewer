# core/file_handlers/audio_handler.py
import os
import json
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional
from mutagen import File

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils import command_utils
from core.utils.file_utils import format_file_size
from config import settings
from datetime import datetime

class AudioHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process audio file - generate thumbnail (waveform)"""
        thumbnail_path = await self.generate_thumbnail(file_path, doc_id)
        return {
            "total_pages": 1,
            "thumbnail_path": thumbnail_path,
            "is_plain_text": False
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Audio cannot be converted to PDF"""
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract audio metadata using mutagen"""
        metadata = DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )

        try:
            audio = File(file_path)
            if audio is not None:
                metadata.additional_info = {
                    "duration": audio.info.length,
                    "bitrate": audio.info.bitrate if hasattr(audio.info, 'bitrate') else None,
                    "sample_rate": audio.info.sample_rate if hasattr(audio.info, 'sample_rate') else None
                }
        except Exception:
            pass

        return metadata

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Generate audio waveform thumbnail using ffmpeg"""
        thumbnail_path = os.path.join(settings.THUMBNAILS_DIR, f"{doc_id}_thumb.png")

        cmd = [
            "ffmpeg",
            "-i", file_path,
            "-filter_complex", "showwavespic=s=400x240:colors=white",  # Waveform with white color
            "-frames:v", "1",
            "-y",  # Overwrite output
            thumbnail_path
        ]

        returncode, stdout, stderr = await command_utils.run_command(cmd)
        if returncode == 0 and os.path.exists(thumbnail_path):
            return thumbnail_path
        return None