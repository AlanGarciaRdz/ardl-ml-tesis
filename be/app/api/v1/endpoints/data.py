from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from app.core.database import get_database_connection
from app.schemas.time_series import TimeSeriesData, TimeSeriesResponse

router = APIRouter()

@router.get("/")
async def get_time_series_data(
    table_name: str = Query(..., description="Name of the table in PostgreSQL"),
    limit: int = Query(100, description="Number of records to retrieve", ge=1, le=1000),
    offset: int = Query(0, description="Number of records to skip", ge=0),
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)")
) -> Any:
    """
    Retrieve time series data from PostgreSQL.
    
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
        with get_database_connection() as conn:
            # Build the base query
            print("data------------")
            base_query = f"SELECT * FROM {table_name}"
            where_conditions = []
            params = {}
            
            # Add date filters if provided
            if start_date:
                where_conditions.append("Date >= :start_date")
                params['start_date'] = start_date
            if end_date:
                where_conditions.append("Date <= :end_date")
                params['end_date'] = end_date
            
            # Add WHERE clause if there are conditions
            if where_conditions:
                base_query += " WHERE " + " AND ".join(where_conditions)
            
            # Add pagination
            base_query += " ORDER BY Date LIMIT :limit OFFSET :offset"
            params['limit'] = limit
            params['offset'] = offset
            
            # Execute the query
            result = conn.execute(text(base_query), params)
            data = [dict(row._mapping) for row in result]
            
            # Get total count for the table
            count_query = f"SELECT COUNT(*) as total FROM {table_name}"
            if where_conditions:
                count_query += " WHERE " + " AND ".join(where_conditions)
            
            count_result = conn.execute(text(count_query), {k: v for k, v in params.items() if k not in ['limit', 'offset']})
            total_count = count_result.scalar()
            
            if not data:
                raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found or no data available")
            
            return {
                "data": data,
                "total_count": total_count,
                "table_name": table_name,
                "limit": limit,
                "offset": offset,
                "message": "Raw data retrieved successfully"
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving data from PostgreSQL: {str(e)}"
        )

@router.get("/tables")
async def get_available_tables() -> Any:
    """Get list of available tables in PostgreSQL."""
    try:
        with get_database_connection() as conn:
            # Query to get all table names from the current database
            query = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """)
            
            result = conn.execute(query)
            tables = [row[0] for row in result]
            
            return {
                "message": "Available tables retrieved successfully",
                "tables": tables,
                "total_tables": len(tables)
            }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving table information: {str(e)}"
        )
