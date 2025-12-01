import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime

from models.document import Annotation

class AnnotationService:
    def __init__(self):
        self.annotations: Dict[str, Annotation] = {}
        self.document_annotations: Dict[str, List[str]] = {}
    
    async def create_annotation(self, document_id: str, annotation_data: dict) -> Annotation:
        """Create a new annotation"""
        annotation = Annotation(
            document_id=document_id,
            page_number=annotation_data.get('page_number', 1),
            annotation_type=annotation_data.get('type', 'highlight'),
            content=annotation_data.get('content', ''),
            coordinates=annotation_data.get('coordinates', {}),
            style=annotation_data.get('style', {}),
            created_by=annotation_data.get('created_by', 'anonymous')
        )
        
        self.annotations[annotation.id] = annotation
        
        if document_id not in self.document_annotations:
            self.document_annotations[document_id] = []
        self.document_annotations[document_id].append(annotation.id)
        
        return annotation
    
    async def get_annotations(self, document_id: str, page: Optional[int] = None) -> List[Annotation]:
        """Get annotations for document or specific page"""
        if document_id not in self.document_annotations:
            return []
        
        annotation_ids = self.document_annotations[document_id]
        annotations = [self.annotations[aid] for aid in annotation_ids if aid in self.annotations]
        
        if page is not None:
            annotations = [a for a in annotations if a.page_number == page]
        
        return annotations
    
    async def update_annotation(self, annotation_id: str, annotation_data: dict) -> Optional[Annotation]:
        """Update an annotation"""
        if annotation_id not in self.annotations:
            return None
        
        annotation = self.annotations[annotation_id]
        
        if 'content' in annotation_data:
            annotation.content = annotation_data['content']
        if 'coordinates' in annotation_data:
            annotation.coordinates = annotation_data['coordinates']
        if 'style' in annotation_data:
            annotation.style = annotation_data['style']
        
        annotation.updated_at = datetime.now()
        
        return annotation
    
    async def delete_annotation(self, annotation_id: str) -> bool:
        """Delete an annotation"""
        if annotation_id not in self.annotations:
            return False
        
        annotation = self.annotations[annotation_id]
        document_id = annotation.document_id
        
        # Remove from annotations
        del self.annotations[annotation_id]
        
        # Remove from document annotations
        if document_id in self.document_annotations:
            self.document_annotations[document_id] = [
                aid for aid in self.document_annotations[document_id] 
                if aid != annotation_id
            ]
        
        return True