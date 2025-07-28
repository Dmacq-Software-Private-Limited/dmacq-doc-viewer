from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

class DocumentMetadata(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    keywords: Optional[str] = None
    creator: Optional[str] = None
    producer: Optional[str] = None
    creation_date: Optional[datetime] = None
    modification_date: Optional[datetime] = None
    pages: Optional[int] = None
    file_size: Optional[str] = None
    

    language: Optional[str] = None
    lines_of_code: Optional[int] = None
    character_count: Optional[int] = None

    additional_info: Optional[Dict[str, Any]] = {}

class Document(BaseModel):
    id: str
    name: str
    original_name: str
    file_type: str
    size: int
    file_path: str
    converted_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    total_pages: int = 1
    metadata: Optional[DocumentMetadata] = None

    # Plain text/code/comic/database flags
    is_plain_text: bool = False
    is_code_file: bool = False
    is_comic: bool = False
    is_database: bool = False
    
    # Additional type-specific paths/fields
    extracted_path: Optional[str] = None
    database_type: Optional[str] = None
    tags: Optional[List[str]] = []  #Optional tags for categorization

    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

class Annotation(BaseModel):
    id: str = str(uuid.uuid4())
    document_id: str
    page_number: int
    annotation_type: str  # highlight, note, drawing, etc.
    content: Optional[str] = None
    coordinates: Dict[str, float]  # x, y, width, height
    style: Optional[Dict[str, Any]] = {}  # color, opacity, etc.
    created_by: Optional[str] = "anonymous"
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

class Comment(BaseModel):
    id: str = str(uuid.uuid4())
    document_id: str
    page_number: Optional[int] = None
    content: str
    author: str
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    is_edited: bool = False