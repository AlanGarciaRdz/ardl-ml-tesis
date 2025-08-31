#!/usr/bin/env python3
"""
Simple script to test PostgreSQL database connection
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import test_connection, get_database_connection
from sqlalchemy import text

def main():
    print("Testing PostgreSQL database connection...")
    
    # Test basic connection
    if test_connection():
        print("✅ Database connection successful!")
        
        # Test querying the precios_materiales table
        try:
            with get_database_connection() as conn:
                # Check if the table exists
                result = conn.execute(text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'precios_materiales'
                    );
                """))
                
                table_exists = result.scalar()
                
                if table_exists:
                    print("✅ Table 'precios_materiales' found!")
                    
                    # Get table info
                    result = conn.execute(text("""
                        SELECT column_name, data_type 
                        FROM information_schema.columns 
                        WHERE table_name = 'precios_materiales'
                        ORDER BY ordinal_position;
                    """))
                    
                    columns = result.fetchall()
                    print(f"📋 Table columns: {len(columns)}")
                    for col in columns:
                        print(f"   - {col[0]}: {col[1]}")
                    
                    # Get row count
                    result = conn.execute(text("SELECT COUNT(*) FROM precios_materiales;"))
                    row_count = result.scalar()
                    print(f"📊 Total rows: {row_count}")
                    
                    # Get sample data
                    if row_count > 0:
                        result = conn.execute(text("SELECT * FROM precios_materiales LIMIT 3;"))
                        sample_data = result.fetchall()
                        print(f"📝 Sample data (first 3 rows):")
                        for i, row in enumerate(sample_data):
                            print(f"   Row {i+1}: {dict(row._mapping)}")
                    
                else:
                    print("❌ Table 'precios_materiales' not found!")
                    print("Available tables:")
                    result = conn.execute(text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_type = 'BASE TABLE'
                        ORDER BY table_name;
                    """))
                    tables = [row[0] for row in result]
                    for table in tables:
                        print(f"   - {table}")
                        
        except Exception as e:
            print(f"❌ Error querying table: {str(e)}")
    else:
        print("❌ Database connection failed!")
        print("\nPlease check your PostgreSQL configuration:")
        print(f"   Host: {os.getenv('POSTGRES_HOST', 'localhost')}")
        print(f"   Port: {os.getenv('POSTGRES_PORT', '5432')}")
        print(f"   Database: {os.getenv('POSTGRES_DB', 'tesis')}")
        print(f"   User: {os.getenv('POSTGRES_USER', 'postgres')}")
        print(f"   Password: {'[SET]' if os.getenv('POSTGRES_PASSWORD') else '[NOT SET]'}")

if __name__ == "__main__":
    main()
