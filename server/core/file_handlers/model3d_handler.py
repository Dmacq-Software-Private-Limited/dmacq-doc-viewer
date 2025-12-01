# core/file_handlers/model3d_handler.py
import os
from pathlib import Path
from typing import Dict, Any, Optional
import trimesh

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils.file_utils import format_file_size
from config import settings
from datetime import datetime


class Model3DHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process 3D model file - generate thumbnail if possible"""
        thumbnail_path = await self.generate_thumbnail(file_path, doc_id)
        return {
            "total_pages": 1,
            "thumbnail_path": thumbnail_path,
            "is_plain_text": False
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """3D models cannot be converted to PDF"""
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract metadata for 3D files"""
        metadata = DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem
        )

        file_ext = Path(file_path).suffix.lower()
        metadata.additional_info = {"type": "3D Model"}

        try:
            if file_ext == '.obj':
                vertex_count = 0
                face_count = 0
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith('v '): vertex_count += 1
                        elif line.startswith('f '): face_count += 1
                metadata.additional_info.update({
                    "vertices": vertex_count,
                    "faces": face_count
                })
            elif file_ext == '.stl':
                is_ascii = False
                with open(file_path, 'rb') as f:
                    start = f.read(80)
                    is_ascii = b"solid" in start.lower()
                metadata.additional_info["format"] = "ASCII" if is_ascii else "Binary"
            elif file_ext == '.3ds':
                mesh = trimesh.load(file_path)
                metadata.additional_info.update({
                    "vertices": len(mesh.vertices),
                    "faces": len(mesh.faces),
                    "bounds": mesh.bounds.tolist()
                })
        except Exception:
            pass

        return metadata

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Generate thumbnail for 3D model (not implemented)"""
        # In production, you would use a 3D rendering library to generate a thumbnail
        return None