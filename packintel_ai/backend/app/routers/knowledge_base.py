import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.schemas.document import (
    DocumentUploadResponse,
    DocumentListResponse,
    DocumentMeta,
    KnowledgeBaseStatus,
    KBSearchRequest,
)
from app.services.document_service import (
    upload_document,
    delete_document,
    get_documents,
    search_documents,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/knowledge-base", tags=["knowledge-base"])

# Ensure upload directory exists
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_kb_document(
    file: UploadFile = File(...),
    description: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Upload a document to the knowledge base."""

    # Validate file type
    valid_types = {"pdf", "txt", "csv", "json"}
    file_ext = file.filename.split(".")[-1].lower() if file.filename else ""

    if file_ext not in valid_types:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid file type. Supported: {', '.join(valid_types)}",
        )

    if file.size and file.size > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max: {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    try:
        # Save uploaded file temporarily
        temp_path = Path(settings.UPLOAD_DIR) / file.filename
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Process document
        doc = await upload_document(
            db=db,
            file_path=temp_path,
            file_type=file_ext,
            original_filename=file.filename,
            description=description,
        )

        return {
            "document_id": doc.id,
            "filename": doc.filename,
            "status": doc.status,
            "message": f"Document processing: {doc.status}",
        }

    except Exception as e:
        logger.error(f"Upload failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List knowledge base documents."""
    offset = (page - 1) * limit
    docs, total = await get_documents(db, status=status, limit=limit, offset=offset)

    return {
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "original_name": d.original_name,
                "file_type": d.file_type,
                "file_size_bytes": d.file_size_bytes,
                "status": d.status,
                "chunk_count": d.chunk_count,
                "uploaded_at": d.uploaded_at,
                "indexed_at": d.indexed_at,
                "error_message": d.error_message,
                "description": d.description,
            }
            for d in docs
        ],
        "total": total,
    }


@router.delete("/documents/{doc_id}")
async def delete_kb_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a document from the knowledge base."""
    success = await delete_document(db, doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "message": "Document deleted"}


@router.post("/search")
async def search_kb(
    payload: Optional[KBSearchRequest] = None,
    query: Optional[str] = Query(None),
    top_k: int = Query(10, ge=1, le=50),
):
    """Search the knowledge base."""
    search_query = (payload.query if payload and payload.query else query) or ""
    search_query = search_query.strip()
    if not search_query:
        raise HTTPException(status_code=422, detail="Search query is required.")
    search_top_k = payload.top_k if (payload and payload.top_k is not None) else top_k
    results = await search_documents(search_query, top_k=search_top_k)
    return {
        "query": search_query,
        "results": results,
        "total": len(results),
    }


@router.get("/status", response_model=KnowledgeBaseStatus)
async def kb_status(db: AsyncSession = Depends(get_db)):
    """Get knowledge base status."""
    docs, total = await get_documents(db, status="indexed")
    total_chunks = sum(d.chunk_count for d in docs)
    latest_doc = docs[0] if docs else None

    return {
        "total_documents": total,
        "total_chunks": total_chunks,
        "last_updated": latest_doc.indexed_at if latest_doc else None,
        "qdrant_healthy": True,  # TODO: Add real health check
    }
