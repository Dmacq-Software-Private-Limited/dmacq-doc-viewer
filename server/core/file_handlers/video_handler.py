# core/file_handlers/video_handler.py
import os
import json
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils import command_utils
from core.utils.file_utils import format_file_size
from config import settings
from datetime import  datetime

class VideoHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process video file - generate thumbnail"""
        thumbnail_path = await self.generate_thumbnail(file_path, doc_id)
        return {
            "total_pages": 1,
            "thumbnail_path": thumbnail_path,
            "is_plain_text": False
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Videos cannot be converted to PDF"""
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract video metadata using ffprobe"""
        metadata = DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )

        cmd = [
            "ffprobe", "-v", "error",
            "-print_format", "json",
            "-show_format", "-show_streams", file_path
        ]
        returncode, stdout, stderr = await command_utils.run_command(cmd)

        if returncode == 0:
            try:
                info = json.loads(stdout)
                # Find the first video stream
                video_stream = next(
                    (s for s in info.get('streams', []) if s.get('codec_type') == 'video'),
                    None
                )
                if video_stream:
                    metadata.additional_info = {
                        "duration": float(info["format"].get("duration", 0)),
                        "width": video_stream.get("width"),
                        "height": video_stream.get("height"),
                        "codec": video_stream.get("codec_name")
                    }
            except Exception:
                pass

        return metadata

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Generate video thumbnail using ffmpeg"""
        thumbnail_path = os.path.join(settings.THUMBNAILS_DIR, f"{doc_id}_thumb.png")

        cmd = [
            "ffmpeg", "-ss", "00:00:01",  # Seek to 1 second
            "-i", file_path,
            "-vframes", "1",              # Capture 1 frame
            "-q:v", "3",                   # Quality level (1-31, 1=best)
            "-y",                          # Overwrite output
            thumbnail_path
        ]

        returncode, stdout, stderr = await command_utils.run_command(cmd)
        if returncode == 0 and os.path.exists(thumbnail_path):
            return thumbnail_path
        return None