from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from app.schemas.material import MaterialDetail
from app.schemas.recommendation import RecommendRequest


class CompareRequest(BaseModel):
    material_ids: List[str] = Field(..., min_length=2, max_length=5)
    food_commodity: Optional[str] = None
    food_properties: Optional[RecommendRequest] = None
    demo_mode: Optional[bool] = None


class PropertyMatrix(BaseModel):
    properties: List[str]
    data: Dict[str, Dict[str, float]]


class RadarDataPoint(BaseModel):
    property: str
    values: Dict[str, float]


class CompareResponse(BaseModel):
    comparison_id: str
    materials: List[MaterialDetail]
    comparison_matrix: PropertyMatrix
    radar_data: List[RadarDataPoint]
    winner_by_property: Dict[str, str]
    overall_ranking: List[dict]
