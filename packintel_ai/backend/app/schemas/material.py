from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class MaterialCategory(str, Enum):
    plastic = "plastic"
    glass = "glass"
    metal = "metal"
    bio = "bio"
    paper = "paper"
    composite = "composite"


class CostTier(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    premium = "premium"


class MaterialDetail(BaseModel):
    id: str
    name: str
    abbreviation: Optional[str] = None
    category: MaterialCategory
    moisture_barrier: float = Field(description="MVTR g/m²/day — lower is better")
    oxygen_barrier: float = Field(description="OTR cc/m²/day — lower is better")
    temp_min_c: float
    temp_max_c: float
    shelf_life_days: int
    eco_score: float = Field(ge=0, le=100)
    recyclable: bool
    compostable: bool
    food_safe: bool
    cost_tier: CostTier
    description: Optional[str] = None
    key_properties: Optional[List[str]] = None

    model_config = {"from_attributes": True}


class MaterialListResponse(BaseModel):
    materials: List[MaterialDetail]
    total: int
