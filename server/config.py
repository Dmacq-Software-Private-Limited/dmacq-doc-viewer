import os
from pydantic_settings import BaseSettings
from typing import ClassVar , Dict


class Settings(BaseSettings):
        HOST: str = "0.0.0.0"
        PORT: int = 8000
        DEBUG: bool = True

        # File upload settings
        MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
        UPLOAD_DIR: str = "uploads"
        CONVERTED_DIR: str = "converted"
        THUMBNAILS_DIR: str = "thumbnails"


        HANDLER_REGISTRY: Dict[str, str] = {
            # PDF
            '.pdf': 'core.file_handlers.pdf_handler.PdfHandler',

            # Office Documents
            '.doc': 'core.file_handlers.office_handler.OfficeHandler',
            '.docx': 'core.file_handlers.office_handler.OfficeHandler',
            '.odt': 'core.file_handlers.office_handler.OfficeHandler',
            '.rtf': 'core.file_handlers.office_handler.OfficeHandler',

            # Spreadsheets
            '.xls': 'core.file_handlers.office_handler.OfficeHandler',
            '.xlsx': 'core.file_handlers.office_handler.OfficeHandler',
            '.ods': 'core.file_handlers.office_handler.OfficeHandler',
            '.csv': 'core.file_handlers.office_handler.OfficeHandler',
            '.fods': 'core.file_handlers.office_handler.OfficeHandler',
            '.xlsb': 'core.file_handlers.office_handler.OfficeHandler',

            # Presentations
            '.ppt': 'core.file_handlers.office_handler.OfficeHandler',
            '.pptx': 'core.file_handlers.office_handler.OfficeHandler',
            '.odp': 'core.file_handlers.office_handler.OfficeHandler',
            '.ppsx': 'core.file_handlers.office_handler.OfficeHandler',
            '.pps': 'core.file_handlers.office_handler.OfficeHandler',
            '.sxi': 'core.file_handlers.office_handler.OfficeHandler',
            '.fodp': 'core.file_handlers.office_handler.OfficeHandler',

            # Text-based files
            '.txt': 'core.file_handlers.text_handler.TextHandler',
            '.md': 'core.file_handlers.text_handler.TextHandler',
            '.html': 'core.file_handlers.text_handler.TextHandler',
            '.htm': 'core.file_handlers.text_handler.TextHandler',
            '.xml': 'core.file_handlers.text_handler.TextHandler',
            '.json': 'core.file_handlers.text_handler.TextHandler',
            '.yaml': 'core.file_handlers.text_handler.TextHandler',
            '.yml': 'core.file_handlers.text_handler.TextHandler',
            '.ini': 'core.file_handlers.text_handler.TextHandler',
            '.cfg': 'core.file_handlers.text_handler.TextHandler',
            '.conf': 'core.file_handlers.text_handler.TextHandler',
            '.log': 'core.file_handlers.text_handler.TextHandler',
            '.py': 'core.file_handlers.text_handler.TextHandler',
            '.js': 'core.file_handlers.text_handler.TextHandler',
            '.java': 'core.file_handlers.text_handler.TextHandler',
            '.c': 'core.file_handlers.text_handler.TextHandler',
            '.cpp': 'core.file_handlers.text_handler.TextHandler',
            '.cs': 'core.file_handlers.text_handler.TextHandler',
            '.go': 'core.file_handlers.text_handler.TextHandler',
            '.rb': 'core.file_handlers.text_handler.TextHandler',
            '.php': 'core.file_handlers.text_handler.TextHandler',
            '.swift': 'core.file_handlers.text_handler.TextHandler',
            '.kt': 'core.file_handlers.text_handler.TextHandler',
            '.dart': 'core.file_handlers.text_handler.TextHandler',
            '.h': 'core.file_handlers.text_handler.TextHandler',
            '.hpp': 'core.file_handlers.text_handler.TextHandler',

            # Images
            '.jpg': 'core.file_handlers.image_handler.ImageHandler',
            '.jpeg': 'core.file_handlers.image_handler.ImageHandler',
            '.jpe': 'core.file_handlers.image_handler.ImageHandler',
            '.jfif': 'core.file_handlers.image_handler.ImageHandler',
            '.jps': 'core.file_handlers.image_handler.ImageHandler',
            '.png': 'core.file_handlers.image_handler.ImageHandler',
            '.bmp': 'core.file_handlers.image_handler.ImageHandler',
            '.gif': 'core.file_handlers.image_handler.ImageHandler',
            '.webp': 'core.file_handlers.image_handler.ImageHandler',
            '.tif': 'core.file_handlers.image_handler.ImageHandler',
            '.tiff': 'core.file_handlers.image_handler.ImageHandler',
            '.heif': 'core.file_handlers.image_handler.ImageHandler',
            '.heic': 'core.file_handlers.image_handler.ImageHandler',
            '.avif': 'core.file_handlers.image_handler.ImageHandler',
            '.ico': 'core.file_handlers.image_handler.ImageHandler',
            '.dds': 'core.file_handlers.image_handler.ImageHandler',
            '.svg': 'core.file_handlers.image_handler.ImageHandler',
            '.ai': 'core.file_handlers.image_handler.ImageHandler',
            '.eps': 'core.file_handlers.image_handler.ImageHandler',
            '.cdr': 'core.file_handlers.image_handler.ImageHandler',
            '.psd': 'core.file_handlers.image_handler.ImageHandler',
            '.sketch': 'core.file_handlers.image_handler.ImageHandler',
            '.xcf': 'core.file_handlers.image_handler.ImageHandler',
            '.cur': 'core.file_handlers.image_handler.ImageHandler',
            '.dng': 'core.file_handlers.image_handler.ImageHandler',
            '.raw': 'core.file_handlers.image_handler.ImageHandler',
            '.exr': 'core.file_handlers.image_handler.ImageHandler',
            '.hdr': 'core.file_handlers.image_handler.ImageHandler',
            '.pam': 'core.file_handlers.image_handler.ImageHandler',
            '.pbm': 'core.file_handlers.image_handler.ImageHandler',
            '.pcd': 'core.file_handlers.image_handler.ImageHandler',
            '.pcx': 'core.file_handlers.image_handler.ImageHandler',
            '.pgm': 'core.file_handlers.image_handler.ImageHandler',
            '.pict': 'core.file_handlers.image_handler.ImageHandler',
            '.pnm': 'core.file_handlers.image_handler.ImageHandler',
            '.ppm': 'core.file_handlers.image_handler.ImageHandler',
            '.ras': 'core.file_handlers.image_handler.ImageHandler',
            '.sgi': 'core.file_handlers.image_handler.ImageHandler',
            '.tga': 'core.file_handlers.image_handler.ImageHandler',
            '.xbm': 'core.file_handlers.image_handler.ImageHandler',
            '.xpm': 'core.file_handlers.image_handler.ImageHandler',
            '.xwd': 'core.file_handlers.image_handler.ImageHandler',
            '.picon': 'core.file_handlers.image_handler.ImageHandler',

            # Video
            '.mp4': 'core.file_handlers.video_handler.VideoHandler',
            '.mov': 'core.file_handlers.video_handler.VideoHandler',
            '.avi': 'core.file_handlers.video_handler.VideoHandler',
            '.mkv': 'core.file_handlers.video_handler.VideoHandler',
            '.webm': 'core.file_handlers.video_handler.VideoHandler',
            '.flv': 'core.file_handlers.video_handler.VideoHandler',
            '.wmv': 'core.file_handlers.video_handler.VideoHandler',

            # Audio
            '.mp3': 'core.file_handlers.audio_handler.AudioHandler',
            '.wav': 'core.file_handlers.audio_handler.AudioHandler',
            '.aac': 'core.file_handlers.audio_handler.AudioHandler',
            '.flac': 'core.file_handlers.audio_handler.AudioHandler',
            '.ogg': 'core.file_handlers.audio_handler.AudioHandler',
            '.m4a': 'core.file_handlers.audio_handler.AudioHandler',

            # 3D Models
            '.obj': 'core.file_handlers.model3d_handler.Model3DHandler',
            '.stl': 'core.file_handlers.model3d_handler.Model3DHandler',
            '.glb': 'core.file_handlers.model3d_handler.Model3DHandler',
            '.gltf': 'core.file_handlers.model3d_handler.Model3DHandler',
            '.3ds': 'core.file_handlers.model3d_handler.Model3DHandler',

            # Fonts
            '.otf': 'core.file_handlers.font_handler.FontHandler',
            '.ttf': 'core.file_handlers.font_handler.FontHandler',
            '.woff': 'core.file_handlers.font_handler.FontHandler',
            '.woff2': 'core.file_handlers.font_handler.FontHandler',
            '.eot': 'core.file_handlers.font_handler.FontHandler',

            # Email
            '.msg': 'core.file_handlers.email_handler.EmailHandler',
            '.eml': 'core.file_handlers.email_handler.EmailHandler',

            #archive
            '.zip': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.tar': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.gz': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.tgz': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.bz2': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.tbz2': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.rar': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.7z': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.xz': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.iso': 'core.file_handlers.archive_handler.ArchiveHandler',
            '.dmg': 'core.file_handlers.archive_handler.ArchiveHandler',
            #misc
            
            '.outlook': 'core.file_handlers.misc_handler.MiscHandler',
            '.mht': 'core.file_handlers.misc_handler.MiscHandler',
            '.pes': 'core.file_handlers.misc_handler.MiscHandler',
            '.pfm': 'core.file_handlers.misc_handler.MiscHandler',
            '.picon': 'core.file_handlers.misc_handler.MiscHandler',
            '.mpp': 'core.file_handlers.misc_handler.MiscHandler',

            # Default fallback
            '.default': 'core.file_handlers.default_handler.DefaultHandler'
        }

        # Supported file types - ONLY the ones you specified
        SUPPORTED_EXTENSIONS: ClassVar[set[str]] = {
        #docs 
        '.pdf', '.doc', '.docx', '.odt', '.sxw', '.fodt', '.rtf',
        '.txt', '.md', '.tex', '.abw', '.msg', '.eml',
        # Spreadsheets
        '.xls', '.xlsx', '.ods', '.fods', '.csv',
        # Presentations
        '.ppt', '.pptx', '.pps', '.ppsx', '.odp', '.fodp', '.sxi',
        # Images (Raster & Vector)
        '.jpg', '.jpeg', '.jpe', '.jfif', '.jps', '.png', '.bmp',
        '.gif', '.webp', '.tif', '.tiff', '.heif', '.heic', '.avif',
        '.ico', '.dds', '.svg', '.ai', '.eps', '.cdr', '.psd','.picon'
        '.sketch', '.xcf',
        # Other Image Formats
        '.cur', '.dng', '.raw', '.exr', '.hdr', '.pam', '.pbm', '.pcd', '.pcx', '.pgm', '.pict', '.pnm', '.ppm', '.psd', '.ras', '.sgi', '.tga', '.xbm', '.xpm', '.xwd',
        # Audio
        '.mp3', '.wav', '.aac', '.m4a',
        #video
        '.mp4', '.mkv', '.mov', '.webm',
                # Ebooks
        '.lit', '.azw', '.azw3', '.fb2',
        # Comics
        '.cbr', '.cbz',
        # Databases
        '.mdb', '.accdb', '.sqlite', '.db', '.dbf', '.ndf', '.ldf',
        # Fonts
        '.otf', '.ttf', '.woff', '.woff2', '.eot',
        # Game / Misc files
        '.pak', '.wad', '.sav', '.mdx', '.rom',

        # Archives
        '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.tbz2', '.xz', '.iso', '.dmg',

        '.mp4', '.mkv', '.mov', '.webm', # Video
        '.obj', '.glb', '.gltf', '.stl', '.3ds'
        #config/Data
        '.xsd', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.log', '.bak', '.tmp',
        # Miscellaneous
        '.mpp','.msg','eml','.outlook', '.mht', '.pes', '.pfm',

        #Code & Markup
        '.html', '.xhtml', '.xht', '.mhtml', '.css', '.js', '.php', '.xml', '.json',
        '.ts', '.tsx', '.c', '.cpp', '.java', '.py', '.rb', '.go', '.cs',
        '.swift', '.vb', '.pl', '.r', '.jl', '.kt', '.dart', '.h', '.hpp'


        

    }

        SUPPORTED_MIME_TYPES: ClassVar[set[str]] = {

        #pdf
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.text',
        'text/plain',
        'text/markdown',
        'application/x-tex',
        'application/rtf',
        'application/vnd.ms-outlook',
        'message/rfc822',    
        # Spreadsheets
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet',
        'text/csv',
        # Presentations
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.presentation',
        # Images
        'image/jpeg', 'image/png', 'image/bmp', 'image/gif',
        'image/webp', 'image/tiff', 'image/svg+xml',
        'image/x-icon', 'image/x-adobe-dng', 'image/x-raw', 'image/x-exr', 'image/vnd.radiance',
        'image/x-portable-anymap', 'image/x-photo-cd', 'image/x-pcx', 'image/x-pict',
        'image/vnd.adobe.photoshop', 'image/x-cmu-raster', 'image/x-sgi', 'image/x-tga',
        'image/x-xbitmap', 'image/x-xpixmap', 'image/x-xwindowdump',
        #audio
        'audio/mpeg', 'audio/wav', 'audio/aac',
        #video
        'video/mp4', 'video/x-matroska', 'video/quicktime', 'video/webm',
        # Fonts
        'font/otf', 'font/ttf', 'font/woff', 'font/woff2', 'application/vnd.ms-fontobject',
        # Game / Misc files (generic binary types)
        # Ebooks
        'application/x-ms-reader', # .lit
        'application/vnd.amazon.ebook', # .azw, .azw3
        'application/x-mobipocket-ebook', # .azw, .azw3 (alternative for mobi which azw is based on)
        'application/x-fictionbook+xml', # .fb2
        # Comics
        'application/vnd.comicbook+rar', # .cbr (official would be application/x-cbr)
        'application/x-cbr',
        'application/vnd.comicbook+zip', # .cbz (official would be application/x-cbz)
        'application/x-cbz',
        'application/zip', # Often used for .cbz
        'application/x-rar-compressed', # Often used for .cbr
        # Databases
        'application/vnd.ms-access',  # .mdb, .accdb
        'application/x-sqlite3',  # .sqlite, .db
        'application/vnd.sqlite3', # .sqlite, .db (alternative)
        'application/x-dbf',  # .dbf
        'application/octet-stream', # Generic fallback for .ndf, .ldf, and sometimes others if specific types aren't recognized
        'application/octet-stream'

        'font/otf', 'font/ttf', 'font/woff', 'font/woff2', 'application/vnd.ms-fontobject'

        #3d
        'model/obj', 'model/gltf+json', 'model/stl', 'model/gltf-binary','model/3ds'
        # New Config/Data MIME Types
        'application/xml', 'text/xml', 'application/x-yaml', 'text/yaml', 'application/toml',
        #other
        "application/vnd.ms-project",
        "application/vnd.ms-outlook",
        "message/rfc822",
        "multipart/related", # For .mht
        "image/x-picon",
        
        # Code & Markup (added below)
        'text/html', 'application/xhtml+xml', 'application/xml', 'application/json',
        'text/css', 'application/javascript', 'text/javascript', 'application/x-php',
        'application/typescript', 'text/tsx', 'text/x-c', 'text/x-c++src', 'text/x-java-source',
        'text/x-python', 'application/x-ruby', 'text/x-go', 'text/x-csharp', 'application/swift',
        'text/vbscript', 'application/x-perl', 'application/r', 'application/julia',
        'text/x-kotlin', 'application/dart', 'text/x-h', 'text/x-hpp',


    }


class Config:
        env_file = ".env"

settings = Settings()

# Phase 0: Preparation (Safe changes)
#
# Phase 1: Core Interfaces & Registry
#
# Phase 2: Handler Implementations
#
# Phase 3: Service Refactoring
#
# Phase 4: Integration & Testing
