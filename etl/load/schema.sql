-- =====================================================
-- Market Data Schema for YFinance ETL Pipeline
-- =====================================================
-- Purpose: Store historical market data from Yahoo Finance
-- Assets: Natural Gas, HRC Steel, VIX, and future additions
-- Features: Upsert support, timestamps, indexing
-- =====================================================

-- Drop table if exists (use with caution in production)
--DROP TABLE IF EXISTS market_data CASCADE;

-- Create main market data table
CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    asset_name VARCHAR(100) NOT NULL,
    open NUMERIC(18, 4),
    high NUMERIC(18, 4),
    low NUMERIC(18, 4),
    close NUMERIC(18, 4) NOT NULL,
    volume BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combination of date and asset
    CONSTRAINT uq_market_data_date_asset UNIQUE (date, asset_name),
    
    -- Data validation constraints
    CONSTRAINT chk_positive_prices CHECK (
        open >= 0 AND high >= 0 AND low >= 0 AND close >= 0
    ),
    CONSTRAINT chk_high_low CHECK (high >= low),
    CONSTRAINT chk_volume_positive CHECK (volume >= 0)
);

-- Create indexes for common query patterns
CREATE INDEX idx_market_data_date ON market_data(date DESC);
CREATE INDEX idx_market_data_asset ON market_data(asset_name);
CREATE INDEX idx_market_data_date_asset ON market_data(date DESC, asset_name);
CREATE INDEX idx_market_data_created_at ON market_data(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on UPDATE
CREATE TRIGGER trg_market_data_updated_at
    BEFORE UPDATE ON market_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for latest data per asset
CREATE OR REPLACE VIEW v_latest_market_data AS
SELECT DISTINCT ON (asset_name)
    id,
    date,
    asset_name,
    open,
    high,
    low,
    close,
    volume,
    created_at,
    updated_at
FROM market_data
ORDER BY asset_name, date DESC;

-- Create view for data quality statistics
CREATE OR REPLACE VIEW v_market_data_stats AS
SELECT 
    asset_name,
    COUNT(*) as total_records,
    MIN(date) as first_date,
    MAX(date) as last_date,
    COUNT(DISTINCT date) as unique_dates,
    COUNT(CASE WHEN volume = 0 THEN 1 END) as zero_volume_count,
    AVG(close) as avg_close_price,
    MIN(close) as min_close_price,
    MAX(close) as max_close_price,
    MAX(updated_at) as last_updated
FROM market_data
GROUP BY asset_name
ORDER BY asset_name;

-- =====================================================
-- Sample Queries for Testing
-- =====================================================

-- View all data for a specific asset
-- SELECT * FROM market_data WHERE asset_name = 'Natural Gas' ORDER BY date DESC LIMIT 10;

-- View latest prices for all assets
-- SELECT * FROM v_latest_market_data;

-- Check data quality statistics
-- SELECT * FROM v_market_data_stats;

-- Find records updated in last 24 hours
-- SELECT * FROM market_data WHERE updated_at > CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- Count total records
-- SELECT COUNT(*) FROM market_data;

-- =====================================================
-- Grant permissions (adjust user as needed)
-- =====================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON market_data TO your_user;
-- GRANT USAGE, SELECT ON SEQUENCE market_data_id_seq TO your_user;