from typing import Dict, Any, Optional, List
import pandas as pd
from datetime import datetime, timedelta
from app.models.model_registry_service import ModelRegistryService

# Try to import LSTM model, but don't fail if Keras is not installed
try:
    from app.models.lstm_model import LSTMModel
    LSTM_AVAILABLE = True
except ImportError:
    LSTM_AVAILABLE = False
    LSTMModel = None


class ForecastService:
    """Service for generating forecasts using trained models"""
    
    def __init__(self):
        self.registry = ModelRegistryService()
    
    def generate_forecast(self, table_name: str, model_type: str, 
                         value_column: str, forecast_periods: int,
                         version: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Generate forecast using a trained model.
        
        Args:
            table_name: Name of the table
            model_type: Type of model ('lstm', 'arima', etc.)
            value_column: Column that was forecasted
            forecast_periods: Number of periods to forecast
            version: Optional model version (defaults to latest)
            
        Returns:
            List of forecast dictionaries with date, predicted_value, etc.
        """
        # Load model
        if model_type.lower() == 'lstm':
            if not LSTM_AVAILABLE:
                raise ValueError("LSTM model is not available. Keras/TensorFlow is not installed.")
            model = self.registry.load_model(
                LSTMModel, table_name, model_type, version
            )
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        # Generate predictions
        predictions = model.predict(forecast_periods)
        
        # Get metadata to determine date interval
        metadata = self.registry.get_model_metadata(table_name, model_type, version)
        
        # Generate future dates (assuming weekly intervals, adjust as needed)
        # You might want to store the last date in metadata
        last_date = datetime.now()  # Or get from metadata
        day_interval = 7  # Weekly forecasts
        
        forecast_data = []
        for i, prediction in enumerate(predictions):
            forecast_date = last_date + timedelta(days=(i + 1) * day_interval)
            forecast_data.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'period': i + 1,
                'predicted_value_bajista': float(prediction) * 2 / 0.95,
                'predicted_value_conservador': float(prediction) * 2 / 0.93,
                'predicted_value_alza': float(prediction) * 2 / 0.90,
                'confidence_interval': {
                    'lower': float(prediction * 0.9),  # Simple 10% interval
                    'upper': float(prediction * 1.1)
                }
            })
        
        return forecast_data