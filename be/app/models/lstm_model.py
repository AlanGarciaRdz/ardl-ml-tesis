import os
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
from keras.models import Sequential, load_model
from keras.layers import LSTM, Dense, Dropout
from keras.callbacks import EarlyStopping
import joblib
import json
from datetime import datetime

from app.models.base_model import BaseForecastModel


class LSTMModel(BaseForecastModel):
    """LSTM model for time series forecasting"""
    
    def __init__(self, sequence_length: int = 20, lstm_units: int = 2000, dropout_rate: float = 0.2):
        super().__init__()
        self.sequence_length = sequence_length
        self.lstm_units = lstm_units
        self.dropout_rate = dropout_rate
        self.model: Optional[Sequential] = None
        self.scaler: Optional[MinMaxScaler] = None
        self.last_sequence: Optional[np.ndarray] = None
        self.training_data: Optional[pd.DataFrame] = None
        
    def _create_sequences(self, data: np.ndarray, seq_length: int) -> tuple:
        """
        Create sequences of data for LSTM.
        
        Args:
            data: Array of scaled data
            seq_length: Length of the time window
            
        Returns:
            Tuple of (X, y) where X are features and y are targets
        """
        X, y = [], []
        for i in range(seq_length, len(data)):
            X.append(data[i-seq_length:i, 0])
            y.append(data[i, 0])
        return np.array(X), np.array(y)
    
    def train(self, data: pd.DataFrame, value_column: str, **params) -> Dict[str, Any]:
        """
        Train the LSTM model.
        
        Args:
            data: DataFrame with 'date' and value_column
            value_column: Column name to forecast
            **params: Additional parameters (epochs, batch_size, validation_split, etc.)
        """
        # Extract parameters
        epochs = params.get('epochs', 100)
        batch_size = params.get('batch_size', 32)
        validation_split = params.get('validation_split', 0.2)
        train_test_split_ratio = params.get('train_test_split', 0.78)
        
        # Ensure data is sorted by date
        data = data.sort_values('date').copy()
        
        # Extract the time series
        if value_column not in data.columns:
            raise ValueError(f"Column '{value_column}' not found in data")
        
        serie = data[value_column].dropna()
        if len(serie) < self.sequence_length + 10:
            raise ValueError(f"Not enough data. Need at least {self.sequence_length + 10} points, got {len(serie)}")
        
        # Store training data for future predictions
        self.training_data = data.copy()
        
        # Convert to array and normalize
        data_array = serie.values.reshape(-1, 1)
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        data_scaled = self.scaler.fit_transform(data_array)
        
        # Create sequences
        X, y = self._create_sequences(data_scaled, self.sequence_length)
        
        # Split into train and test
        split_index = int(len(X) * train_test_split_ratio)
        X_train, X_test = X[:split_index], X[split_index:]
        y_train, y_test = y[:split_index], y[split_index:]
        
        # Reshape for LSTM: (samples, timesteps, features)
        X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
        X_test = X_test.reshape((X_test.shape[0], X_test.shape[1], 1))
        
        # Build model
        self.model = Sequential([
            LSTM(self.lstm_units, activation='tanh', return_sequences=False, 
                 input_shape=(self.sequence_length, 1)),
            Dropout(self.dropout_rate),
            Dense(1)
        ])
        
        self.model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        
        # Train model
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=0
        )
        
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=[early_stopping],
            verbose=0
        )
        
        # Evaluate on test set
        y_pred_scaled = self.model.predict(X_test, verbose=0)
        y_pred = self.scaler.inverse_transform(y_pred_scaled)
        y_test_original = self.scaler.inverse_transform(y_test.reshape(-1, 1))
        
        # Calculate metrics
        mse = mean_squared_error(y_test_original, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test_original, y_pred)
        mape = np.mean(np.abs((y_test_original - y_pred) / y_test_original)) * 100
        
        # Store last sequence for future predictions
        self.last_sequence = data_scaled[-self.sequence_length:].flatten()
        
        # Update metadata
        self.metadata = {
            'model_type': 'lstm',
            'training_date': datetime.now().isoformat(),
            'sequence_length': self.sequence_length,
            'lstm_units': self.lstm_units,
            'dropout_rate': self.dropout_rate,
            'epochs_trained': len(history.history['loss']),
            'metrics': {
                'mse': float(mse),
                'rmse': float(rmse),
                'mae': float(mae),
                'mape': float(mape)
            },
            'train_size': len(X_train),
            'test_size': len(X_test),
            'value_column': value_column
        }
        
        self.is_trained = True
        
        return self.metadata['metrics']
    
    def predict(self, n_periods: int, **kwargs) -> List[float]:
        """
        Generate future predictions.
        
        Args:
            n_periods: Number of periods to forecast
            
        Returns:
            List of predicted values
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model must be trained before making predictions")
        
        if self.last_sequence is None:
            raise ValueError("Model not properly initialized. Last sequence is missing.")
        
        predictions = []
        current_sequence = self.last_sequence.copy()
        
        for _ in range(n_periods):
            # Reshape for model: (1, sequence_length, 1)
            current_sequence_reshaped = current_sequence.reshape((1, self.sequence_length, 1))
            
            # Make prediction
            next_pred = self.model.predict(current_sequence_reshaped, verbose=0)
            predictions.append(next_pred[0, 0])
            
            # Update sequence: add prediction and remove first value
            current_sequence = np.append(current_sequence[1:], next_pred[0, 0])
        
        # Denormalize predictions
        predictions = np.array(predictions).reshape(-1, 1)
        predictions = self.scaler.inverse_transform(predictions)
        
        return predictions.flatten().tolist()
    
    def save(self, path: str) -> None:
        """Save model, scaler, and metadata"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        os.makedirs(path, exist_ok=True)
        
        # Save Keras model
        if self.model is not None:
            self.model.save(os.path.join(path, 'model.h5'))
        
        # Save scaler
        if self.scaler is not None:
            joblib.dump(self.scaler, os.path.join(path, 'scaler.pkl'))
        
        # Save last sequence
        if self.last_sequence is not None:
            np.save(os.path.join(path, 'last_sequence.npy'), self.last_sequence)
        
        # Save metadata
        with open(os.path.join(path, 'metadata.json'), 'w') as f:
            json.dump(self.metadata, f, indent=2)
        
        # Save config
        config = {
            'sequence_length': self.sequence_length,
            'lstm_units': self.lstm_units,
            'dropout_rate': self.dropout_rate
        }
        with open(os.path.join(path, 'config.json'), 'w') as f:
            json.dump(config, f, indent=2)
    
    def load(self, path: str) -> None:
        """Load model, scaler, and metadata"""
        # Load model
        model_path = os.path.join(path, 'model.h5')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        self.model = load_model(model_path)
        
        # Load scaler
        scaler_path = os.path.join(path, 'scaler.pkl')
        if os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)
        
        # Load last sequence
        sequence_path = os.path.join(path, 'last_sequence.npy')
        if os.path.exists(sequence_path):
            self.last_sequence = np.load(sequence_path)
        
        # Load metadata
        metadata_path = os.path.join(path, 'metadata.json')
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
                self.sequence_length = self.metadata.get('sequence_length', 20)
        
        # Load config
        config_path = os.path.join(path, 'config.json')
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.sequence_length = config.get('sequence_length', 20)
                self.lstm_units = config.get('lstm_units', 2000)
                self.dropout_rate = config.get('dropout_rate', 0.2)
        
        self.is_trained = True