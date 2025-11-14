from .extract.banxico_extractor import extract_banxico
from .extract.investiny_extractor import extract_investiny
from .extract.yfinance_extractor import extract_yfinance

if __name__ == "__main__":
    data_yf = extract_yfinance()
    data_inv = extract_investiny()
    data_banxico = extract_banxico()
    
    # df = transform_all(data_yf, data_inv, data_banxico)
    # load_to_postgres(df)

