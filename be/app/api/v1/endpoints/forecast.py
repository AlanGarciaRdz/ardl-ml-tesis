from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from app.core.database import get_database_connection
from app.schemas.time_series import TimeSeriesData, TimeSeriesResponse
import logging
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_forecast(
    table_name: str = Query(..., description="Name of the table in PostgreSQL"),
    limit: int = Query(100, description="Number of records to retrieve", ge=1, le=1000),
    offset: int = Query(0, description="Number of records to skip", ge=0),
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    forecast_periods: int = Query(7, description="Number of periods to forecast", ge=1, le=365),
    transform: str = Query("log", description="Transform the data", choices=["log", "sqrt", "normalize"]),
    value_column: str = Query("value", description="Name of the column containing values to forecast"),
    train: bool = False
) -> Any:
    """
    Retrieve time series data from PostgreSQL and calculate simple forecast.
    
    Args:
        table_name: The name of the table containing time series data
        limit: Maximum number of records to return
        offset: Number of records to skip
        start_date: Optional start date filter
        end_date: Optional end date filter
        forecast_periods: Number of future periods to forecast
        value_column: Name of the column containing numeric values to forecast
    
    Returns:
        TimeSeriesResponse containing the data, forecast, and metadata
    """
    try:
        with get_database_connection() as conn:
            # Build the base query
            
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
            
            # Transform all columns except date and year
            exclude_columns = ['date', 'year']
            if transform in ["log", "sqrt"]:
                # Simple transformations - apply directly
                for item in data:
                    for key, value in item.items():
                        if key not in exclude_columns and isinstance(value, (int, float)):
                            if transform == "log":
                                item[key] = np.log(value)
                            elif transform == "sqrt":
                                item[key] = np.sqrt(value)
            elif transform == "normalize":
                # First, calculate mean and std for each numeric column
                column_stats = {}
                for key in data[0].keys():
                    if key not in exclude_columns:
                        values = [item[key] for item in data if isinstance(item.get(key), (int, float))]
                        if values:
                            column_stats[key] = {
                                'mean': np.mean(values),
                                'std': np.std(values)
                            }
                
                # Then apply normalization to each item
                for item in data:
                    for key, value in item.items():
                        if key not in exclude_columns and isinstance(value, (int, float)):
                            if column_stats[key]['std'] != 0:  # Avoid division by zero
                                item[key] = (value - column_stats[key]['mean']) / column_stats[key]['std']
                            else:
                                item[key] = 0  # If std is 0, all values are the same
                
            # Calculate forecast
            forecast_data = calculate_simple_forecast(data, forecast_periods, value_column)
            print(forecast_data)
            
            return {
                "data": data,
                "forecast": forecast_data,
                "total_count": total_count,
                "table_name": table_name,
                "limit": limit,
                "offset": offset,
                "forecast_periods": forecast_periods,
                "message": "Data and forecast retrieved successfully"
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving data from PostgreSQL: {str(e)}"
        )

def calculate_simple_forecast(data: List[Dict], periods: int, value_column: str) -> List[Dict]:
    """
    Calculate simple linear regression forecast based on historical data.
    
    Args:
        data: List of dictionaries containing historical data
        periods: Number of future periods to forecast
        value_column: Name of the column containing values to forecast
    
    Returns:
        List of dictionaries containing forecast data
    """
    if not data:
        return []
    
    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame(data)

    print("----")
    print(value_column)
    
    # Ensure we have date and value columns
    if 'date' not in df.columns or value_column not in df.columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Required columns 'Date' and '{value_column}' not found in data"
        )
    
    # Convert date column to datetime and sort
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    
    
    # Prepare data for linear regression
    df['days'] = (df['date'] - df['date'].min()).dt.days
    
    X = df[['days']].values
    y = df[value_column].values
    
    # Handle NaN values
    if np.isnan(y).any():
        y = np.nan_to_num(y, nan=np.nanmean(y))
    
    # Fit linear regression model
    model = LinearRegression()
    model.fit(X, y)
    
    # Generate future dates
    DayInterval = 7
    last_date = df['date'].max()

    future_dates = [last_date + timedelta(days=i*DayInterval) for i in range(periods)]
    future_days = [(date - df['date'].min()).days for date in future_dates]
    
    
    # Make predictions
    future_X = np.array(future_days).reshape(-1, 1)
    predictions = model.predict(future_X)

    
    print(predictions)
    
    # Create forecast data structure
    forecast_data = []
    for i, (date, prediction) in enumerate(zip(future_dates, predictions)):
        forecast_data.append({
            'date': date.strftime('%Y-%m-%d'),
            'period': i + 1,
            'predicted_value': float(prediction),
            'confidence_interval': {
                'lower': float(prediction * 0.9),  # Simple 10% confidence interval
                'upper': float(prediction * 1.1)
            }
        })
    
    return forecast_data
