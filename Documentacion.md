# Documentación general del proyecto – Tesis Maestría

**Título:** Análisis de Series de Tiempo con Machine Learning y Modelos ARDL  
**Autor:** Alan Josué García Rodríguez  
**Programa:** Maestría en Ingeniería en Ciencia de Datos – Universidad de Guadalajara  
**Año:** 2024-2026  

**Propósito del documento:** Facilitar la migración y el traspaso del proyecto a otra persona (desarrollo, despliegue y mantenimiento).

---

## 1. Visión general del proyecto

Sistema de **predicción de precios** (materiales/commodities) que combina:

- Modelos econométricos y redes neuronales (LSTM).
- Datos macroeconómicos y de mercado.
- API REST (backend), interfaz web (frontend), ETL, entrenamiento de modelos y notebooks de análisis.

**Estructura de carpetas principal:**

```
projecto/
├── be/           # Backend (FastAPI)
├── fe/           # Frontend (React + TypeScript)
├── etl/          # Extracción, transformación y carga de datos
├── data/         # Datasets y archivos de datos
├── docs/         # Documentación técnica (flujos, modelos)
├── ml/           # Código de machine learning (referencias)
└── notebooks/    # Jupyter notebooks de análisis
```

---

## 2. Backend (`be/`)

### 2.1 Descripción

API REST con **FastAPI** para:

- Consulta de datos de series de tiempo.
- Pronósticos (LSTM, ARIMA, lineal simple, empírico).
- Entrenamiento de modelos (LSTM).
- Cotizaciones de envío y datos de ubicación (regiones, municipios, códigos postales).

### 2.2 Tecnologías

- **Python 3.8+**
- **FastAPI** – framework web
- **PostgreSQL** – base de datos (SQLAlchemy/psycopg2)
- **Pydantic** – validación y esquemas
- **TensorFlow** – modelos LSTM (entrenamiento y predicción)
- **Scikit-learn** – regresión lineal y utilidades
- **Uvicorn** – servidor ASGI

### 2.3 Estructura relevante

```
be/
├── app/
│   ├── main.py              # Punto de entrada, CORS, rutas
│   ├── core/                # config, database
│   ├── api/v1/
│   │   ├── api.py           # Registro de routers
│   │   └── endpoints/
│   │       ├── data.py      # GET datos por tabla
│   │       ├── forecast.py  # GET pronósticos
│   │       ├── quote.py     # POST cotización envío, GET total cotizaciones, info CP
│   │       ├── training.py  # POST entrenar modelo, GET estado y listado de modelos
│   │       └── locations.py # GET regiones, municipios, búsqueda, validación CP
│   ├── models/              # Modelos de BD y LSTM
│   ├── schemas/             # Esquemas Pydantic
│   ├── services/            # forecast_service, training_service
│   └── model_registry/      # Modelos entrenados (LSTM por tabla/fecha)
├── requirements.txt
├── .env                     # No versionar; usar env.example como plantilla
└── README.md
```

### 2.4 Variables de entorno (`.env`)

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` – conexión a PostgreSQL.
- `API_V1_STR` – prefijo de la API (ej. `/api/v1`).
- `BACKEND_CORS_ORIGINS` – orígenes permitidos para CORS.
- `ENVIRONMENT`, `DEBUG`, `MODEL_REGISTRY_PATH`, etc.

### 2.5 Cómo ejecutar

```bash
cd be
pip install -r requirements.txt
# Configurar .env (copiar desde env.example)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentación interactiva: **http://localhost:8000/docs** (Swagger).

