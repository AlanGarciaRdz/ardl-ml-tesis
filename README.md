# Tesis de Maestría: Análisis de Series de Tiempo con Machine Learning y Modelos ARDL

## Información del Proyecto

**Título:** Análisis de Series de Tiempo con Machine Learning y Modelos ARDL

**Autor:** Alan Josué García Rodríguez  
**Programa:** Maestría en Ingeniería en Ciencia de Datos  
**Institución:** Universidad de Guadalajara
**Año:** 2024-2026

##Objetivo del Proyecto

Este proyecto de tesis se enfoca en el análisis avanzado de series de tiempo, implementando técnicas de Machine Learning y modelos ARDL (Autoregressive Distributed Lag) para el estudio de relaciones dinámicas entre variables económicas, financieras o científicas.

## Estructura del Proyecto

```
projecto/
├── be/                     # Backend (FastAPI)
│   ├── app/               # Aplicación principal
│   │   ├── core/          # Configuraciones core
│   │   ├── api/           # Endpoints de la API
│   │   ├── models/        # Modelos de base de datos
│   │   ├── schemas/       # Esquemas Pydantic
│   │   ├── crud/          # Operaciones CRUD
│   │   └── services/      # Lógica de negocio
│   ├── tests/             # Pruebas unitarias
│   └── requirements.txt   # Dependencias Python
├── fe/                     # Frontend (React)
├── ml/                     # Modelos de Machine Learning
├── data/                   # Datasets y datos
├── notebooks/              # Jupyter notebooks de análisis
└── docs/                   # Documentación adicional
```

## 🚀 Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y rápido para Python
- **SQLAlchemy**: ORM para manejo de base de datos
- **Pydantic**: Validación de datos y serialización
- **PostgreSQL**: Base de datos relacional
- **Alembic**: Migraciones de base de datos
- **JWT**: Autenticación y autorización

### Machine Learning
- **Pandas**: Manipulación y análisis de datos
- **NumPy**: Computación numérica
- **Scikit-learn**: Algoritmos de ML
- **Statsmodels**: Modelos estadísticos (ARDL)
- **Matplotlib/Seaborn**: Visualización de datos
- **Jupyter**: Notebooks interactivos

## 📊 Modelos ARDL

Los modelos ARDL (Autoregressive Distributed Lag) son una extensión de los modelos de regresión que permiten:

- **Análisis de cointegración**: Identificar relaciones de largo plazo
- **Modelos de corrección de errores**: Capturar dinámicas de corto plazo
- **Flexibilidad en el orden de integración**: Manejar series I(0) e I(1)
- **Inferencia estadística robusta**: Validar relaciones causales

## 🔬 Aplicaciones del Proyecto

### Áreas de Estudio
1. **Economía**: Relaciones entre variables macroeconómicas
2. **Finanzas**: Análisis de mercados financieros
3. **Ciencias Sociales**: Estudios de comportamiento y tendencias
4. **Ciencias Naturales**: Análisis de fenómenos climáticos

### Casos de Uso
- Predicción de variables económicas
- Análisis de causalidad entre series temporales
- Detección de patrones estacionales
- Modelado de relaciones dinámicas

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Python 3.8+
- PostgreSQL 12+
- Node.js 16+ (para frontend futuro)

### Backend
```bash
cd be/
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# Ejecutar la aplicación
uvicorn app.main:app --reload
```

### Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb tesis_db

# Ejecutar migraciones (cuando estén configuradas)
alembic upgrade head
```

## 📈 Características del Sistema

### API REST
- **Autenticación JWT**: Sistema seguro de login
- **CRUD de usuarios**: Gestión de usuarios del sistema
- **Endpoints protegidos**: Rutas con autenticación requerida
- **Validación de datos**: Esquemas Pydantic para entrada/salida
- **Documentación automática**: OpenAPI/Swagger en `/docs`

### Seguridad
- Hashing de contraseñas con bcrypt
- Tokens JWT con expiración configurable
- CORS configurado para desarrollo
- Validación de entrada robusta

## 🧪 Pruebas

```bash
cd be/
pytest tests/ -v
```

## 📚 Documentación de la API

Una vez ejecutada la aplicación, la documentación interactiva estará disponible en:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔮 Próximos Pasos

### Fase 1: Backend Base ✅
- [x] Estructura del proyecto
- [x] API REST con FastAPI
- [x] Sistema de autenticación
- [x] Base de datos configurada

### Fase 2: Análisis de Datos
- [ ] Implementación de modelos ARDL
- [ ] Integración con bibliotecas de ML
- [ ] Endpoints para análisis estadístico
- [ ] Visualización de resultados

### Fase 3: Frontend
- [ ] Interfaz de usuario React
- [ ] Dashboards interactivos
- [ ] Gráficos de series de tiempo
- [ ] Formularios de análisis

### Fase 4: ML Pipeline
- [ ] Automatización de análisis
- [ ] Modelos de predicción
- [ ] Evaluación de performance
- [ ] Despliegue en producción

## 👨‍💻 Autor

**Alan Josué García Rodríguez**  
Estudiante de Maestría en Ingeniería en Ciencia de Datos

### Contacto
- **Email**: [alan.garcia2009@alumnos.udg.mx]
- **LinkedIn**: [https://www.linkedin.com/in/alan-garc%C3%ADa-rodr%C3%ADguez-9a46752a/]
- **GitHub**: [https://github.com/AlanGarciaRdz]

## 📄 Licencia

Este proyecto es parte de una tesis de maestría y está bajo uso académico.

## 🙏 Agradecimientos



---

**Nota**: Este proyecto está en desarrollo activo como parte de la tesis de maestría. Las funcionalidades se implementarán gradualmente según el cronograma académico.

