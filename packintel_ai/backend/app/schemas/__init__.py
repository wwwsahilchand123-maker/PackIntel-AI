from app.schemas.recommendation import RecommendRequest, RecommendResponse
from app.schemas.material import MaterialDetail, MaterialListResponse
from app.schemas.document import DocumentMeta, DocumentUploadResponse
from app.schemas.compare import CompareRequest, CompareResponse
from app.schemas.simulator import SimulateRequest, SimulateResponse

__all__ = [
    "RecommendRequest", "RecommendResponse",
    "MaterialDetail", "MaterialListResponse",
    "DocumentMeta", "DocumentUploadResponse",
    "CompareRequest", "CompareResponse",
    "SimulateRequest", "SimulateResponse",
]
