"""
Investiny Data Extractor
Extrae datos historicos de commodities desde Investing.com
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import logging
from investiny import historical_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class InvestinyExtractor:
    """
    Extraccion desde Investing.com usando investiny
    """
    
    # Diccionario de assets disponibles
    ASSETS = {
        'steel_scrap': {
            'id': 996703,
            'name': 'SSCc1'#'Steel Scrap'
        },
        'rebar': {
            'id': 996702,
            'name': 'SRRc1'#'Rebar'
        }
    }
    
    
    def get_asset_data(
        self,
        investing_id: int,
        asset_name: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Extraer data de un asset especifico
        
        Args:
            investing_id: ID del asset en Investing.com (ej: 996703)
            asset_name: Nombre del asset (ej: 'Steel Scrap')
            start_date: Fecha inicio en formato DD/MM/YYYY
            end_date: Fecha fin en formato DD/MM/YYYY
            
        Returns:
            DataFrame con columnas: date, asset_name, open, high, low, close, volume
        """
        logger.info(f"Obteniendo datos de {asset_name} (ID: {investing_id})")
        
        try:
            # Obtener datos historicos (retorna diccionario)
            data = historical_data(
                investing_id=investing_id,
                from_date=start_date,
                to_date=end_date
            )
            
            # Convertir diccionario a DataFrame
            df = pd.DataFrame(data)
            
            if len(df) == 0:
                logger.warning(f"No se encontraron datos para {asset_name}")
                return pd.DataFrame(columns=['date', 'asset_name', 'open', 'high', 'low', 'close'])
            
            # Agregar nombre del asset
            df['asset_name'] = asset_name
            
            # Convertir date a datetime
            df['date'] = pd.to_datetime(df['date'], format='%m/%d/%Y')
            
            # Reordenar columnas
            df = df[['date', 'asset_name', 'open', 'high', 'low', 'close']]
            
            logger.info(f"Extraidos {len(df)} registros para {asset_name}")
            return df
            
        except Exception as e:
            logger.error(f"Error obteniendo datos de {asset_name}: {e}")
            raise
    
    
    def get_multiple_assets(
        self,
        assets: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Extraer datos de multiples assets
        
        Args:
            assets: Lista de nombres de assets (ej: ['steel_scrap', 'rebar'])
            start_date: Fecha inicio en formato DD/MM/YYYY
            end_date: Fecha fin en formato DD/MM/YYYY
            
        Returns:
            DataFrame combinado con todos los assets
        """
        all_data = []
        
        for asset_key in assets:
            if asset_key not in self.ASSETS:
                logger.warning(f"Asset '{asset_key}' no encontrado. Disponibles: {list(self.ASSETS.keys())}")
                continue
            
            asset_info = self.ASSETS[asset_key]
            print(asset_info)
            try:
                df = self.get_asset_data(
                    investing_id=asset_info['id'],
                    asset_name=asset_info['name'],
                    start_date=start_date,
                    end_date=end_date
                )
                if not df.empty:
                    all_data.append(df)
            except Exception as e:
                logger.error(f"Error extrayendo {asset_key}: {e}")
                continue
        
        if all_data:
            return pd.concat(all_data, ignore_index=True)
        else:
            return pd.DataFrame(columns=['date', 'asset_name', 'open', 'high', 'low', 'close'])


# Main extraction function for ETL pipeline
def extract_investiny(
    assets: List[str] = ['steel_scrap', 'rebar'],
    days_back: int = 15
) -> pd.DataFrame:
    """
    Funcion principal para extraer datos de Investiny para ETL pipeline
    
    Args:
        assets: Lista de assets a extraer (default: ['steel_scrap', 'rebar'])
        days_back: Numero de dias a extraer (default: 15)
        
    Returns:
        DataFrame con datos extraidos
    """
    extractor = InvestinyExtractor()
    
    # Calcular fechas
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    
    # Extraer datos de todos los assets
    df = extractor.get_multiple_assets(
        assets=assets,
        start_date=start_date.strftime('%m/%d/%Y'),
        end_date=end_date.strftime('%m/%d/%Y'),
    )
    
    logger.info(f"Investiny extraction completada: {len(df)} registros")
    return df


# Example usage
if __name__ == "__main__":
    # Ejemplo 1: Extraer ultimos 15 dias de Steel Scrap y Rebar
    df = extract_investiny(assets=['steel_scrap'])
    print("\nUltimos 15 dias (Steel Scrap):")
    print(df.tail(10))
    print(f"\nTotal registros: {len(df)}")

    df = extract_investiny(assets=['rebar'])
    print("\nUltimos 15 dias (Rebar):")
    print(df.tail(10))
    print(f"\nTotal registros: {len(df)}")
    
   