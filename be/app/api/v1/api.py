from fastapi import APIRouter
from app.api.v1.endpoints import data, forecast, quote, training  # ml

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(data.router, prefix="/data", tags=["data"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["forecast"])
api_router.include_router(quote.router, prefix="/quote", tags=["quote"])
api_router.include_router(training.router, prefix="/training", tags=["training"]) 
#api_router.include_router(ml.router, prefix="/ml", tags=["machine-learning"])
