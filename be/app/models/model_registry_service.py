import os
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path

class ModelRegistryService:
    """Service for managing trained model storage and retrieval"""
    
    def __init__(self, base_path: str = "app/model_registry"):
        """
        Initialize the model registry.
        
        Args:
            base_path: Base directory for model storage (relative to project root)
        """
        # Get absolute path
        project_root = Path(__file__).parent.parent.parent
        self.base_path = project_root / base_path
        self.base_path.mkdir(parents=True, exist_ok=True)
        
        # Registry metadata file
        self.registry_file = self.base_path / "registry_metadata.json"
        self._load_registry()
    
    def _load_registry(self) -> None:
        """Load registry metadata from file"""
        if self.registry_file.exists():
            with open(self.registry_file, 'r') as f:
                self.registry = json.load(f)
        else:
            self.registry = {}
    
    def _save_registry(self) -> None:
        """Save registry metadata to file"""
        with open(self.registry_file, 'w') as f:
            json.dump(self.registry, f, indent=2)
    
    def _get_model_path(self, table_name: str, model_type: str, version: Optional[str] = None) -> Path:
        """
        Get the path for a model.
        
        Args:
            table_name: Name of the table
            model_type: Type of model (lstm, arima, etc.)
            version: Optional version identifier (defaults to latest)
            
        Returns:
            Path to model directory
        """
        if version:
            model_dir = self.base_path / table_name / model_type / version
        else:
            # Get latest version
            model_key = f"{table_name}_{model_type}"
            if model_key in self.registry:
                versions = self.registry[model_key].get('versions', [])
                if versions:
                    version = max(versions, key=lambda v: v['created_at'])
                    version = version['version']
                else:
                    raise ValueError(f"No versions found for {model_key}")
            else:
                raise ValueError(f"Model not found: {model_key}")
            
            model_dir = self.base_path / table_name / model_type / version
        
        return model_dir
    
    def save_model(self, model: Any, table_name: str, model_type: str, 
                   value_column: str, metadata: Dict[str, Any]) -> str:
        """
        Save a trained model to the registry.
        
        Args:
            model: Model instance with save() method
            table_name: Name of the table
            model_type: Type of model (lstm, arima, etc.)
            value_column: Column name that was forecasted
            metadata: Additional metadata (metrics, parameters, etc.)
            
        Returns:
            Version identifier for the saved model
        """
        # Create version identifier (timestamp-based)
        version = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create directory structure
        model_dir = self.base_path / table_name / model_type / version
        model_dir.mkdir(parents=True, exist_ok=True)
        
        # Save model
        model.save(str(model_dir))
        
        # Update registry
        model_key = f"{table_name}_{model_type}"
        if model_key not in self.registry:
            self.registry[model_key] = {
                'table_name': table_name,
                'model_type': model_type,
                'value_column': value_column,
                'versions': []
            }
        
        version_info = {
            'version': version,
            'created_at': datetime.now().isoformat(),
            'value_column': value_column,
            'metadata': metadata
        }
        
        self.registry[model_key]['versions'].append(version_info)
        self.registry[model_key]['latest_version'] = version
        
        # Save registry
        self._save_registry()
        
        return version
    
    def load_model(self, model_class: Any, table_name: str, model_type: str, 
                   version: Optional[str] = None) -> Any:
        """
        Load a trained model from the registry.
        
        Args:
            model_class: Model class to instantiate
            table_name: Name of the table
            model_type: Type of model (lstm, arima, etc.)
            version: Optional version identifier (defaults to latest)
            
        Returns:
            Loaded model instance
        """
        model_path = self._get_model_path(table_name, model_type, version)
        
        # Instantiate and load model
        model = model_class()
        model.load(str(model_path))
        
        return model
    
    def list_models(self, table_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all models in the registry.
        
        Args:
            table_name: Optional filter by table name
            
        Returns:
            List of model information dictionaries
        """
        models = []
        for key, info in self.registry.items():
            if table_name is None or info['table_name'] == table_name:
                models.append({
                    'table_name': info['table_name'],
                    'model_type': info['model_type'],
                    'value_column': info['value_column'],
                    'latest_version': info.get('latest_version'),
                    'total_versions': len(info['versions']),
                    'versions': info['versions']
                })
        return models
    
    def get_model_metadata(self, table_name: str, model_type: str, 
                          version: Optional[str] = None) -> Dict[str, Any]:
        """
        Get metadata for a specific model.
        
        Args:
            table_name: Name of the table
            model_type: Type of model
            version: Optional version identifier
            
        Returns:
            Model metadata dictionary
        """
        model_key = f"{table_name}_{model_type}"
        if model_key not in self.registry:
            raise ValueError(f"Model not found: {model_key}")
        
        if version:
            versions = self.registry[model_key]['versions']
            for v in versions:
                if v['version'] == version:
                    return v['metadata']
            raise ValueError(f"Version {version} not found for {model_key}")
        else:
            # Return latest version metadata
            latest_version = self.registry[model_key].get('latest_version')
            if latest_version:
                return self.get_model_metadata(table_name, model_type, latest_version)
            raise ValueError(f"No versions found for {model_key}")
    
    def delete_model(self, table_name: str, model_type: str, version: str) -> None:
        """
        Delete a specific model version.
        
        Args:
            table_name: Name of the table
            model_type: Type of model
            version: Version identifier to delete
        """
        model_path = self._get_model_path(table_name, model_type, version)
        
        # Remove directory
        import shutil
        if model_path.exists():
            shutil.rmtree(model_path)
        
        # Update registry
        model_key = f"{table_name}_{model_type}"
        if model_key in self.registry:
            self.registry[model_key]['versions'] = [
                v for v in self.registry[model_key]['versions'] 
                if v['version'] != version
            ]
            
            # Update latest version if needed
            if self.registry[model_key].get('latest_version') == version:
                versions = self.registry[model_key]['versions']
                if versions:
                    latest = max(versions, key=lambda v: v['created_at'])
                    self.registry[model_key]['latest_version'] = latest['version']
                else:
                    del self.registry[model_key]['latest_version']
            
            self._save_registry()