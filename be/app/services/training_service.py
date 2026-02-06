from typing import Dict, Any, Optional
import pandas as pd
from sqlalchemy import text
from app.core.database import get_database_connection
from app.models.model_registry_service import ModelRegistryService

# Try to import LSTM model, but don't fail if Keras is not installed
try:
    from app.models.lstm_model import LSTMModel
    LSTM_AVAILABLE = True
except ImportError:
    LSTM_AVAILABLE = False
    LSTMModel = None


class TrainingService:
    """Service for orchestrating model training"""
    
    def __init__(self):
        print("Initializing TrainingService")
        self.registry = ModelRegistryService()

    
    def _fetch_data_from_db(self, table_name: str, value_column: str,
                           start_date: Optional[str] = None,
                           end_date: Optional[str] = None,
                           limit: Optional[int] = None) -> pd.DataFrame:
        """
        Fetch data from database (reusing logic from data.py).
        
        Args:
            table_name: Name of the table
            value_column: Column to forecast
            start_date: Optional start date filter
            end_date: Optional end date filter
            limit: Optional limit (None = all data)
            
        Returns:
            DataFrame with data
        """
        with get_database_connection() as conn:
            base_query = f"SELECT * FROM {table_name}"
            where_conditions = []
            params = {}
            
            # Add date filters
            if start_date:
                where_conditions.append("Date >= :start_date")
                params['start_date'] = start_date
            if end_date:
                where_conditions.append("Date <= :end_date")
                params['end_date'] = end_date
            
            if where_conditions:
                base_query += " WHERE " + " AND ".join(where_conditions)
            
            # Order by date
            base_query += " ORDER BY Date DESC"
            
            if limit:
                base_query += " LIMIT :limit"
                params['limit'] = limit
            
            result = conn.execute(text(base_query), params)
            data = [dict(row._mapping) for row in result]
            
            if not data:
                raise ValueError(f"No data found in table '{table_name}'")
            
            df = pd.DataFrame(data)
            
            # Ensure date column is datetime
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'])
            elif 'Date' in df.columns:
                df['date'] = pd.to_datetime(df['Date'])
                df = df.drop('Date', axis=1)
            else:
                raise ValueError("No date column found in data")
            
            # Validate value column exists
            if value_column not in df.columns:
                raise ValueError(f"Column '{value_column}' not found in table '{table_name}'")
            
            return df
    
    def train_model(self, table_name: str, model_type: str, value_column: str,
                   start_date: Optional[str] = None,
                   end_date: Optional[str] = None,
                   model_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Train a model on data from the database.
        
        Args:
            table_name: Name of the table
            model_type: Type of model ('lstm', 'arima', etc.)
            value_column: Column to forecast
            start_date: Optional start date filter
            end_date: Optional end date filter
            model_params: Model-specific hyperparameters
            
        Returns:
            Dictionary with training results (version, metrics, etc.)
        """
        model_params = model_params or {}
        
        # Fetch data
        data = self._fetch_data_from_db(table_name, value_column, start_date, end_date)
        
        # Create and train model based on type
        if model_type.lower() == 'lstm':
            if not LSTM_AVAILABLE:
                raise ValueError("LSTM model is not available. Keras/TensorFlow is not installed.")
            model = LSTMModel(
                sequence_length=model_params.get('sequence_length', 20),
                lstm_units=model_params.get('lstm_units', 2000),
                dropout_rate=model_params.get('dropout_rate', 0.2)
            )
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        # Train model
        metrics = model.train(data, value_column, **model_params)
        
        # Save model
        version = self.registry.save_model(
            model=model,
            table_name=table_name,
            model_type=model_type,
            value_column=value_column,
            metadata=model.get_metadata()
        )
        
        return {
            'success': True,
            'version': version,
            'table_name': table_name,
            'model_type': model_type,
            'value_column': value_column,
            'metrics': metrics,
            'training_date': model.metadata.get('training_date')
        }