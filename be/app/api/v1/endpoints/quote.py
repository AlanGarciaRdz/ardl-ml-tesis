from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from app.core.database import get_database_connection
import logging
import pandas as pd
import numpy as np
from pydantic import BaseModel, Field


router = APIRouter()
logger = logging.getLogger(__name__)


# =============================================
# SCHEMAS
# =============================================

class ShippingCalculationRequest(BaseModel):
    codigo_postal: str = Field(..., min_length=5, max_length=5)
    peso: float = Field(..., gt=0, description="Peso en kilogramos")
    material: str = Field(default="scrap", description="scrap, gas, rebar, hrcc1")

class ShippingCalculationResponse(BaseModel):
    # Location info
    municipio: str
    region: str
    estado: str
    codigo_postal: str
    
    # Calculation details
    peso: float
    material: str
    
    # Prices
    precio_material_mxn: float
    tarifa_transporte: float
    precio_total: float
    
    # Market data
    tipo_cambio: float
    fecha_precios: str
    
    # All market prices
    market_prices: Dict[str, float]
    
    # User tracking
    cotizacion_id: Optional[int] = None
    usuario_id: Optional[int] = None
    total_cotizaciones_usuario: Optional[int] = None
    is_authenticated: bool = False
    

# =============================================
# HELPER FUNCTIONS
# =============================================

def get_tarifa_by_weight(peso: float, tarifas: Dict[str, float]) -> float:
    """
    Calculate shipping tariff based on weight ranges
    """
    if 15 <= peso <= 30:
        return tarifas.get('tarifa_15_30', 0)
    elif 30 < peso <= 100:
        return tarifas.get('tarifa_30_100', 0)
    elif 100 < peso <= 200:
        return tarifas.get('tarifa_100_200', 0)
    elif 200 < peso <= 500:
        return tarifas.get('tarifa_200_500', 0)
    elif peso > 500:
        return tarifas.get('tarifa_mayor_500', 0)
    else:
        raise HTTPException(status_code=400, detail="Peso debe ser mayor a 15 kg")

def get_material_price(material: str, precios: Dict[str, Any]) -> float:
    """
    Get material price in MXN based on material type
    """
    material_mapping = {
        'scrap': 'scrap_mxn',
        'chatarra': 'scrap_mxn',
        'gas': 'gas_mxn',
        'rebar': 'rebar_mxn',
        'varilla': 'rebar_mxn',
        'hrcc1': 'hrcc1_mxn',
        'hrcct': 'hrcc1_mxn'
    }
    
    material_key = material_mapping.get(material.lower(), 'precio_mercado')
    return float(precios.get(material_key, precios.get('precio_mercado', 0)))

def get_total_cotizaciones(
    conn: Any,
    firebase_uid: Optional[str] = None,
    usuario_id: Optional[int] = None,
    session_id: Optional[str] = None
) -> int:
    """
    Returns total number of cotizaciones filtered by:
    - firebase_uid
    - usuario_id
    - session_id
    - or global if none provided
    """

    if firebase_uid:
        query = """
            SELECT COUNT(*) 
            FROM cotizaciones 
            WHERE firebase_uid = :firebase_uid
        """
        params = {"firebase_uid": firebase_uid}

    elif usuario_id:
        query = """
            SELECT COUNT(*) 
            FROM cotizaciones 
            WHERE usuario_id = :usuario_id
        """
        params = {"usuario_id": usuario_id}

    elif session_id:
        query = """
            SELECT COUNT(*) 
            FROM cotizaciones 
            WHERE session_id = :session_id
        """
        params = {"session_id": session_id}

    else:
        query = "SELECT COUNT(*) FROM cotizaciones"
        params = {}

    cursor = conn.execute(text(query), params)
    return cursor.scalar() or 0


