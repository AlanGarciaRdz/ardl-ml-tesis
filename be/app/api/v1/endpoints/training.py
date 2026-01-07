from typing import Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import uuid

from app.services.training_service import TrainingService

router = APIRouter()
training_service = TrainingService()

# In-memory job tracking (for async training)
training_jobs: dict = {}


class TrainingRequest(BaseModel):
    """Request model for training endpoint"""
    table_name: str = Field(..., description="Name of the table in PostgreSQL")
    model_type: str = Field(..., description="Type of model to train", 
                           pattern="^(lstm|arima|mcmc|simple_linear)$")
    value_column: str = Field(..., description="Name of the column to forecast")
    start_date: Optional[str] = Field(None, description="Start date filter (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date filter (YYYY-MM-DD)")
    model_params: Optional[dict] = Field(None, description="Model-specific hyperparameters")


class TrainingResponse(BaseModel):
    """Response model for training endpoint"""
    success: bool
    message: str
    job_id: Optional[str] = None
    version: Optional[str] = None
    metrics: Optional[dict] = None


def _train_model_async(job_id: str, request: TrainingRequest):
    """Background task for training model"""
    try:
        result = training_service.train_model(
            table_name=request.table_name,
            model_type=request.model_type,
            value_column=request.value_column,
            start_date=request.start_date,
            end_date=request.end_date,
            model_params=request.model_params or {}
        )
        training_jobs[job_id] = {
            'status': 'completed',
            'result': result
        }
    except Exception as e:
        training_jobs[job_id] = {
            'status': 'failed',
            'error': str(e)
        }


@router.post("/train")
async def train_model(
    request: TrainingRequest,
    background_tasks: BackgroundTasks,
    async_mode: bool = True
) -> TrainingResponse:
    """
    Train a forecasting model on data from the database.
    
    Args:
        request: Training request with table_name, model_type, value_column, etc.
        background_tasks: FastAPI background tasks
        async_mode: If True, run training in background (default: True)
    
    Returns:
        TrainingResponse with job_id (if async) or results (if sync)
    """
    try:
        if async_mode:
            # Generate job ID
            job_id = str(uuid.uuid4())
            print(job_id)
            
            # Start background task
            background_tasks.add_task(_train_model_async, job_id, request)
            
            # Initialize job status
            training_jobs[job_id] = {
                'status': 'running',
                'request': request.dict()
            }
            
            return TrainingResponse(
                success=True,
                message="Training started in background",
                job_id=job_id
            )
        else:
            # Synchronous training
            result = training_service.train_model(
                table_name=request.table_name,
                model_type=request.model_type,
                value_column=request.value_column,
                start_date=request.start_date,
                end_date=request.end_date,
                model_params=request.model_params or {}
            )
            
            return TrainingResponse(
                success=True,
                message="Training completed successfully",
                version=result['version'],
                metrics=result['metrics']
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error training model: {str(e)}"
        )


@router.get("/status/{job_id}")
async def get_training_status(job_id: str) -> dict:
    """Get the status of an async training job"""
    if job_id not in training_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return training_jobs[job_id]


@router.get("/models")
async def list_trained_models(table_name: Optional[str] = None) -> dict:
    """List all trained models in the registry"""
    models = training_service.registry.list_models(table_name)
    return {
        "models": models,
        "total": len(models)
    }