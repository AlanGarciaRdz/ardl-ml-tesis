

def run_etl():
    data_yf = extract_yfinance()
    data_inv = extract_investiny()
    data_banxico = extract_banxico()
    
    df = transform_all(data_yf, data_inv, data_banxico)
    load_to_postgres(df)

