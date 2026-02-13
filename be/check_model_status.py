#!/usr/bin/env python3
"""Check if LSTM model can be loaded without making API call"""

import sys
sys.path.insert(0, '/Users/alangarcia/Documents/Alan/Maestria/Tesis/projecto/be')

from app.services.forecast_service import ForecastService
from app.models.model_registry_service import ModelRegistryService

print("Checking model registry...")
registry = ModelRegistryService()

# List available models
models = registry.list_models()
print(f"\nAvailable models: {len(models)}")
for model_info in models:
    print(f"  - {model_info['table_name']}/{model_info['model']} (v{model_info['latest_version']})")

# Try to get metadata for the LSTM model
print("\nChecking LSTM model metadata...")
try:
    metadata = registry.get_model_metadata('precios_materiales', 'lstm')
    print(f"  ✓ Model found")
    print(f"  Training date: {metadata.get('training_date')}")
    print(f"  Last data date: {metadata.get('last_data_date', 'NOT SET - This might cause issues!')}")
    print(f"  Metrics: MAE={metadata['metrics']['mae']:.2f}, RMSE={metadata['metrics']['rmse']:.2f}")
except Exception as e:
    print(f"  ❌ Error: {e}")

# Try to generate forecast using the service
print("\nTrying to generate forecast...")
try:
    service = ForecastService()
    forecast = service.generate_forecast(
        table_name='precios_materiales',
        model='lstm',
        value_column='scrap_mxn',
        forecast_periods=7
    )
    print(f"  ✓ Forecast generated: {len(forecast)} periods")
    print(f"  First: {forecast[0]['date']} - ${forecast[0]['predicted_value_conservador']:.2f}")
    print(f"  Last:  {forecast[-1]['date']} - ${forecast[-1]['predicted_value_conservador']:.2f}")
    
    # Check if flat
    values = [f['predicted_value_conservador'] for f in forecast]
    variation = max(values) - min(values)
    print(f"  Variation: {variation:.2f}")
    if variation < 1:
        print("  ⚠️  WARNING: Forecast is FLAT!")
    else:
        print("  ✓ Forecast has variation")
        
except Exception as e:
    print(f"  ❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
