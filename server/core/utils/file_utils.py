# core/utils/file_utils.py
import os
import magic
from pathlib import Path

def get_mime_type(file_path: str) -> str:
    """Get MIME type of a file using python-magic"""
    try:
        mime = magic.Magic(mime=True)
        return mime.from_file(file_path)
    except Exception:
        return 'application/octet-stream'

def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable format"""
    if size_bytes == 0:
        return "0 B"
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    return f"{size_bytes:.2f} {size_names[i]}"

def get_file_extension(file_path: str) -> str:
    """Get lowercase file extension with dot"""
    return Path(file_path).suffix.lower()
