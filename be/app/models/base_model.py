from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import pandas as pd

class BaseForecastModel(ABC):
    """Abstract base class for all forecast models"""
    
    def __init__(self):
        self.is_trained = False
        self.metadata: Dict[str, Any] = {}
    
    @abstractmethod
    def train(self, data: pd.DataFrame, value_column: str, **params) -> Dict[str, Any]:
        """
        Train the model on the provided data.
        
        Args:
            data: DataFrame with time series data (must have 'date' column)
            value_column: Name of the column to forecast
            **params: Model-specific hyperparameters
            
        Returns:
            Dictionary with training metrics (MSE, MAE, RMSE, MAPE, etc.)
        """
        pass
    
    @abstractmethod
    def predict(self, n_periods: int, **kwargs) -> List[float]:
        """
        Generate predictions for future periods.
        
        Args:
            n_periods: Number of future periods to forecast
            **kwargs: Additional prediction parameters
            
        Returns:
            List of predicted values
        """
        pass
    
    @abstractmethod
    def save(self, path: str) -> None:
        """
        Save the trained model to disk.
        
        Args:
            path: Directory path where model should be saved
        """
        pass
    
    @abstractmethod
    def load(self, path: str) -> None:
        """
        Load a trained model from disk.
        
        Args:
            path: Directory path where model is saved
        """
        pass
    
    def get_metadata(self) -> Dict[str, Any]:
        """Get model metadata (training date, metrics, parameters, etc.)"""
        return self.metadata