from pydantic import BaseModel
from typing import Optional, List
from app.schemas.recommendation import RecommendRequest, RankedMaterial


class SimulateRequest(BaseModel):
    base_query_id: Optional[str] = None
    food_commodity: str
    conditions: RecommendRequest
    demo_mode: Optional[bool] = None


class DeltaResult(BaseModel):
    previous_top_material: str
    new_top_material: str
    score_change: float
    changed: bool
    summary: str


class SimulateResponse(BaseModel):
    simulation_id: str
    results: List[RankedMaterial]
    delta_from_base: Optional[DeltaResult] = None
    processing_time_ms: int
