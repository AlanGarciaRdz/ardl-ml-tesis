from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client only if credentials are provided
try:
    if settings.SUPABASE_URL and settings.SUPABASE_URL != "your-supabase-url":
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    else:
        supabase = None
except Exception:
    supabase = None

def get_supabase_client() -> Client:
    """Get Supabase client instance."""
    if supabase is None:
        raise Exception("Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY in your .env file")
    return supabase
