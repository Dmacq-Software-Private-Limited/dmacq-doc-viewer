# core/registry/extensions.py
# Consolidated extension groups from all services

PDF_EXTENSIONS = ['.pdf']

OFFICE_DOC_EXTENSIONS = [
    '.doc', '.docx', '.odt', '.sxw', '.fodt', '.rtf', '.abw'
]

OFFICE_SHEET_EXTENSIONS = [
    '.xls', '.xlsx', '.ods', '.fods', '.csv','.xlsb'
]

OFFICE_PRESENTATION_EXTENSIONS = [
    '.ppt', '.pptx', '.pps', '.ppsx', '.odp', '.fodp', '.sxi'
]

TEXT_EXTENSIONS = ['.txt', '.md']

LATEX_EXTENSIONS = ['.tex']

EMAIL_EXTENSIONS = ['.msg', '.eml']

IMAGE_EXTENSIONS = [
    '.jpg', '.jpeg', '.jpe', '.jfif', '.jps', '.png', '.bmp', '.gif', '.webp',
    '.tif', '.tiff', '.heif', '.heic', '.avif', '.ico', '.dds', '.svg', '.cur', '.pam','.picon'
]

AUDIO_EXTENSIONS = [
    '.mp3', '.wav', '.aac', '.flac', '.ogg', '.oga', '.opus', '.m4a', '.aiff',
    '.wma', '.au'
]

VIDEO_EXTENSIONS = [
    '.mp4', '.mov', '.avi', '.mkv', '.flv', '.webm', '.wmv', '.mts', '.m2ts',
    '.vob', '.3gp', '.3gp2', '.mpeg', '.mpg', '.mpe'
]

FONT_EXTENSIONS = ['.otf', '.ttf', '.woff', '.woff2', '.eot']

FALLBACK_EXTENSIONS = [
    '.pak', '.wad', '.sav', '.rom', '.tmp', '.bak', '.pfm', '.pes', '.picon',
    '.mpp', '.outlook', '.mht'
]

THREED_EXTENSIONS = ['.obj', '.stl', '.glb', '.gltf', '.3ds']

CODE_EXTENSIONS = [
    '.html', '.xhtml', '.xht', '.mhtml', '.css', '.js', '.php', '.xml', '.json',
    '.ts', '.tsx', '.c', '.cpp', '.java', '.py', '.rb', '.go', '.cs', '.swift',
    '.vb', '.pl', '.r', '.jl', '.kt', '.dart', '.h', '.hpp'
]

CONFIG_DATA_EXTENSIONS = [
    '.xsd', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.log'
]
MISC_EXTENSIONS =['.outlook', '.mht', '.pes', '.pfm', '.picon', '.mpp']

ARCHIVE_EXTENSIONS = [
    '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.tbz2', '.xz', '.iso', '.dmg'
]

# Composite groups
OFFICE_EXTENSIONS = (
        OFFICE_DOC_EXTENSIONS +
        OFFICE_SHEET_EXTENSIONS +
        OFFICE_PRESENTATION_EXTENSIONS
)

PLAIN_TEXT_EXTENSIONS = (
        TEXT_EXTENSIONS +
        CODE_EXTENSIONS +
        CONFIG_DATA_EXTENSIONS
)

# All supported extensions (from config.py)
SUPPORTED_EXTENSIONS = {
    *PDF_EXTENSIONS,
    *OFFICE_EXTENSIONS,
    *EMAIL_EXTENSIONS,
    *IMAGE_EXTENSIONS,
    *AUDIO_EXTENSIONS,
    *VIDEO_EXTENSIONS,
    *FONT_EXTENSIONS,
    *FALLBACK_EXTENSIONS,
    *THREED_EXTENSIONS,
    *CODE_EXTENSIONS,
    *CONFIG_DATA_EXTENSIONS,
    *ARCHIVE_EXTENSIONS,
    *MISC_EXTENSIONS
}
