"""
YFinance Data Extractor
Extrae datos historicos de indices y commodities desde Yahoo Finance
"""

import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class YFinanceExtractor:
    """
    Extraccion desde Yahoo Finance usando yfinance
    """
    
    # Diccionario de assets disponibles
    ASSETS = {
        'natural_gas': {'ticker': 'NG=F', 'name': 'Natural Gas'},
        'hrc': {'ticker': 'HRC=F', 'name': 'HRC Steel'},
        'vix': {'ticker': '^VIX', 'name': 'VIX'}
    }
    
    def get_asset_data(self, ticker: str, asset_name: str, start_date: str, end_date: str) -> pd.DataFrame:
        """Extraer data de un asset especifico"""
        logger.info(f"Obteniendo datos de {asset_name} (Ticker: {ticker})")
        
        try:
            df = yf.download(ticker, start=start_date, end=end_date, progress=False)
            
            if len(df) == 0:
                logger.warning(f"No se encontraron datos para {asset_name}")
                return pd.DataFrame(columns=['date', 'asset_name', 'open', 'high', 'low', 'close', 'volume'])
            
            # Limpiar columnas multi-index si existen
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)
            
            df = df.reset_index()
            df.columns = df.columns.str.lower()
            df['asset_name'] = asset_name
            
            cols = ['date', 'asset_name', 'open', 'high', 'low', 'close', 'volume']
            df = df[[col for col in cols if col in df.columns]]
            
            logger.info(f"Extraidos {len(df)} registros para {asset_name}")
            return df
            
        except Exception as e:
            logger.error(f"Error obteniendo datos de {asset_name}: {e}")
            raise


def extract_yfinance(assets: List[str] = ['natural_gas', 'hrc', 'vix'], days_back: int = 15) -> pd.DataFrame:
    """Funcion principal para extraer datos de YFinance"""
    extractor = YFinanceExtractor()
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    
    all_data = []
    for asset_key in assets:
        if asset_key not in extractor.ASSETS:
            logger.warning(f"Asset '{asset_key}' no encontrado")
            continue
        
        asset_info = extractor.ASSETS[asset_key]
        try:
            df = extractor.get_asset_data(
                ticker=asset_info['ticker'],
                asset_name=asset_info['name'],
                start_date=start_date.strftime('%Y-%m-%d'),
                end_date=end_date.strftime('%Y-%m-%d')
            )
            if not df.empty:
                all_data.append(df)
        except Exception as e:
            logger.error(f"Error extrayendo {asset_key}: {e}")
    
    df_final = pd.concat(all_data, ignore_index=True) if all_data else pd.DataFrame()
    logger.info(f"YFinance extraction completada: {len(df_final)} registros")
    return df_final


if __name__ == "__main__":
    df = extract_yfinance(assets=['natural_gas'])
    print("\nUltimos 15 dias (Natural Gas):")
    print(df.tail(10))
    print(f"\nTotal registros: {len(df)}")
    
    df = extract_yfinance(assets=['hrc'])
    print("\nUltimos 15 dias (HRC Steel):")
    print(df.tail(10))
    print(f"\nTotal registros: {len(df)}")
    
    df = extract_yfinance(assets=['vix'])
    print("\nUltimos 15 dias (VIX):")
    print(df.tail(10))
    print(f"\nTotal registros: {len(df)}")