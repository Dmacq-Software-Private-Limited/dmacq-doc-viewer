# core/file_handlers/archive_handler.py
import os
import zipfile
import tarfile
import rarfile
import py7zr
from pathlib import Path
from typing import Dict, Any, Optional, List
import shutil

from .base_handler import FileHandler
from models.document import DocumentMetadata
from core.utils.file_utils import format_file_size
from config import settings
from core.utils import command_utils
from datetime import datetime


class ArchiveHandler(FileHandler):
    async def process(self, file_path: str, doc_id: str) -> Dict[str, Any]:
        """Process archive file - extract contents and create listing"""
        extract_dir = os.path.join(settings.CONVERTED_DIR, doc_id, "extracted")
        os.makedirs(extract_dir, exist_ok=True)

        extracted = await self.extract_archive(file_path, extract_dir)
        file_list = await self.list_archive_contents(file_path)

        return {
            "total_pages": 1,
            "is_plain_text": False,
            "extracted_path": extract_dir if extracted else None,
            "file_list": file_list
        }

    async def convert_to_pdf(self, file_path: str, doc_id: str) -> Optional[str]:
        """Archives cannot be directly converted to PDF"""
        return None

    async def extract_metadata(self, file_path: str) -> DocumentMetadata:
        """Extract archive metadata"""
        return DocumentMetadata(
            file_size=format_file_size(os.path.getsize(file_path)),
            creation_date=datetime.fromtimestamp(os.path.getctime(file_path)),
            modification_date=datetime.fromtimestamp(os.path.getmtime(file_path)),
            title=Path(file_path).stem,
            additional_info={
                "file_count": await self.get_file_count(file_path)
            }
        )

    async def generate_thumbnail(self, file_path: str, doc_id: str) -> Optional[str]:
        """Use generic archive icon as thumbnail"""
        # In production, you would return a path to a generic archive icon
        return None

    async def extract_archive(self, file_path: str, output_dir: str) -> bool:
        """Extract archive contents to output directory"""
        file_ext = Path(file_path).suffix.lower()

        try:
            if file_ext == '.zip':
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(output_dir)
                return True

            elif file_ext == '.tar':
                with tarfile.open(file_path, 'r') as tar_ref:
                    tar_ref.extractall(output_dir)
                return True

            elif file_ext == '.gz' or file_ext == '.tgz':
                with tarfile.open(file_path, 'r:gz') as tar_ref:
                    tar_ref.extractall(output_dir)
                return True

            elif file_ext == '.bz2' or file_ext == '.tbz2':
                with tarfile.open(file_path, 'r:bz2') as tar_ref:
                    tar_ref.extractall(output_dir)
                return True

            elif file_ext == '.rar':
                with rarfile.RarFile(file_path, 'r') as rar_ref:
                    rar_ref.extractall(output_dir)
                return True

            elif file_ext == '.7z':
                with py7zr.SevenZipFile(file_path, mode='r') as zip_ref:
                    zip_ref.extractall(output_dir)
                return True

        except Exception as e:
            print(f"Error extracting archive: {e}")
            return False

        return False

    async def list_archive_contents(self, file_path: str) -> List[str]:
        """List files in archive without extracting"""
        file_ext = Path(file_path).suffix.lower()
        contents = []

        try:
            if file_ext == '.zip':
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    contents = zip_ref.namelist()

            elif file_ext == '.tar' or file_ext == '.gz' or file_ext == '.tgz' or \
                    file_ext == '.bz2' or file_ext == '.tbz2':
                with tarfile.open(file_path, 'r') as tar_ref:
                    contents = tar_ref.getnames()

            elif file_ext == '.rar':
                with rarfile.RarFile(file_path, 'r') as rar_ref:
                    contents = [f.filename for f in rar_ref.infolist()]

            elif file_ext == '.7z':
                with py7zr.SevenZipFile(file_path, mode='r') as zip_ref:
                    contents = [f.filename for f in zip_ref.getnames()]

        except Exception:
            pass

        return contents

    async def get_file_count(self, file_path: str) -> int:
        """Get number of files in archive"""
        contents = await self.list_archive_contents(file_path)
        return len(contents)