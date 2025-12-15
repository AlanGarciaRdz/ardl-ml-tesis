"""
PostgreSQL Database Connection Manager
Handles connections, pooling, and schema initialization
"""

import os
import logging
from contextlib import contextmanager
from typing import Optional, Dict, Any
import psycopg2
from psycopg2 import pool
from psycopg2.extensions import connection, cursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseManager:
    """
    Manages PostgreSQL connections with pooling and safe resource handling
    """
    
    def __init__(self):
        """Initialize connection parameters from environment variables"""
        password = os.getenv('POSTGRES_PASSWORD', '')
        # If password is empty string from env, use default
        if not password:
            password = 'abcd1234'
        self.config = {
            'host': os.getenv('POSTGRES_HOST', 'localhost'),
            'port': int(os.getenv('POSTGRES_PORT', 5432)),
            'database': os.getenv('POSTGRES_DB', 'tesis'),
            'user': os.getenv('POSTGRES_USER', 'postgres'),
            'password': os.getenv('POSTGRES_PASSWORD', 'abcd1234')
        }
        self._pool: Optional[pool.SimpleConnectionPool] = None
        
    def _create_pool(self, minconn: int = 1, maxconn: int = 5):
        """Create connection pool"""
        try:
            self._pool = psycopg2.pool.SimpleConnectionPool(
                minconn=minconn,
                maxconn=maxconn,
                **self.config
            )
            logger.info(f"Connection pool created (min={minconn}, max={maxconn})")
        except psycopg2.Error as e:
            logger.error(f"Error creating connection pool: {e}")
            raise
    
    def get_connection(self) -> connection:
        """
        Get a connection from the pool
        
        Returns:
            psycopg2 connection object
        """
        if self._pool is None:
            self._create_pool()
        
        try:
            conn = self._pool.getconn()
            logger.debug("Connection retrieved from pool")
            return conn
        except psycopg2.Error as e:
            logger.error(f"Error getting connection: {e}")
            raise
    
    def return_connection(self, conn: connection):
        """Return connection to pool"""
        if self._pool and conn:
            self._pool.putconn(conn)
            logger.debug("Connection returned to pool")
    
    def close_all_connections(self):
        """Close all connections in pool"""
        if self._pool:
            self._pool.closeall()
            logger.info("All connections closed")
    
    @contextmanager
    def get_cursor(self, commit: bool = True):
        """
        Context manager for safe database operations
        
        Args:
            commit: Whether to commit transaction on success
            
        Yields:
            psycopg2 cursor object
            
        Example:
            with db_manager.get_cursor() as cur:
                cur.execute("SELECT * FROM market_data LIMIT 10")
                results = cur.fetchall()
        """
        conn = None
        cur = None
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            yield cur
            
            if commit:
                conn.commit()
                logger.debug("Transaction committed")
                
        except psycopg2.Error as e:
            if conn:
                conn.rollback()
                logger.error(f"Transaction rolled back due to error: {e}")
            raise
        finally:
            if cur:
                cur.close()
            if conn:
                self.return_connection(conn)
    
    def test_connection(self) -> bool:
        """
        Test database connection
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            with self.get_cursor(commit=False) as cur:
                cur.execute("SELECT version();")
                version = cur.fetchone()[0]
                logger.info(f"✅ Database connection successful!")
                logger.info(f"PostgreSQL version: {version}")
                return True
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            return False
    
    def initialize_schema(self, schema_path: str = 'etl/load/schema.sql') -> bool:
        """
        Initialize database schema from SQL file
        
        Args:
            schema_path: Path to schema.sql file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not os.path.exists(schema_path):
                logger.error(f"Schema file not found: {schema_path}")
                return False
            
            with open(schema_path, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            
            with self.get_cursor() as cur:
                cur.execute(schema_sql)
                logger.info(f"✅ Schema initialized successfully from {schema_path}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Error initializing schema: {e}")
            return False
    
    def table_exists(self, table_name: str) -> bool:
        """
        Check if a table exists in the database
        
        Args:
            table_name: Name of the table to check
            
        Returns:
            True if table exists, False otherwise
        """
        try:
            with self.get_cursor(commit=False) as cur:
                cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = %s
                    );
                """, (table_name,))
                exists = cur.fetchone()[0]
                return exists
        except Exception as e:
            logger.error(f"Error checking table existence: {e}")
            return False
    
    def get_table_info(self, table_name: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a table
        
        Args:
            table_name: Name of the table
            
        Returns:
            Dictionary with table statistics or None
        """
        try:
            with self.get_cursor(commit=False) as cur:
                # Get row count
                cur.execute(f"SELECT COUNT(*) FROM {table_name};")
                row_count = cur.fetchone()[0]
                
                # Get column info
                cur.execute("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = %s 
                    ORDER BY ordinal_position;
                """, (table_name,))
                columns = cur.fetchall()
                
                return {
                    'table_name': table_name,
                    'row_count': row_count,
                    'columns': [{'name': col[0], 'type': col[1]} for col in columns]
                }
        except Exception as e:
            logger.error(f"Error getting table info: {e}")
            return None
    
    def execute_query(self, query: str, params: tuple = None, fetch: bool = True):
        """
        Execute a query and optionally fetch results
        
        Args:
            query: SQL query string
            params: Query parameters
            fetch: Whether to fetch results
            
        Returns:
            Query results if fetch=True, None otherwise
        """
        try:
            with self.get_cursor() as cur:
                cur.execute(query, params)
                if fetch:
                    return cur.fetchall()
                return None
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise


# Global database manager instance
db_manager = DatabaseManager()


# Convenience functions for common operations
def get_cursor(commit: bool = True):
    """Get a database cursor (convenience function)"""
    return db_manager.get_cursor(commit=commit)


def test_connection() -> bool:
    """Test database connection (convenience function)"""
    return db_manager.test_connection()


def initialize_schema(schema_path: str = 'etl/load/schema.sql') -> bool:
    """Initialize database schema (convenience function)"""
    return db_manager.initialize_schema(schema_path)


if __name__ == "__main__":
    """Test the database connection and setup"""
    print("=" * 60)
    print("Database Connection Manager - Test Suite")
    print("=" * 60)
    
    # Test 1: Connection
    print("\n1. Testing database connection...")
    if test_connection():
        print("   ✅ Connection test passed")
    else:
        print("   ❌ Connection test failed")
        exit(1)
    
    # Test 2: Check if table exists
    print("\n2. Checking if market_data table exists...")
    if db_manager.table_exists('market_data'):
        print("   ✅ Table 'market_data' exists")
        
        # Get table info
        info = db_manager.get_table_info('market_data')
        if info:
            print(f"   📊 Row count: {info['row_count']}")
            print(f"   📋 Columns: {len(info['columns'])}")
    else:
        print("   ⚠️  Table 'market_data' does not exist")
        print("   💡 Run: python -c 'from etl.database.db_connection import initialize_schema; initialize_schema()'")
    
    # Test 3: Simple query
    print("\n3. Testing simple query...")
    try:
        with get_cursor(commit=False) as cur:
            cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
            count = cur.fetchone()[0]
            print(f"   ✅ Query executed successfully")
            print(f"   📊 Total public tables: {count}")
    except Exception as e:
        print(f"   ❌ Query failed: {e}")
    
    # Cleanup
    print("\n4. Cleaning up connections...")
    db_manager.close_all_connections()
    print("   ✅ All connections closed")
    
    print("\n" + "=" * 60)
    print("✨ Database connection manager is ready to use!")
    print("=" * 60)