### 2.6 Endpoints principales

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/v1/data/` | GET | Datos de una tabla (tabla, límite, offset, fechas). |
| `/api/v1/data/tables` | GET | Lista de tablas disponibles. |
| `/api/v1/forecast/` | GET | Pronóstico (tabla, columna, períodos, tipo: lstm, arima, simple_linear, empirical). |
| `/api/v1/quote/calcular-envio` | POST | Cálculo de cotización de envío. |
| `/api/v1/quote/total` | GET | Conteo de cotizaciones. |
| `/api/v1/quote/codigo-postal/{cp}` | GET | Información de ubicación por CP. |
| `/api/v1/training/train` | POST | Entrenar modelo (tabla, columna, tipo, etc.). |
| `/api/v1/training/status/{job_id}` | GET | Estado del job de entrenamiento. |
| `/api/v1/training/models` | GET | Listado de modelos entrenados. |
| `/api/v1/locations/regions` | GET | Regiones. |
| `/api/v1/locations/regions/{id}/municipalities` | GET | Municipios por región. |
| `/api/v1/locations/municipalities/search` | GET | Búsqueda de municipios. |
| `/api/v1/locations/municipalities/{cp}/validate` | GET | Validar código postal. |

---

## 3. Frontend (`fe/`)

### 3.1 Descripción

Aplicación web **React 18 + TypeScript** para:

- Landing y registro/login (Firebase).
- Dashboard, explorador de datos, analytics, cotizador y configuración.

### 3.2 Tecnologías

- **Vite**, **React 18**, **TypeScript**
- **Tailwind CSS**, **Radix UI**
- **React Router**, **TanStack Query (React Query)**
- **Firebase** – autenticación y datos de usuario (registro completo)
- **Recharts** – gráficos
- **React Hook Form + Zod** – formularios y validación
- **i18next** – internacionalización
- **Axios** – llamadas al backend

### 3.3 Estructura relevante

```
fe/
├── src/
│   ├── main.tsx, App.tsx
│   ├── pages/          # Landing, Dashboard, DataExplorer, Analytics, Quote, Settings, RegistrationForm
│   ├── components/     # layout (Sidebar, DashboardLayout), ui, charts, shared
│   ├── contexts/       # AuthContext (Firebase)
│   ├── services/       # authService, userService (Firestore), API
│   ├── config/         # firebase
│   ├── hooks/, lib/
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── .env.local / .env.production  # VITE_API_URL, Firebase, etc.
```

### 3.4 Rutas

- `/` – Landing (pública).
- `/dashboard` – Protegido; redirige a registro si el usuario no ha completado el formulario de registro.
  - `/dashboard` – Resumen.
  - `/dashboard/data` – Explorador de datos.
  - `/dashboard/analytics` – Análisis y gráficos.
  - `/dashboard/quote` – Cotizador de envío.
  - `/dashboard/settings` – Configuración.

Autenticación y “registro completo” se gestionan con **Firebase** y **Firestore** (userService, AuthContext, ProtectedRoute, RegistrationForm).

### 3.5 Cómo ejecutar

```bash
cd fe
npm install
# Configurar .env.local (VITE_API_URL, Firebase)
npm run dev
```

Abrir **http://localhost:5173** (o el puerto que indique Vite).

Build: `npm run build`. Scripts de despliegue: `deploy-rk`, `deploy-pitiax` (rsync a servidores).

---

## 4. ETL (`etl/`)

### 4.1 Descripción

Pipeline de **extracción, transformación y carga** de datos de mercados y precios:

- **Extract:** Yahoo Finance (yfinance), Investing.com (investiny), Banxico (tipo de cambio).
- **Load:** PostgreSQL vía `etl.database.db_connection` (pool, cursor, esquemas).
- **UI:** aplicación **Streamlit** para insertar/actualizar precios de materiales (`precios_materiales`).

### 4.2 Estructura relevante

```
etl/
├── run_etl.py              # Orquestación: extract_yfinance, extract_investiny, extract_banxico (transform/load comentados)
├── extract/
│   ├── yfinance_extractor.py   # Natural gas, HRC, VIX
│   ├── investiny_extractor.py  # Steel scrap, rebar
│   └── banxico_extractor.py    # Tipo de cambio
├── load/
│   ├── insert_precios_ui.py    # UI Streamlit para precios_materiales
│   └── schema.sql              # Esquema market_data (y otros si aplica)
├── database/
│   └── db_connection.py        # DatabaseManager, pool, get_cursor, init schema
├── .env                       # POSTGRES_* y POSTGRES_SSLMODE (formato KEY=value)
├── doc.txt                    # Referencias de fuentes (TradingView, Yahoo, Banxico, etc.)
└── README.md
```

### 4.3 Configuración de base de datos

La conexión se configura en **`etl/database/db_connection.py`**:

- Parámetros leídos de variables de entorno: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_SSLMODE`.
- Si el servidor exige SSL, usar `POSTGRES_SSLMODE=require` y un `.env` válido (solo líneas `KEY=value`).

### 4.4 Cómo ejecutar la UI de inserción de precios

