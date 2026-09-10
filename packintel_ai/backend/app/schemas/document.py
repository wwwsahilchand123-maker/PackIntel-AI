from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class KBSearchRequest(BaseModel):
    query: str
    top_k: int = 10


class DocumentMeta(BaseModel):
    id: str
    filename: str
    original_name: Optional[str] = None
    file_type: str
    file_size_bytes: Optional[int] = None
    status: str
    chunk_count: int
    uploaded_at: datetime
    indexed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    message: str


class DocumentListResponse(BaseModel):
    documents: List[DocumentMeta]
    total: int


class KnowledgeBaseStatus(BaseModel):
    total_documents: int
    total_chunks: int
    last_updated: Optional[datetime]
    qdrant_healthy: bool
