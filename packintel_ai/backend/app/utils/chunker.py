import logging
from typing import List

logger = logging.getLogger(__name__)

CHUNK_SIZE = 400  # tokens (rough estimate: ~4 chars per token)
CHUNK_OVERLAP = 50


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Split text into overlapping chunks.
    Tries to break at sentence boundaries.

    Args:
        text: Full text to chunk
        chunk_size: Target size per chunk (characters)
        overlap: Overlap between chunks (characters)

    Returns:
        List of text chunks
    """
    if not text or len(text.strip()) == 0:
        return []

    # Split by sentences (simple approach)
    sentences = text.replace("\n", " ").split(". ")
    if not sentences:
        sentences = [text]

    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if not sentence.strip():
            continue

        # Add period back if it was removed
        sentence_with_period = sentence.strip() + "."
        test_chunk = current_chunk + " " + sentence_with_period if current_chunk else sentence_with_period

        if len(test_chunk) <= chunk_size:
            current_chunk = test_chunk
        else:
            # Chunk is full, save it and start new one
            if current_chunk:
                chunks.append(current_chunk.strip())
                # Create overlap by keeping last part of previous chunk
                current_chunk = sentence_with_period

            # If single sentence is too long, force-split it
            if len(sentence_with_period) > chunk_size:
                # Split long sentence into smaller pieces
                words = sentence_with_period.split()
                word_chunk = ""
                for word in words:
                    if len(word_chunk) + len(word) + 1 <= chunk_size:
                        word_chunk += " " + word if word_chunk else word
                    else:
                        if word_chunk:
                            chunks.append(word_chunk)
                        word_chunk = word

                if word_chunk:
                    current_chunk = word_chunk
                else:
                    current_chunk = ""

    # Don't forget last chunk
    if current_chunk:
        chunks.append(current_chunk.strip())

    # Remove duplicates and very short chunks
    chunks = [c for c in chunks if len(c.strip()) > 20]
    chunks = list(dict.fromkeys(chunks))  # Remove duplicates while preserving order

    logger.info(f"Created {len(chunks)} chunks from text ({len(text)} chars)")
    return chunks