Desde la raíz del proyecto, asegurando que el entorno tenga acceso al módulo `etl`:

```bash
cd etl
streamlit run load/insert_precios_ui.py
```

Si aparece error de `pg_hba.conf` o “no encryption”, en el servidor PostgreSQL hay que permitir la IP del cliente o exigir SSL; en el cliente, configurar `POSTGRES_SSLMODE=require` en `etl/.env`.

---

## 5. Data (`data/`)

### 5.1 Descripción

Carpeta de **datos estáticos o generados** usados por el backend, notebooks o análisis.

### 5.2 Contenido típico

- `data_forecast_lstm.json`, `norm_log_data.json`, `data.json` – datos de pronóstico o normalizados.
- `precios.csv` – precios en formato CSV.

Recomendación: no versionar datos sensibles o muy grandes; documentar en README o en esta doc el origen y formato de cada archivo.

---

## 6. Docs (`docs/`)

### 6.1 Descripción

Documentación técnica del análisis y de los modelos: flujos, VAR, LSTM, MCMC.

### 6.2 Contenido

- **LSTM.md / LSTM.html** – Flujo del modelo LSTM (datos, normalización, secuencias, entrenamiento, predicción).
- **var_model_workflow.md**, **var_bayesiana_model_workflow.md** – Flujos de modelos VAR.
- **MCMC.md** – Análisis MCMC.
- **var_workflows_print*.html** – Versiones imprimibles de flujos VAR.

Útil para que la persona que recibe el proyecto entienda cómo se entrena y se usa el LSTM y los modelos estadísticos.

---

## 7. ML (`ml/`)

### 7.1 Descripción

Código relacionado con **machine learning** (actualmente mínimo en carpeta `ml/`).

### 7.2 Contenido

- `person.py` – módulo de ejemplo o utilidad; no es el núcleo del ML.

La lógica principal de ML está en el **backend** (`be/app/models/`, `be/app/services/`): modelo LSTM, entrenamiento, pronósticos y registro de modelos en `model_registry`.

---

## 8. Notebooks (`notebooks/`)

### 8.1 Descripción

**Jupyter notebooks** para análisis exploratorio, modelos y experimentos (ARDL, VAR, LSTM, MCMC, regresión OLS).

### 8.2 Estructura

- **Raíz:** `Analisis_rebar.ipynb`, `Analisis_scrap.ipynb`, `Analisis_gas.ipynb`, `Analisis_hrcc1.ipynb`, `Analisis_varilla_distribuidor.ipynb`, `Analisis_VIX_varilla.ipynb`, `analisis_regresion_OLS_varilla.ipynb`.
- **redes_neuronales LSTM/** – `Analisis_rebar_LSTM.ipynb`, `Analisis_scrap_LSTM.ipynb`.
- **aic_bic/** – Análisis con criterios AIC/BIC (scrap, gas, varilla).
- **MCMC/** – `Analisis_scrap_MCMC.ipynb`.
- **Notas.txt** – Notas de trabajo.

Ejecución: desde la raíz del proyecto (o con `PYTHONPATH` que incluya la raíz) para que imports a `etl` o `be` funcionen si se usan.

---

## 9. Requisitos para migración

1. **Clonar el repositorio** y tener acceso a las ramas/entornos que se usen en producción.
2. **Python 3.8+** con `venv` para `be` y `etl`; **Node.js 18+** y `npm` para `fe`.
3. **PostgreSQL** creado (ej. base `tesis`), tablas y esquemas aplicados (migraciones o `schema.sql` del ETL).
4. **Variables de entorno** en `be/.env`, `etl/.env`, `fe/.env.local` (o `.env.production`), y configuración de **Firebase** en el frontend.
5. **Dependencias:**
   - Backend: `pip install -r be/requirements.txt`
   - Frontend: `cd fe && npm install`
   - ETL: mismo entorno Python que el backend o uno con las dependencias necesarias (pandas, streamlit, psycopg2, etc.).
6. **Orden de arranque sugerido:** PostgreSQL → Backend (puerto 8000) → Frontend (npm run dev) → ETL/Streamlit si se usa.

---

## 10. Contacto y referencias

- **Repositorio:** según configuración del proyecto (GitHub/GitLab, etc.).
- **README raíz:** `README.md` en la raíz del proyecto.
- **README por componente:** `be/README.md`, `fe/README.md`, `etl/README.md`.
