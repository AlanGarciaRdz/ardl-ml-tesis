from fastapi import APIRouter
from app.api.v1.endpoints import data  # ml

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(data.router, prefix="/data", tags=["data"])
#api_router.include_router(ml.router, prefix="/ml", tags=["machine-learning"])
