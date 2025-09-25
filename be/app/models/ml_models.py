import pandas as pd
import numpy as np
from scipy.stats import pearsonr
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel

class CorrelationRequest(BaseModel):
    data: List[Dict[str, Any]]
    field1: str
    field2: str

class CorrelationResult(BaseModel):
    correlation_coefficient: float
    p_value: float
    field1: str
    field2: str
    sample_size: int
    interpretation: str

class StatisticsResult(BaseModel):
    count: int
    mean: float
    median: float
    std: float
    min: float
    max: float
    q25: float
    q75: float
    field: str

class CorrelationCalculator:
    """Handles correlation calculations using pandas and scipy"""
    
    @staticmethod
    def calculate_pearson_correlation(request: CorrelationRequest) -> CorrelationResult:
        """
        Calculate Pearson correlation coefficient between two fields.
        
        Args:
            request: Contains data array and field names to correlate
        
        Returns:
            CorrelationResult with coefficient, p-value, and interpretation
        """
        # Convert data to DataFrame
        df = pd.DataFrame(request.data)
        
        # Validate fields exist
        if request.field1 not in df.columns:
            raise ValueError(f"Field '{request.field1}' not found in data")
        if request.field2 not in df.columns:
            raise ValueError(f"Field '{request.field2}' not found in data")
        
        # Get the two fields
        field1_data = df[request.field1].dropna()
        field2_data = df[request.field2].dropna()
        
        # Ensure both series have the same length
        min_length = min(len(field1_data), len(field2_data))
        if min_length < 2:
            raise ValueError("Need at least 2 data points for correlation calculation")
        
        field1_data = field1_data.iloc[:min_length]
        field2_data = field2_data.iloc[:min_length]
        
        # Calculate Pearson correlation
        correlation_coefficient, p_value = pearsonr(field1_data, field2_data)
        
        # Interpret correlation strength
        interpretation = CorrelationCalculator._interpret_correlation(correlation_coefficient)
        
        return CorrelationResult(
            correlation_coefficient=round(correlation_coefficient, 6),
            p_value=round(p_value, 6),
            field1=request.field1,
            field2=request.field2,
            sample_size=min_length,
            interpretation=interpretation
        )
    
    @staticmethod
    def _interpret_correlation(correlation_coefficient: float) -> str:
        """Interpret the strength and direction of correlation"""
        abs_corr = abs(correlation_coefficient)
        
        if abs_corr >= 0.9:
            strength = "Very strong correlation"
        elif abs_corr >= 0.7:
            strength = "Strong correlation"
        elif abs_corr >= 0.5:
            strength = "Moderate correlation"
        elif abs_corr >= 0.3:
            strength = "Weak correlation"
        else:
            strength = "Very weak or no correlation"
        
        # Add direction
        if correlation_coefficient > 0:
            direction = " (positive)"
        else:
            direction = " (negative)"
        
        return strength + direction

class StatisticsCalculator:
    """Handles statistical calculations for data fields"""
    
    @staticmethod
    def calculate_field_statistics(data: List[Dict[str, Any]], field: str) -> StatisticsResult:
        """
        Calculate basic statistics for a field.
        
        Args:
            data: Array of data objects
            field: Field name to calculate statistics for
        
        Returns:
            StatisticsResult with statistical measures
        """
        df = pd.DataFrame(data)
        
        if field not in df.columns:
            raise ValueError(f"Field '{field}' not found in data")
        
        field_data = df[field].dropna()
        
        if len(field_data) == 0:
            raise ValueError("No valid data points found")
        
        return StatisticsResult(
            count=len(field_data),
            mean=round(float(field_data.mean()), 2),
            median=round(float(field_data.median()), 2),
            std=round(float(field_data.std()), 2),
            min=round(float(field_data.min()), 2),
            max=round(float(field_data.max()), 2),
            q25=round(float(field_data.quantile(0.25)), 2),
            q75=round(float(field_data.quantile(0.75)), 2),
            field=field
        )

class TimeSeriesAnalyzer:
    """Handles time series specific analysis"""
    
    @staticmethod
    def calculate_price_changes(data: List[Dict[str, Any]], price_field: str) -> Dict[str, Any]:
        """
        Calculate price changes and trends for a specific field.
        
        Args:
            data: Array of data objects with date and price fields
            price_field: Field name to analyze
        
        Returns:
            Dictionary with price change analysis
        """
        df = pd.DataFrame(data)
        
        if price_field not in df.columns:
            raise ValueError(f"Field '{price_field}' not found in data")
        
        # Sort by date if date column exists
        if 'date' in df.columns:
            df = df.sort_values('date')
        
        price_data = df[price_field].dropna()
        
        if len(price_data) < 2:
            raise ValueError("Need at least 2 data points for price change analysis")
        
        # Calculate changes
        price_changes = price_data.diff().dropna()
        percentage_changes = (price_changes / price_data.shift(1) * 100).dropna()
        
        return {
            "field": price_field,
            "total_change": round(float(price_data.iloc[-1] - price_data.iloc[0]), 2),
            "percentage_change": round(float((price_data.iloc[-1] - price_data.iloc[0]) / price_data.iloc[0] * 100), 2),
            "average_change": round(float(price_changes.mean()), 2),
            "volatility": round(float(price_changes.std()), 2),
            "max_increase": round(float(price_changes.max()), 2),
            "max_decrease": round(float(price_changes.min()), 2),
            "positive_changes": int((price_changes > 0).sum()),
            "negative_changes": int((price_changes < 0).sum()),
            "sample_size": len(price_data)
        }
    
    @staticmethod
    def calculate_correlation_matrix(data: List[Dict[str, Any]], fields: List[str]) -> Dict[str, Any]:
        """
        Calculate correlation matrix for multiple fields.
        
        Args:
            data: Array of data objects
            fields: List of field names to include in correlation matrix
        
        Returns:
            Dictionary with correlation matrix and summary statistics
        """
        df = pd.DataFrame(data)
        
        # Validate all fields exist
        missing_fields = [field for field in fields if field not in df.columns]
        if missing_fields:
            raise ValueError(f"Fields not found in data: {missing_fields}")
        
        # Select only the specified fields and drop rows with any NaN values
        correlation_data = df[fields].dropna()
        
        if len(correlation_data) < 2:
            raise ValueError("Need at least 2 data points for correlation matrix")
        
        # Calculate correlation matrix
        correlation_matrix = correlation_data.corr()
        
        # Convert to dictionary for JSON serialization
        matrix_dict = correlation_matrix.round(6).to_dict()
        
        # Find strongest correlations (excluding self-correlations)
        strongest_correlations = []
        for i, field1 in enumerate(fields):
            for j, field2 in enumerate(fields):
                if i < j:  # Only upper triangle to avoid duplicates
                    corr_value = correlation_matrix.loc[field1, field2]
                    strongest_correlations.append({
                        "field1": field1,
                        "field2": field2,
                        "correlation": round(corr_value, 6),
                        "interpretation": CorrelationCalculator._interpret_correlation(corr_value)
                    })
        
        # Sort by absolute correlation value
        strongest_correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)
        
        return {
            "correlation_matrix": matrix_dict,
            "strongest_correlations": strongest_correlations[:5],  # Top 5
            "sample_size": len(correlation_data),
            "fields_analyzed": fields
        }
