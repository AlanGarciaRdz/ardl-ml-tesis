from fastapi import APIRouter
from app.api.v1.endpoints import data

api_router = APIRouter()

# Include only the data endpoint router
api_router.include_router(data.router, prefix="/data", tags=["data"])
