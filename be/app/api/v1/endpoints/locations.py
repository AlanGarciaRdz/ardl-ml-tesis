from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_database_connection
import pandas as pd

router = APIRouter()

# Response Models
class Region(BaseModel):
    id: int
    estado_id: int
    nombre: str

class Municipality(BaseModel):
    id: int
    region_id: int
    estado_id: int
    nombre: str
    cp_inicio: str
    cp_fin: str
    tarifa_15_30: float
    tarifa_30_100: float
    tarifa_100_200: float
    tarifa_200_500: float
    tarifa_mayor_500: float

class MunicipalityBasic(BaseModel):
    id: int
    nombre: str
    cp_inicio: str
    cp_fin: str

@router.get("/regions", response_model=List[Region])
async def get_regions():
    """
    Get all regions
    """
    try:
        with get_database_connection() as conn:
            query = """
                SELECT id, estado_id, nombre
                FROM regiones
                ORDER BY nombre
            """
            df = pd.read_sql(query, conn)
            
            if df.empty:
                return []
            
            return df.to_dict('records')
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching regions: {str(e)}")

@router.get("/regions/{region_id}/municipalities", response_model=List[MunicipalityBasic])
async def get_municipalities_by_region(region_id: int):
    """
    Get all municipalities for a specific region
    """
    try:
        with get_database_connection() as conn:
            query = """
                SELECT id, nombre, cp_inicio, cp_fin
                FROM municipios
                WHERE region_id = %(region_id)s
                ORDER BY nombre
            """
            df = pd.read_sql(query, conn, params={'region_id': region_id})
            
            if df.empty:
                raise HTTPException(status_code=404, detail=f"No municipalities found for region {region_id}")
            
            return df.to_dict('records')
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching municipalities: {str(e)}")

@router.get("/municipalities/search", response_model=List[MunicipalityBasic])
async def search_municipalities(query: str):
    """
    Search municipalities by name
    """
    try:
        with get_database_connection() as conn:
            sql_query = """
                SELECT id, nombre, cp_inicio, cp_fin
                FROM municipios
                WHERE nombre ILIKE %(search_query)s
                ORDER BY nombre
                LIMIT 20
            """
            df = pd.read_sql(sql_query, conn, params={'search_query': f"%{query}%"})
            
            if df.empty:
                return []
            
            return df.to_dict('records')
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching municipalities: {str(e)}")

@router.get("/municipalities/{cp}/validate")
async def validate_postal_code(cp: str):
    """
    Validate if a postal code exists and return municipality info
    """
    try:
        with get_database_connection() as conn:
            query = """
                SELECT m.id, m.nombre, m.cp_inicio, m.cp_fin, 
                       r.nombre as region_nombre
                FROM municipios m
                JOIN regiones r ON m.region_id = r.id
                WHERE %(cp)s BETWEEN m.cp_inicio AND m.cp_fin
                LIMIT 1
            """
            df = pd.read_sql(query, conn, params={'cp': cp})
            
            if df.empty:
                raise HTTPException(status_code=404, detail=f"Postal code {cp} not found in any municipality")
            
            return df.to_dict('records')[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating postal code: {str(e)}")

