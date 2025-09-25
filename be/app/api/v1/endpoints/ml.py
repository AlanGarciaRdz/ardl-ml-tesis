from typing import Any
from fastapi import APIRouter, HTTPException
from app.services.analysis_service import (
    AnalysisService,
    AnalysisRequest,
    AnalysisResponse
)

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def perform_analysis(request: AnalysisRequest) -> AnalysisResponse:
    """
    Perform any type of ML analysis based on the request parameters.
    
    This is the main endpoint for all ML analyses. The analysis type and parameters
    are specified in the request body.
    
    Args:
        request: AnalysisRequest containing analysis type, data, and parameters
    
    Returns:
        AnalysisResponse with the analysis results
    """
    try:
        return AnalysisService.perform_analysis(request)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis service error: {str(e)}"
        )

@router.get("/available-analyses")
async def get_available_analyses() -> dict:
    """
    Get information about available analysis types and their required parameters.
    
    Returns:
        Dictionary with available analysis types and examples
    """
    return AnalysisService.get_available_analyses()

# Legacy endpoints for backward compatibility (optional)
@router.post("/correlation")
async def calculate_correlation_legacy(data: list, field1: str, field2: str) -> dict:
    """
    Legacy endpoint for correlation analysis.
    Consider using /analyze endpoint instead.
    """
    try:
        request = AnalysisRequest(
            analysis_type="correlation",
            data=data,
            parameters={"field1": field1, "field2": field2}
        )
        result = AnalysisService.perform_analysis(request)
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
            
        return result.result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/statistics")
async def calculate_statistics_legacy(data: list, field: str) -> dict:
    """
    Legacy endpoint for statistics analysis.
    Consider using /analyze endpoint instead.
    """
    try:
        request = AnalysisRequest(
            analysis_type="statistics",
            data=data,
            parameters={"field": field}
        )
        result = AnalysisService.perform_analysis(request)
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
            
        return result.result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
