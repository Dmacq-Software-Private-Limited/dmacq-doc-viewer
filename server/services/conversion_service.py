import os
import glob
from pathlib import Path
from typing import Optional
import asyncio

from core.utils import command_utils
from config import settings
from core.registry import extensions

class ConversionService:
    def __init__(self):
        self.ensure_directories()
        # Define supported file extensions
        self.OFFICE_EXTS = set(extensions.OFFICE_EXTENSIONS)
        self.TEXT_EXTS = set(extensions.TEXT_EXTENSIONS)
        self.LATEX_EXTS = set(extensions.LATEX_EXTENSIONS)
        self.IMAGE_EXTS = set(extensions.IMAGE_EXTENSIONS)
        self.VIDEO_EXTS = set(extensions.VIDEO_EXTENSIONS)
        self.AUDIO_EXTS = set(extensions.AUDIO_EXTENSIONS)
        self.FONT_EXTS = set(extensions.FONT_EXTENSIONS)

    def ensure_directories(self):
        """Ensure required directories for conversions and thumbnails exist."""
        os.makedirs(settings.CONVERTED_DIR, exist_ok=True)
        os.makedirs(settings.THUMBNAILS_DIR, exist_ok=True)
        os.makedirs(os.path.join(settings.CONVERTED_DIR, "pages"), exist_ok=True)

    async def convert_to_pdf(self, file_path: str, document_id: str) -> Optional[str]:
        """
        Converts various document types to PDF using the best available tool.
        Creates a dedicated directory for each conversion.
        """
        output_dir = os.path.join(settings.CONVERTED_DIR, document_id)
        os.makedirs(output_dir, exist_ok=True)

        final_pdf_path = os.path.join(output_dir, f"{document_id}.pdf")
        if os.path.exists(final_pdf_path):
            return final_pdf_path

        file_ext = Path(file_path).suffix.lower()
        cmd = []

        if file_ext in self.OFFICE_EXTS:
            cmd = ["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", output_dir, file_path]
        elif file_ext in self.TEXT_EXTS:
            cmd = ["pandoc", file_path, "-o", final_pdf_path]
        elif file_ext in self.LATEX_EXTS:
            cmd = ["pdflatex", "-output-directory", output_dir, "-jobname", document_id, file_path]
        else:
            cmd = ["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", output_dir, file_path]

        returncode, stdout, stderr = await command_utils.run_command(cmd)

        # Post-processing to ensure the output file has the correct name
        if returncode == 0:
            original_stem = Path(file_path).stem
            generated_pdf_libre = os.path.join(output_dir, f"{original_stem}.pdf")
            generated_pdf_latex = os.path.join(output_dir, f"{document_id}.pdf")

            if os.path.exists(final_pdf_path):
                return final_pdf_path
            elif os.path.exists(generated_pdf_libre):
                os.rename(generated_pdf_libre, final_pdf_path)
                return final_pdf_path
            else:
                return None
        else:
            return None

    async def get_pdf_page_count(self, pdf_path: str) -> int:
        """Gets the total page count of a PDF file using pdfinfo."""
        if not os.path.exists(pdf_path):
            return 0

        cmd = ["pdfinfo", pdf_path]
        returncode, stdout, stderr = await command_utils.run_command(cmd, timeout=30)

        if returncode == 0:
            for line in stdout.splitlines():
                if line.startswith("Pages:"):
                    try:
                        return int(line.split(":")[1].strip())
                    except (ValueError, IndexError):
                        return 0
        return 0

    async def get_document_page_count(self, file_path: str) -> int:
        """Estimates page count for non-PDF documents."""
        file_ext = Path(file_path).suffix.lower()

        if file_ext == '.pdf':
            return await self.get_pdf_page_count(file_path)

        try:
            if file_ext in self.OFFICE_EXTS:
                file_size_kb = os.path.getsize(file_path) / 1024
                estimated_pages = max(1, int(file_size_kb / 20))
                return min(estimated_pages, 200)
            elif file_ext in self.TEXT_EXTS:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = sum(1 for _ in f)
                return max(1, lines // 50)
            else:
                return 1
        except Exception:
            return 1

    async def generate_thumbnail(self, source_path: str, document_id: str) -> Optional[str]:
        """Generates a thumbnail for a given source file."""
        thumbnail_path = os.path.join(settings.THUMBNAILS_DIR, f"{document_id}_thumb.png")
        file_ext = Path(source_path).suffix.lower()
        cmd = []

        if file_ext in self.FONT_EXTS:
            return None

        if file_ext == '.pdf':
            output_prefix = os.path.join(settings.THUMBNAILS_DIR, f"{document_id}_thumb_temp")
            cmd = ["pdftoppm", "-png", "-f", "1", "-l", "1", "-scale-to-x", "400",
                   "-scale-to-y", "-1", source_path, output_prefix]
        elif file_ext in self.IMAGE_EXTS:
            cmd = ["convert", source_path + "[0]", "-thumbnail", "400x400>",
                   "-background", "white", "-alpha", "remove", thumbnail_path]
        elif file_ext in self.VIDEO_EXTS:
            cmd = ["ffmpeg", "-ss", "00:00:01", "-i", source_path, "-vframes", "1",
                   "-q:v", "3", "-y", thumbnail_path]
        elif file_ext in self.AUDIO_EXTS:
            cmd = ["ffmpeg", "-i", source_path, "-filter_complex",
                   "showwavespic=s=400x240:colors=white", "-frames:v", "1", "-y", thumbnail_path]
        else:
            pdf_path = await self.convert_to_pdf(source_path, f"thumb_temp_{document_id}")
            if pdf_path:
                return await self.generate_thumbnail(pdf_path, document_id)
            else:
                return None

        returncode, stdout, stderr = await command_utils.run_command(cmd)

        # Handle PDF thumbnail output
        if file_ext == '.pdf':
            generated_file = f"{output_prefix}-1.png"
            if os.path.exists(generated_file):
                os.rename(generated_file, thumbnail_path)
            else:
                potential_files = glob.glob(f"{output_prefix}*.png")
                if potential_files:
                    os.rename(potential_files[0], thumbnail_path)

        if returncode == 0 and os.path.exists(thumbnail_path):
            return thumbnail_path
        else:
            return None

    async def get_page_as_image(self, source_path: str, page_number: int, document_id: str) -> Optional[str]:
        """Converts a specific page of a document to a PNG image."""
        page_image_dir = os.path.join(settings.CONVERTED_DIR, "pages", document_id)
        os.makedirs(page_image_dir, exist_ok=True)
        page_image_path = os.path.join(page_image_dir, f"page_{page_number}.png")

        if os.path.exists(page_image_path):
            return page_image_path

        file_ext = Path(source_path).suffix.lower()
        pdf_to_process = source_path

        if file_ext != '.pdf':
            converted_pdf_path = await self.convert_to_pdf(source_path, document_id)
            if not converted_pdf_path:
                return None
            pdf_to_process = converted_pdf_path

        output_prefix = os.path.join(page_image_dir, f"page_temp_{page_number}")
        cmd = [
            "pdftoppm", "-png",
            "-f", str(page_number), "-l", str(page_number),
            "-scale-to-x", "1200", "-scale-to-y", "-1",
            pdf_to_process, output_prefix
        ]

        returncode, stdout, stderr = await command_utils.run_command(cmd)

        # Rename generated file
        generated_file_pattern = f"{output_prefix}*.png"
        created_files = glob.glob(generated_file_pattern)
        if created_files:
            os.rename(created_files[0], page_image_path)

        if returncode == 0 and os.path.exists(page_image_path):
            return page_image_path
        else:
            return None