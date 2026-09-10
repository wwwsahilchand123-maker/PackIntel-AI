import logging
from typing import List
import numpy as np

logger = logging.getLogger(__name__)

_model = None


def get_embedder():
    """Lazy-load the sentence transformer model."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            from app.core.config import settings
            logger.info(f"Loading embedder model: {settings.EMBEDDER_MODEL}")
            _model = SentenceTransformer(settings.EMBEDDER_MODEL)
            logger.info("Embedder model loaded successfully.")
        except ImportError:
            logger.warning("sentence-transformers not installed. Using demo embedder.")
            _model = DemoEmbedder()
        except Exception as e:
            logger.warning(f"Failed to load embedder: {e}. Using demo embedder.")
            _model = DemoEmbedder()
    return _model


class DemoEmbedder:
    """Deterministic demo embedder that works without sentence-transformers."""

    def encode(self, texts: List[str], **kwargs) -> np.ndarray:
        vectors = []
        for text in texts:
            vec = self._text_to_vector(text)
            vectors.append(vec)
        return np.array(vectors, dtype=np.float32)

    def _text_to_vector(self, text: str, dim: int = 384) -> np.ndarray:
        """Create a deterministic pseudo-embedding from text."""
        np.random.seed(abs(hash(text)) % (2**31))
        vec = np.random.randn(dim).astype(np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Embed a list of texts and return as list of float lists."""
    model = get_embedder()
    vectors = model.encode(texts, show_progress_bar=False)
    return vectors.tolist()


def embed_single(text: str) -> List[float]:
    """Embed a single text string."""
    return embed_texts([text])[0]
