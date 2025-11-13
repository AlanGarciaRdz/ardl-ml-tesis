"""
Banxico API Data Extractor
Extre series de tiempo del banco de MEXICO 
"""

import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import logging

from urllib3 import response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BanxicoExtractor:
    """
    Extraction desde Banxico SIE API
    Documentacion: https://www.banxico.org.mx/SieAPIRest/service/v1/
    """

    BASE_URL = "https://www.banxico.org.mx/SieAPIRest/service/v1"
    

    def __init__(self, token: str):
        """
        Inicializo extraccion Banxico

        Args:
           token: API token para autenticar
        """
        self.token = token
        self.headers = {
            'Bmx-Token': token,
            'Accept': 'application/json'
        }

    def get_series_data(
        self,
        series_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> pd.DataFrame:
        """
            Extrer data de una serie SF43718

        Args:
            series_id: SF43718
            start_date: Start fecha en formato YYYY-MM-DD
            end_date: Start fecha en formato YYYY-MM-DD

        Return:
            DataFrame con columnas date
        """

        url = f"{self.BASE_URL}/series/{series_id}/datos"

        if start_date and end_date:
            url += f"/{start_date}/{end_date}"

        url += f"?token={self.token}"

        logger.info(f"Obteniendo datos de Banxico url {url}")
        logger.info(f"Obteniendo datos de Banxico {series_id}")

        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()

            data = response.json()

            if 'bmx' in data and 'series' in data['bmx']:
                series_data = data['bmx']['series'][0]
                datos = series_data.get('datos', [])

                if not datos:
                    logger.warning(f"No se encontro datos de la serie {series_id}")
                    return pd.DataFrame(columns=['date', 'series_id', 'value'])
                
                df = pd.DataFrame(datos)
                df['series_id'] = series_id
                df.rename(columns={'fecha': 'date', 'dato': 'value'}, inplace=True)
                
                # Convertir dato a datetime
                df['date'] = pd.to_datetime(df['date'], format='%d/%m/%Y')
                
                # Converitr valor a  numeric
                df['value'] = pd.to_numeric(df['value'], errors='coerce')
                
                logger.info(f"Successfully extracted {len(df)} records for series {series_id}")
                return df[['date', 'series_id', 'value']]
            
            else:
                logger.error(f"Unexpected response format from Banxico API")
                return pd.DataFrame(columns=['date', 'series_id', 'value'])
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching data from Banxico: {e}")
            raise
        except Exception as e:
            logger.error(f"Error processing Banxico data: {e}")
            raise

    def get_latest_data(self, series_id: str, days_back: int = 30) -> pd.DataFrame:
            """
            Extract latest data for a series
            
            Args:
                series_id: Series identifier
                days_back: Number of days to look back from today
                
            Returns:
                DataFrame with latest data
            """
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)

            return self.get_series_data(
                series_id,
                start_date.strftime('%Y-%m-%d'),
                end_date.strftime('%Y-%m-%d')
            )

# Main extraction function for ETL pipeline
def extract_banxico(
    token: str = "ba0d7cf7cf4649f0555b9dddeef6de755b534ddb3d5d6ab0a364a8a6de29cc93",
    series_id: str = "SF43718",
    days_back: int = 15
) -> pd.DataFrame:
    """
    Main function to extract Banxico data for ETL pipeline
    
    Args:
        token: Banxico API token
        series_id: Series to extract (default: SF43718)
        days_back: Number of days to extract (default: 15)
        
    Returns:
        DataFrame with extracted data
    """
    extractor = BanxicoExtractor(token)
    
    # Get latest data
    df = extractor.get_latest_data(series_id, days_back=days_back)
    
    logger.info(f"Banxico extraction completed: {len(df)} records")
    return df

# Example usage
if __name__ == "__main__":
    # Example 1: Extract latest 30 days
    df = extract_banxico()
    print("\nLatest 15 days:")
    print(df.tail())
    print(f"\nTotal records: {len(df)}")
    
    
    
    