import logging
import shutil
import uuid
from pathlib import Path
from typing import Optional, List
import hashlib

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.document import Document
from app.utils.file_parser import parse_file, FileParseError
from app.utils.chunker import chunk_text
from app.rag.vector_store import get_vector_store, DOCUMENTS_COLLECTION
from app.rag.embedder import embed_texts

logger = logging.getLogger(__name__)


async def upload_document(
    db: AsyncSession,
    file_path: Path,
    file_type: str,
    original_filename: str,
    description: Optional[str] = None,
    session_id: Optional[str] = None,
) -> Document:
    """
    Upload and process a document.
    1. Save to disk
    2. Parse content
    3. Chunk text
    4. Embed chunks
    5. Index in Qdrant
    6. Save metadata to SQLite
    """
    logger.info(f"Starting document upload: {original_filename}")

    doc_id = str(uuid.uuid4())
    file_size = file_path.stat().st_size

    # Create database record (initially pending)
    doc = Document(
        id=doc_id,
        filename=file_path.name,
        original_name=original_filename,
        file_type=file_type,
        file_size_bytes=file_size,
        status="processing",
        description=description,
        session_id=session_id,
    )
    db.add(doc)
    await db.flush()

    try:
        # Parse file
        logger.info(f"Parsing {file_type} file...")
        full_text = parse_file(file_path, file_type)
        if not full_text:
            raise FileParseError("File parsed but no content extracted")

        # Chunk text
        logger.info("Chunking text...")
        chunks = chunk_text(full_text)
        if not chunks:
            raise FileParseError("No chunks created from content")

        # Embed chunks
        logger.info(f"Embedding {len(chunks)} chunks...")
        vectors = embed_texts(chunks)

        # Prepare points for Qdrant
        qdrant_ids = []
        points = []
        for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
            chunk_id = f"{doc_id}_{i}"
            qdrant_ids.append(chunk_id)
            points.append({
                "id": int(hashlib.md5(chunk_id.encode()).hexdigest()[:8], 16),
                "vector": vector,
                "payload": {
                    "doc_id": doc_id,
                    "document_name": original_filename,
                    "chunk_index": i,
                    "chunk_text": chunk,
                    "file_type": file_type,
                    "source_type": "user_document",
                },
            })

        # Index in Qdrant
        vector_store = get_vector_store()
        if vector_store.available:
            logger.info("Indexing chunks in Qdrant...")
            vector_store.create_collection_if_not_exists(DOCUMENTS_COLLECTION)
            vector_store.upsert_points(DOCUMENTS_COLLECTION, points)
            logger.info(f"Indexed {len(points)} points in Qdrant")

        # Update document record
        doc.status = "indexed"
        doc.chunk_count = len(chunks)
        doc.qdrant_ids = ",".join(qdrant_ids)
        await db.commit()

        logger.info(f"Document upload complete: {doc_id} ({len(chunks)} chunks)")
        return doc

    except Exception as e:
        logger.error(f"Document processing failed: {e}", exc_info=True)
        doc.status = "failed"
        doc.error_message = str(e)
        await db.commit()
        raise


async def delete_document(
    db: AsyncSession,
    document_id: str,
) -> bool:
    """Delete a document and its indexed chunks."""
    logger.info(f"Deleting document: {document_id}")

    # Fetch document
    result = await db.execute(
        select(Document).where(Document.id == document_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        return False

    try:
        # Delete from Qdrant
        if doc.qdrant_ids:
            vector_store = get_vector_store()
            if vector_store.available:
                qdrant_ids = doc.qdrant_ids.split(",")
                vector_store.delete_points(DOCUMENTS_COLLECTION, qdrant_ids)
                logger.info(f"Deleted {len(qdrant_ids)} points from Qdrant")

        # Delete from disk
        file_path = Path(settings.UPLOAD_DIR) / doc.filename
        if file_path.exists():
            file_path.unlink()
            logger.info(f"Deleted file: {file_path}")

        # Delete from database
        await db.delete(doc)
        await db.commit()
        logger.info(f"Document deleted: {document_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to delete document: {e}", exc_info=True)
        return False


async def get_documents(
    db: AsyncSession,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[List[Document], int]:
    """Get documents with optional filtering."""
    query = select(Document)
    if status:
        query = query.where(Document.status == status)

    result = await db.execute(query)
    total = len(result.fetchall())

    query = select(Document)
    if status:
        query = query.where(Document.status == status)
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    docs = result.scalars().all()
    return list(docs), total


async def search_documents(
    query_text: str,
    top_k: int = 10,
) -> List[dict]:
    """Search documents using vector search."""
    from app.rag.embedder import embed_single

    try:
        vector_store = get_vector_store()
        if not vector_store.available:
            return []

        # Embed query
        query_vector = embed_single(query_text)

        # Search
        results = vector_store.search(
            collection_name=DOCUMENTS_COLLECTION,
            query_vector=query_vector,
            top_k=top_k,
        )

        # Format results
        formatted = []
        for r in results:
            payload = r.get("payload", {})
            formatted.append({
                "doc_id": payload.get("doc_id"),
                "document_name": payload.get("document_name"),
                "chunk_index": payload.get("chunk_index"),
                "chunk_text": payload.get("chunk_text", "")[:300],  # Preview
                "score": r["score"],
            })

        return formatted

    except Exception as e:
        logger.error(f"Document search failed: {e}")
        return []
