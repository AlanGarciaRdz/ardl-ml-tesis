from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import get_supabase_client
from app.schemas.time_series import TimeSeriesData, TimeSeriesResponse

router = APIRouter()

@router.get("/")
async def get_time_series_data(
    table_name: str = Query(..., description="Name of the table in Supabase"),
    limit: int = Query(100, description="Number of records to retrieve", ge=1, le=1000),
    offset: int = Query(0, description="Number of records to skip", ge=0),
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)")
) -> Any:
    """
    Retrieve time series data from Supabase.
    
    Args:
        table_name: The name of the table containing time series data
        limit: Maximum number of records to return
        offset: Number of records to skip
        start_date: Optional start date filter
        end_date: Optional end date filter
    
    Returns:
        TimeSeriesResponse containing the data and metadata
    """
    try:
        supabase = get_supabase_client()

        
        # Build the query
        query = supabase.table(table_name).select("*").range(offset, offset + limit - 1)
        
        
        # Add date filters if provided
        if start_date:
            query = query.gte("Date", start_date)
        if end_date:
            query = query.lte("Date", end_date)
            
         
        # Execute the query
        response = query.execute()

        
        print(f"Response: {response}")
        print(f"Data: {response.data}")
        
        if response.data is None:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found or no data available")
        
        
        return {
            "data": response.data,
            "total_count": len(response.data),
            "table_name": table_name,
            "limit": limit,
            "offset": offset,
            "message": "Raw data retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving data from Supabase: {str(e)}"
        )

@router.get("/tables")
async def get_available_tables() -> Any:
    """Get list of available tables in Supabase."""
    try:
        supabase = get_supabase_client()
        # Note: This is a simplified approach. You might need to implement
        # a different method to get table names depending on your Supabase setup
        return {
            "message": "Available tables endpoint",
            "note": "Implement based on your Supabase schema"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving table information: {str(e)}"
        )
