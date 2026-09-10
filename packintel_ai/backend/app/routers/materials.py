from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.material_service import (
    get_all_materials,
    get_material_by_id,
    get_food_profiles,
)

router = APIRouter(prefix="/api/v1", tags=["materials"])


@router.get("/materials")
async def list_materials(
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: str = Query("name", description="Sort field"),
    order: str = Query("asc", description="asc or desc"),
):
    return get_all_materials(category=category, sort_by=sort_by, order=order)


@router.get("/materials/{material_id}")
async def get_material(material_id: str):
    result = get_material_by_id(material_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Material '{material_id}' not found.")
    return result


@router.get("/food-profiles")
async def list_food_profiles(
    q: Optional[str] = Query(None, description="Search query for autocomplete"),
):
    return get_food_profiles(search=q)
