# FastAPI Backend - Time Series Analysis API

A FastAPI-based backend service for time series data analysis with PostgreSQL integration.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL database
- pip (Python package manager)

### Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd be
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your PostgreSQL credentials:
   ```env
   # PostgreSQL Configuration
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=tesis
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   
   # API Configuration
   API_V1_STR=/api/v1
   PROJECT_NAME=Time Series Analysis API
   VERSION=1.0.0
   BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ENVIRONMENT=development
   DEBUG=true
   ```

4. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## 🔗 Available Endpoints

### Base Endpoints

#### `GET /`
- **Description**: Root endpoint
- **Response**: Welcome message
- **Example Response**:
  ```json
  {
    "message": "Welcome to Time Series Analysis API"
  }
  ```

#### `GET /health`
- **Description**: Health check endpoint
- **Response**: API status
- **Example Response**:
  ```json
  {
    "status": "healthy"
  }
  ```

### Data Endpoints

#### `GET /api/v1/data/`
- **Description**: Retrieve time series data from specified table
- **Parameters**:
  - `table_name` (required, string): Name of the table to query
  - `limit` (optional, integer, default: 100): Number of records to return
  - `offset` (optional, integer, default: 0): Number of records to skip
  - `start_date` (optional, string): Filter data from this date (YYYY-MM-DD format)
  - `end_date` (optional, string): Filter data until this date (YYYY-MM-DD format)

- **Example Request**:
  ```
  GET /api/v1/data/?table_name=precios_materiales&limit=10&offset=0
  ```

- **Example Response**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "fecha": "2024-01-01",
        "precio": 1500.50,
        "material": "Acero"
      }
    ],
    "total": 100,
    "limit": 10,
    "offset": 0
  }
  ```

#### `GET /api/v1/data/tables`
- **Description**: Get list of available tables in the database
- **Parameters**: None
- **Example Request**:
  ```
  GET /api/v1/data/tables
  ```

- **Example Response**:
  ```json
  {
    "tables": [
      "precios_materiales",
      "otra_tabla"
    ]
  }
  ```

## 🗄️ Database Configuration

The application is configured to work with PostgreSQL. Make sure you have:

1. **PostgreSQL server running**
2. **Database `tesis` created**
3. **Table `precios_materiales` exists** (or modify the queries for your table structure)

### Test Database Connection

You can test the database connection using the provided script:

```bash
python test_db_connection.py
```

## 🔧 Development

### Project Structure
```
be/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── api.py
│   │       └── endpoints/
│   │           └── data.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   ├── schemas/
│   └── main.py
├── requirements.txt
├── env.example
└── README.md
```

### Adding New Endpoints

1. Create new endpoint functions in `app/api/v1/endpoints/`
2. Register them in `app/api/v1/api.py`
3. The endpoints will automatically appear in Swagger documentation

### Environment Variables

All configuration is managed through environment variables in the `.env` file:

- `POSTGRES_HOST`: PostgreSQL server host
- `POSTGRES_PORT`: PostgreSQL server port
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `API_V1_STR`: API version prefix
- `PROJECT_NAME`: Project name for documentation
- `VERSION`: API version
- `BACKEND_CORS_ORIGINS`: Allowed CORS origins
- `ENVIRONMENT`: Environment (development/production)
- `DEBUG`: Debug mode

## 🧪 Testing

### Manual Testing with Swagger
1. Start the server: `uvicorn app.main:app --reload`
2. Open http://localhost:8000/docs
3. Use the interactive interface to test endpoints

### Testing Database Connection
```bash
python test_db_connection.py
```

## 🚨 Error Handling

The API includes comprehensive error handling for:
- Database connection issues
- Invalid table names
- Missing required parameters
- Date format errors
- SQL query errors

## 📝 Dependencies

Key dependencies (see `requirements.txt` for complete list):
- `fastapi==0.104.1`: Web framework
- `uvicorn[standard]==0.24.0`: ASGI server
- `psycopg2-binary==2.9.9`: PostgreSQL adapter
- `sqlalchemy==2.0.23`: Database ORM
- `python-dotenv==1.0.0`: Environment variable management
- `pydantic==2.5.0`: Data validation

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use strong passwords for database access
- Configure CORS properly for production
- Consider adding authentication for production use

## 📞 Support

For issues or questions:
1. Check the Swagger documentation at `/docs`
2. Review the logs for error messages
3. Test database connectivity with `test_db_connection.py`
