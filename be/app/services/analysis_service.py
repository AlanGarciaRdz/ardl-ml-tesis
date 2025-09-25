from typing import Any, Dict, List, Union
from enum import Enum
from pydantic import BaseModel
from app.models.ml_models import (
    CorrelationRequest,
    CorrelationResult,
    StatisticsResult,
    CorrelationCalculator,
    StatisticsCalculator,
    TimeSeriesAnalyzer
)

class AnalysisType(str, Enum):
    """Enum for different types of analysis"""
    CORRELATION = "correlation"
    STATISTICS = "statistics"
    PRICE_ANALYSIS = "price_analysis"
    CORRELATION_MATRIX = "correlation_matrix"

class AnalysisRequest(BaseModel):
    """Generic request model for all analysis types"""
    analysis_type: AnalysisType
    data: List[Dict[str, Any]]
    parameters: Dict[str, Any] = {}

class AnalysisResponse(BaseModel):
    """Generic response model for all analysis types"""
    analysis_type: str
    result: Union[CorrelationResult, StatisticsResult, Dict[str, Any]]
    success: bool = True
    message: str = "Analysis completed successfully"

class AnalysisService:
    """Service layer for orchestrating different ML analyses"""
    
    @staticmethod
    def perform_analysis(request: AnalysisRequest) -> AnalysisResponse:
        """
        Main method to perform any type of analysis based on the request.
        
        Args:
            request: AnalysisRequest with type and parameters
        
        Returns:
            AnalysisResponse with the analysis results
        """
        try:
            if request.analysis_type == AnalysisType.CORRELATION:
                return AnalysisService._perform_correlation_analysis(request)
            elif request.analysis_type == AnalysisType.STATISTICS:
                return AnalysisService._perform_statistics_analysis(request)
            elif request.analysis_type == AnalysisType.PRICE_ANALYSIS:
                return AnalysisService._perform_price_analysis(request)
            elif request.analysis_type == AnalysisType.CORRELATION_MATRIX:
                return AnalysisService._perform_correlation_matrix_analysis(request)
            else:
                raise ValueError(f"Unsupported analysis type: {request.analysis_type}")
                
        except Exception as e:
            return AnalysisResponse(
                analysis_type=request.analysis_type.value,
                result={},
                success=False,
                message=f"Analysis failed: {str(e)}"
            )
    
    @staticmethod
    def _perform_correlation_analysis(request: AnalysisRequest) -> AnalysisResponse:
        """Perform correlation analysis"""
        # Extract parameters
        field1 = request.parameters.get("field1")
        field2 = request.parameters.get("field2")
        
        if not field1 or not field2:
            raise ValueError("Both field1 and field2 are required for correlation analysis")
        
        # Create correlation request
        correlation_request = CorrelationRequest(
            data=request.data,
            field1=field1,
            field2=field2
        )
        
        # Perform analysis
        result = CorrelationCalculator.calculate_pearson_correlation(correlation_request)
        
        return AnalysisResponse(
            analysis_type=AnalysisType.CORRELATION.value,
            result=result,
            success=True,
            message="Correlation analysis completed successfully"
        )
    
    @staticmethod
    def _perform_statistics_analysis(request: AnalysisRequest) -> AnalysisResponse:
        """Perform statistics analysis"""
        # Extract parameters
        field = request.parameters.get("field")
        
        if not field:
            raise ValueError("Field parameter is required for statistics analysis")
        
        # Perform analysis
        result = StatisticsCalculator.calculate_field_statistics(request.data, field)
        
        return AnalysisResponse(
            analysis_type=AnalysisType.STATISTICS.value,
            result=result,
            success=True,
            message="Statistics analysis completed successfully"
        )
    
    @staticmethod
    def _perform_price_analysis(request: AnalysisRequest) -> AnalysisResponse:
        """Perform price analysis"""
        # Extract parameters
        price_field = request.parameters.get("price_field")
        
        if not price_field:
            raise ValueError("price_field parameter is required for price analysis")
        
        # Perform analysis
        result = TimeSeriesAnalyzer.calculate_price_changes(request.data, price_field)
        
        return AnalysisResponse(
            analysis_type=AnalysisType.PRICE_ANALYSIS.value,
            result=result,
            success=True,
            message="Price analysis completed successfully"
        )
    
    @staticmethod
    def _perform_correlation_matrix_analysis(request: AnalysisRequest) -> AnalysisResponse:
        """Perform correlation matrix analysis"""
        # Extract parameters
        fields = request.parameters.get("fields")
        
        if not fields or not isinstance(fields, list):
            raise ValueError("fields parameter (list) is required for correlation matrix analysis")
        
        # Perform analysis
        result = TimeSeriesAnalyzer.calculate_correlation_matrix(request.data, fields)
        
        return AnalysisResponse(
            analysis_type=AnalysisType.CORRELATION_MATRIX.value,
            result=result,
            success=True,
            message="Correlation matrix analysis completed successfully"
        )
    
    @staticmethod
    def get_available_analyses() -> Dict[str, Any]:
        """Get information about available analysis types and their parameters"""
        return {
            "available_analyses": [
                {
                    "type": AnalysisType.CORRELATION.value,
                    "description": "Calculate Pearson correlation between two fields",
                    "required_parameters": ["field1", "field2"],
                    "example": {
                        "analysis_type": "correlation",
                        "parameters": {
                            "field1": "varilla_distribuidor",
                            "field2": "varilla_credito"
                        }
                    }
                },
                {
                    "type": AnalysisType.STATISTICS.value,
                    "description": "Calculate basic statistics for a field",
                    "required_parameters": ["field"],
                    "example": {
                        "analysis_type": "statistics",
                        "parameters": {
                            "field": "precio_mercado"
                        }
                    }
                },
                {
                    "type": AnalysisType.PRICE_ANALYSIS.value,
                    "description": "Analyze price changes and trends",
                    "required_parameters": ["price_field"],
                    "example": {
                        "analysis_type": "price_analysis",
                        "parameters": {
                            "price_field": "varilla_distribuidor"
                        }
                    }
                },
                {
                    "type": AnalysisType.CORRELATION_MATRIX.value,
                    "description": "Calculate correlation matrix for multiple fields",
                    "required_parameters": ["fields"],
                    "example": {
                        "analysis_type": "correlation_matrix",
                        "parameters": {
                            "fields": ["varilla_distribuidor", "varilla_credito", "precio_mercado"]
                        }
                    }
                }
            ]
        }
