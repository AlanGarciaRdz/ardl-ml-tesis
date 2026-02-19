from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from app.core.database import get_database_connection
from app.schemas.time_series import TimeSeriesData, TimeSeriesResponse
from app.services.forecast_service import ForecastService
import logging
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

router = APIRouter()
logger = logging.getLogger(__name__)
forecast_service = ForecastService()

@router.get("/")
async def get_forecast(
    table_name: str = Query(..., description="Name of the table in PostgreSQL"),
    limit: int = Query(100, description="Number of records to retrieve", ge=1, le=1000),
    offset: int = Query(0, description="Number of records to skip", ge=0),
    start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    forecast_periods: int = Query(7, description="Number of periods to forecast", ge=1, le=365),
    transform: str = Query("log", description="Transform the data", choices=["log", "sqrt", "normalize", "none"]),
    value_column: str = Query("scrap_mxn", description="Name of the column containing values to forecast"),
    model_type: str = Query("lstm", description="Type of model to use for forecasting", 
                           pattern="^(lstm|arima|simple_linear|empirical)$"),
    use_trained_model: bool = Query(True, description="Use trained model if available, otherwise train on-the-fly")
) -> Any:
    """
    Retrieve time series data and generate forecast using trained models.
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
            base_query += " ORDER BY Date DESC LIMIT :limit OFFSET :offset"
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
            
            # Apply transformations if needed
            exclude_columns = ['date', 'year', 'Date']
            if transform in ["log", "sqrt", "normalize"]:
                if transform == "normalize":  # add
                    numeric_keys = sorted({
                        k for item in data for k, v in item.items()
                        if k.lower() not in exclude_columns and isinstance(v, (int, float))
                    })

                    cols = {
                        k: np.array([item.get(k, np.nan) for item in data], dtype=float)
                        for k in numeric_keys
                    }
                    mins = {k: np.nanmin(arr) for k, arr in cols.items()}
                    maxs = {k: np.nanmax(arr) for k, arr in cols.items()}

                    for i, item in enumerate(data):
                        for k in numeric_keys:
                            v = cols[k][i]
                            denom = (maxs[k] - mins[k])
                            item[k] = float((v - mins[k]) / denom) if denom and np.isfinite(v) else 0.0
                else:
                    for item in data:
                        for key, value in item.items():
                            if key.lower() not in exclude_columns and isinstance(value, (int, float)):
                                if transform == "log":
                                    item[key] = np.log(value) if value > 0 else 0
                                elif transform == "sqrt":
                                    item[key] = np.sqrt(value) if value >= 0 else 0
            
            # Generate forecast
            forecast_data = []
            
            if model_type == "empirical": 
                print("Calculating empirical forecast")
                forecast_data = calculate_empirical_forecast(data, forecast_periods, value_column)
            elif  model_type == "lstm":
                print("Calculating LSTM forecast")
                try:
                    # Try to use trained model
                    forecast_data = forecast_service.generate_forecast(
                        table_name=table_name,
                        model_type=model_type,
                        value_column=value_column,
                        forecast_periods=forecast_periods
                    )
                    print(forecast_data)
                except (ValueError, FileNotFoundError) as e:
                    # Fallback to simple linear if model not found
                    logger.warning(f"Trained model not found, using simple linear: {str(e)}")
                    forecast_data = calculate_empirical_forecast(data, forecast_periods, value_column)
            else:
                forecast_data = calculate_simple_forecast(data, forecast_periods, value_column)
            
            return {
                "data": data,
                "forecast": forecast_data,
                "total_count": total_count,
                "table_name": table_name,
                "limit": limit,
                "offset": offset,
                "forecast_periods": forecast_periods,
                "model_type": model_type,
                "value_column": value_column,
                "message": "Data and forecast retrieved successfully"
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error retrieving data from PostgreSQL: {str(e)}"
        )

def calculate_simple_forecast(data: List[Dict], periods: int, value_column: str) -> List[Dict]:
    """Calculate simple linear regression forecast (fallback method)"""
    if not data:
        return []
    
    df = pd.DataFrame(data)
    
    # Handle date column
    date_col = 'date' if 'date' in df.columns else 'Date'
    if date_col not in df.columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Required column '{date_col}' not found in data"
        )
    
    if value_column not in df.columns:
        raise HTTPException(
            status_code=400, 
            detail=f"Required column '{value_column}' not found in data"
        )
    
    df[date_col] = pd.to_datetime(df[date_col])
    df = df.sort_values(date_col)
    
    # Prepare data for linear regression
    df['days'] = (df[date_col] - df[date_col].min()).dt.days
    
    X = df[['days']].values
    y = df[value_column].values
    
    # Handle NaN values
    if np.isnan(y).any():
        y = np.nan_to_num(y, nan=np.nanmean(y))
    
    # Fit linear regression model
    model = LinearRegression()
    model.fit(X, y)
    
    # Generate future dates
    day_interval = 7
    last_date = df[date_col].max()
    
    future_dates = [last_date + timedelta(days=i*day_interval) for i in range(1, periods + 1)]
    future_days = [(date - df[date_col].min()).days for date in future_dates]
    
    # Make predictions
    future_X = np.array(future_days).reshape(-1, 1)
    predictions = model.predict(future_X)
    
    # Create forecast data structure
    forecast_data = []
    for i, (date, prediction) in enumerate(zip(future_dates, predictions)):
        forecast_data.append({
            'date': date.strftime('%Y-%m-%d'),
            'period': i + 1,
            'predicted_value_bajista': float(prediction) * 2 / 0.95,  #( .95 bajista , .93 conservador .90  alza ) 
            'predicted_value_conservador': float(prediction) * 2 / 0.93,
            'predicted_value_alza': float(prediction) *2 / 0.90,
            'confidence_interval': {
                'lower': float(prediction * 0.9),
                'upper': float(prediction * 1.1)
            }
        })
    
    return forecast_data


# rename the function
def calculate_empirical_forecast(data: List[Dict], periods: int, value_column: str) -> List[Dict]:
    # replace the regression part with this empirical logic (keep your date handling)
    
    df = pd.DataFrame(data)

    date_col = 'date' if 'date' in df.columns else 'Date'
    if date_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Required column '{date_col}' not found in data")

    base_col = 'scrap_mxn' if 'scrap_mxn' in df.columns else value_column  # add (use scrap_mxn for the empirical formula)
    if base_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Required column '{base_col}' not found in data")

    df[date_col] = pd.to_datetime(df[date_col])
    df = df.sort_values(date_col)

    last_val = df[base_col].dropna().iloc[-1]  
    base_price = float(last_val) * 2.0     

    MONTHLY_COEFS = {
        (2026, 2): 0.7929,
        (2026, 3): 0.7889,
        (2026, 4): 0.7913,
        (2026, 5): 0.8094,
        (2026, 6): 0.8162,
        (2026, 7): 0.8464,
        (2026, 8): 0.8549,
    }    

    day_interval = 7
    last_date = df[date_col].max()
    future_dates = [last_date + timedelta(days=i*day_interval) for i in range(1, periods + 1)]

    forecast_data = []
    for i, date in enumerate(future_dates):
        coef = MONTHLY_COEFS.get((date.year, date.month), list(MONTHLY_COEFS.values())[-1])
        
        if i == 0:
            coef_bajista = coef
            coef_alza = coef
        else:
            coef_bajista = coef * 0.98
            coef_alza = coef * 1.02

        conservador = base_price / coef
        bajista = base_price / coef_bajista
        alza = base_price / coef_alza

        forecast_data.append({
            'date': date.strftime('%Y-%m-%d'),
            'period': i + 1,
            'predicted_value_bajista': float(bajista),
            'predicted_value_conservador': float(conservador),
            'predicted_value_alza': float(alza),
            'confidence_interval': {
                'lower': float(conservador * 0.9),
                'upper': float(conservador * 1.1)
            }
        })

    return forecast_data
