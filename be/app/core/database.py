from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from app.core.config import settings

# Initialize PostgreSQL engine
engine: Engine = None

def get_database_engine() -> Engine:
    """Get PostgreSQL database engine instance."""
    global engine
    if engine is None:
        try:
            engine = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=300,
                echo=settings.DEBUG
            )
        except Exception as e:
            raise Exception(f"Failed to connect to PostgreSQL: {str(e)}")
    return engine

def get_database_connection():
    """Get a database connection."""
    engine = get_database_engine()
    return engine.connect()

def test_connection():
    """Test the database connection."""
    try:
        with get_database_connection() as conn:
            result = conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        return False
