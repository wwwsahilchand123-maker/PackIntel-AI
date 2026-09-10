from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from enum import Enum
from app.schemas.material import MaterialDetail


class FoodCategory(str, Enum):
    fresh_produce = "fresh_produce"
    dairy = "dairy"
    bakery = "bakery"
    meat = "meat"
    frozen = "frozen"
    dry_goods = "dry_goods"
    beverages = "beverages"
    processed = "processed"
    other = "other"


class SustainabilityPreference(str, Enum):
    none = "none"
    low = "low"
    medium = "medium"
    high = "high"


class RecommendRequest(BaseModel):
    food_commodity: str = Field(..., min_length=2, max_length=200)
    food_category: Optional[FoodCategory] = None
    moisture_sensitivity: float = Field(..., ge=0, le=10)
    oxygen_sensitivity: float = Field(..., ge=0, le=10)
    temperature_min: float = Field(..., ge=-40, le=200)
    temperature_max: float = Field(..., ge=-40, le=200)
    humidity_min: Optional[float] = Field(None, ge=0, le=100)
    humidity_max: Optional[float] = Field(None, ge=0, le=100)
    shelf_life_days: int = Field(..., ge=1, le=3650)
    sustainability_preference: SustainabilityPreference = SustainabilityPreference.none
    special_requirements: Optional[str] = Field(None, max_length=1000)
    demo_mode: Optional[bool] = None

    @field_validator("temperature_max")
    @classmethod
    def temp_max_gt_min(cls, v: float, info) -> float:
        if "temperature_min" in info.data and v <= info.data["temperature_min"]:
            raise ValueError("temperature_max must be greater than temperature_min")
        return v


class ScoreBreakdown(BaseModel):
    moisture_score: float
    oxygen_score: float
    temperature_score: float
    shelf_life_score: float
    sustainability_score: float
    rag_relevance_score: float
    penalties_applied: List[str]
    final_score: float
    weights_used: dict


class ExplanationBlock(BaseModel):
    type: str
    heading: str
    content: str
    confidence: float


class EvidenceChunk(BaseModel):
    chunk_id: str
    source: str
    content: str
    relevance_score: float
    material_referenced: Optional[str] = None


class RankedMaterial(BaseModel):
    rank: int
    material: MaterialDetail
    compatibility_score: float
    score_label: str
    score_breakdown: ScoreBreakdown


class RecommendationResult(BaseModel):
    material: MaterialDetail
    compatibility_score: float
    score_label: str
    score_breakdown: ScoreBreakdown
    explanation: List[ExplanationBlock]
    evidence: List[EvidenceChunk]
    confidence: float


class RecommendResponse(BaseModel):
    session_id: str
    query_id: str
    food_commodity: str
    recommendation: RecommendationResult
    alternatives: List[RankedMaterial]
    all_materials_ranked: List[RankedMaterial]
    processing_time_ms: int
    mode: str
