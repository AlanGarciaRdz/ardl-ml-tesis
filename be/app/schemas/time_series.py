from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import date

class TimeSeriesData(BaseModel):
    """Schema for individual time series data point."""
    id: Optional[int] = None
    date: Optional[date] = None
    value: Optional[float] = None
    variable: Optional[str] = None
    additional_data: Optional[dict] = None

class TimeSeriesResponse(BaseModel):
    """Schema for time series data response."""
    data: List[TimeSeriesData]
    total_count: int
    table_name: str
    limit: int
    offset: int