def save_cotizacion(
    conn: Any,
    codigo_postal: str,
    peso: float,
    material: str,
    municipio_id: Optional[int],
    precio_material: float,
    tarifa_transporte: float,
    precio_total: float,
    tipo_cambio: float,
    firebase_uid: Optional[str] = None,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Almacena la cotización en la base de datos y devuelve la información de la cotización y el usuario.
    """
    usuario_id = None
    total_cotizaciones = 1
    
    # Get or create user if firebase_uid provided
    if firebase_uid:
        cursor = conn.execute(
            text("""
                INSERT INTO usuarios (firebase_uid)
                VALUES (:uid)
                ON CONFLICT (firebase_uid) 
                DO UPDATE SET 
                    ultimo_acceso = CURRENT_TIMESTAMP,
                    total_cotizaciones = usuarios.total_cotizaciones + 1,
                    ultima_cotizacion = CURRENT_TIMESTAMP
                RETURNING id, total_cotizaciones
            """),
            {"uid": firebase_uid}
        )
        user_data = cursor.fetchone()
        if user_data:
            usuario_id = user_data[0]
            total_cotizaciones = user_data[1]
    
    # Insert quotation
    cursor = conn.execute(
        text("""
            INSERT INTO cotizaciones (
                codigo_postal,
                municipio_id,
                peso,
                material,
                precio_material,
                tarifa_transporte,
                precio_total,
                tipo_cambio,
                usuario_id,
                firebase_uid,
                session_id
            ) VALUES (
                :cp, :municipio_id, :peso, :material,
                :precio_material, :tarifa, :total, :tipo_cambio,
                :usuario_id, :firebase_uid, :session_id
            )
            RETURNING id
        """),
        {
            "cp": codigo_postal,
            "municipio_id": municipio_id,
            "peso": peso,
            "material": material,
            "precio_material": precio_material,
            "tarifa": tarifa_transporte,
            "total": precio_total,
            "tipo_cambio": tipo_cambio,
            "usuario_id": usuario_id,
            "firebase_uid": firebase_uid,
            "session_id": session_id
        }
    )
    
    cotizacion_id = cursor.fetchone()[0]
    conn.commit()
    
    return {
        "cotizacion_id": cotizacion_id,
        "usuario_id": usuario_id,
        "total_cotizaciones": total_cotizaciones
    }

class CotizacionesCountResponse(BaseModel):
    total_cotizaciones: int

# =============================================
# MAIN ENDPOINT
# =============================================

@router.post("/calcular-envio", response_model=ShippingCalculationResponse)
async def calcular_envio(
    request: ShippingCalculationRequest,
    #current_user: Optional[FirebaseUser] = Depends(get_current_user),
    #x_session_id: Optional[str] = Header(None)
):
    """
    Calcula el costo de transporte basado en el código postal y el peso.
    
    - **codigo_postal**: 5-digit postal code
    - **peso**: Weight in kilograms (minimum 15kg)
    - **material**: Material type (scrap/chatarra, gas, rebar/varilla, hrcc1/hrcct)
    
    Returns complete pricing breakdown including location, transport tariff, and total cost.
    Automatically tracks user quotations if authenticated.
    """
    
    conn = get_database_connection()
    
    try:
        # 1. Get latest market prices
        cursor = conn.execute(
            text("""
                SELECT 
                    id, date, year,
                    scrap, gas, rebar, hrcc1,
                    scrap_mxn, gas_mxn, rebar_mxn, hrcc1_mxn,
                    tipo_de_cambio,
                    varilla_distribuidor, varilla_credito, precio_mercado
                FROM precios_materiales 
                ORDER BY date DESC 
                LIMIT 1;
            """)
        )
        precios_row = cursor.fetchone()
        
        if not precios_row:
            raise HTTPException(status_code=404, detail="No hay precios disponibles en el sistema")
        
        # Convert to dict
        precios = dict(precios_row._mapping)
        
        # 2. Find municipality by postal code
        cursor = conn.execute(
            text("""
                SELECT 
                    m.id,
                    m.nombre as municipio,
                    m.tarifa_15_30,
                    m.tarifa_30_100,
                    m.tarifa_100_200,
                    m.tarifa_200_500,
                    m.tarifa_mayor_500,
                    r.nombre as region,
                    e.nombre as estado
                FROM municipios m
                JOIN regiones r ON m.region_id = r.id
                JOIN estados e ON m.estado_id = e.id
                WHERE :cp BETWEEN m.cp_inicio AND m.cp_fin
                LIMIT 1
            """),
            {"cp": request.codigo_postal}
        )
        municipio_row = cursor.fetchone()
        
        if not municipio_row:
            raise HTTPException(
                status_code=404, 
                detail=f"Código postal {request.codigo_postal} no encontrado"
            )
        
        municipio_data = dict(municipio_row._mapping)
        
        # 3. Calculate tariff based on weight
        tarifas = {
            'tarifa_15_30': float(municipio_data['tarifa_15_30'] or 0),
            'tarifa_30_100': float(municipio_data['tarifa_30_100'] or 0),
            'tarifa_100_200': float(municipio_data['tarifa_100_200'] or 0),
            'tarifa_200_500': float(municipio_data['tarifa_200_500'] or 0),
            'tarifa_mayor_500': float(municipio_data['tarifa_mayor_500'] or 0),
        }
        
        tarifa_transporte = get_tarifa_by_weight(request.peso, tarifas)
        
        # 4. Get material price
        precio_material = get_material_price(request.material, precios)
        
        # 5. Calculate total
        precio_total = (((precio_material  *2) / .93))+ tarifa_transporte
        
        # 6. Save quotation
        #firebase_uid = current_user.uid if current_user else None
        quote_info = save_cotizacion(
            conn=conn,
            codigo_postal=request.codigo_postal,
            peso=request.peso,
            material=request.material,
            municipio_id=municipio_data['id'],
            precio_material=precio_material,
            tarifa_transporte=tarifa_transporte,
            precio_total=precio_total,
            tipo_cambio=float(precios['tipo_de_cambio']),
            firebase_uid="3pv373JzilaXOC7C4Dq66FOqF2v1" ,
            session_id="x_session_id"
        )
        
        # 7. Build response
        return ShippingCalculationResponse(
            # Location
            municipio=municipio_data['municipio'],
            region=municipio_data['region'],
            estado=municipio_data['estado'],
            codigo_postal=request.codigo_postal,
            
            # Calculation
            peso=request.peso,
            material=request.material,
            
            # Prices
            precio_material_mxn=precio_material,
            tarifa_transporte=tarifa_transporte,
            precio_total=precio_total,
            
            # Market data
            tipo_cambio=float(precios['tipo_de_cambio']),
            fecha_precios=precios['date'].strftime('%Y-%m-%d'),
            
            # All market prices
            market_prices={
                'scrap_mxn': float(precios['scrap_mxn']),
                'gas_mxn': float(precios['gas_mxn']),
                'rebar_mxn': float(precios['rebar_mxn']),
                'hrcc1_mxn': float(precios['hrcc1_mxn']),
                'varilla_distribuidor': float(precios['varilla_distribuidor']),
                'varilla_credito': float(precios['varilla_credito']),
                'precio_mercado': float(precios['precio_mercado']),
                'tipo_cambio': float(precios['tipo_de_cambio'])
            },
            
            # User tracking
            cotizacion_id=quote_info['cotizacion_id'],
            usuario_id=quote_info['usuario_id'],
            total_cotizaciones_usuario=quote_info['total_cotizaciones'],
            is_authenticated=False #current_user is not None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error al calcular envío: {str(e)}")
    finally:
        conn.close()

@router.get("/total", response_model=CotizacionesCountResponse)
async def get_cotizaciones_count(
    firebase_uid: Optional[str] = Query(None),
    usuario_id: Optional[int] = Query(None),
    session_id: Optional[str] = Query(None),
):
    """
    Get number of cotizaciones.
    
    Priority:
    1. firebase_uid
    2. usuario_id
    3. session_id
    4. global total if none provided
    """

    conn = get_database_connection()

    try:
        total = get_total_cotizaciones(
            conn=conn,
            firebase_uid=firebase_uid,
            usuario_id=usuario_id,
            session_id=session_id
        )

        return CotizacionesCountResponse(
            total_cotizaciones=total
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting cotizaciones count: {str(e)}"
        )
    finally:
        conn.close()

@router.get("/codigo-postal/{codigo_postal}")
async def get_location_info(codigo_postal: str):
    """
    Get location information for a postal code
    """
    if len(codigo_postal) != 5:
        raise HTTPException(status_code=400, detail="Código postal debe tener 5 dígitos")
    
    conn = get_database_connection()
    
    try:
        cursor = conn.execute(
            text("""
                SELECT 
                    m.nombre as municipio,
                    m.cp_inicio,
                    m.cp_fin,
                    r.nombre as region,
                    e.nombre as estado,
                    m.tarifa_15_30,
                    m.tarifa_30_100,
                    m.tarifa_100_200,
                    m.tarifa_200_500,
                    m.tarifa_mayor_500
                FROM municipios m
                JOIN regiones r ON m.region_id = r.id
                JOIN estados e ON m.estado_id = e.id
                WHERE :cp BETWEEN m.cp_inicio AND m.cp_fin
                LIMIT 1
            """),
            {"cp": codigo_postal}
        )
        result = cursor.fetchone()
        
        if not result:
            raise HTTPException(
                status_code=404, 
                detail=f"Código postal {codigo_postal} no encontrado"
            )
        
        data = dict(result._mapping)
        return {
            "municipio": data['municipio'],
            "region": data['region'],
            "estado": data['estado'],
            "codigo_postal_rango": f"{data['cp_inicio']} - {data['cp_fin']}",
            "tarifas": {
                "15-30kg": float(data['tarifa_15_30'] or 0),
                "30-100kg": float(data['tarifa_30_100'] or 0),
                "100-200kg": float(data['tarifa_100_200'] or 0),
                "200-500kg": float(data['tarifa_200_500'] or 0),
                ">500kg": float(data['tarifa_mayor_500'] or 0)
            }
        }
    finally:
        conn.close()