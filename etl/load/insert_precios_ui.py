import os
import sys
import datetime
import streamlit as st

# Compute project root (parent of 'etl')
CURRENT_FILE = os.path.abspath(__file__)               # .../projecto/etl/load/insert_precios_ui.py
LOAD_DIR = os.path.dirname(CURRENT_FILE)               # .../projecto/etl/load
ETL_DIR = os.path.dirname(LOAD_DIR)                    # .../projecto/etl
PROJECT_ROOT = os.path.dirname(ETL_DIR)                # .../projecto

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from etl.database.db_connection import db_manager

# Initialize session state for calculated values
if 'scrap_mxn' not in st.session_state:
    st.session_state.scrap_mxn = 0.0
if 'gas_mxn' not in st.session_state:
    st.session_state.gas_mxn = 0.0
if 'rebar_mxn' not in st.session_state:
    st.session_state.rebar_mxn = 0.0
if 'hrcc1_mxn' not in st.session_state:
    st.session_state.hrcc1_mxn = 0.0
if 'varilla_distribuidor' not in st.session_state:
    st.session_state.varilla_distribuidor = 0.0
if 'varilla_credito' not in st.session_state:
    st.session_state.varilla_credito = 0.0
if 'precio_mercado' not in st.session_state:
    st.session_state.precio_mercado = 0.0
if 'existing_id' not in st.session_state:
    st.session_state.existing_id = None
if 'coeficiente' not in st.session_state:
    st.session_state.coeficiente = float(0.95)

st.title("Insertar/Actualizar registros en precios_materiales")
st.write("Selecciona una fecha para cargar datos existentes o crear uno nuevo.")

# Date selector for loading existing data
col_date1, col_date2 = st.columns(2)
with col_date1:
    load_date = st.date_input("Fecha para cargar/editar", value=datetime.date.today())
with col_date2:
    load_btn = st.button("📥 Cargar Datos", type="secondary")

# Load existing data
if load_btn:
    try:
        with db_manager.get_cursor(commit=False) as cur:
            cur.execute("""
                SELECT id, date, year, scrap, gas, rebar, hrcc1,
                       scrap_mxn, gas_mxn, rebar_mxn, hrcc1_mxn,
                       tipo_de_cambio, varilla_distribuidor, varilla_credito, precio_mercado , coeficiente
                FROM precios_materiales
                WHERE date = %s
                LIMIT 1
            """, (load_date,))
            row = cur.fetchone()
            
            if row:
                st.session_state.existing_id = row[0]
                st.session_state.loaded_date = row[1]
                st.session_state.loaded_year = row[2]
                st.session_state.loaded_scrap = row[3] or 0.0
                st.session_state.loaded_gas = row[4] or 0.0
                st.session_state.loaded_rebar = row[5] or 0.0
                st.session_state.loaded_hrcc1 = row[6] or 0.0
                st.session_state.loaded_scrap_mxn = row[7] or 0.0
                st.session_state.loaded_gas_mxn = row[8] or 0.0
                st.session_state.loaded_rebar_mxn = row[9] or 0.0
                st.session_state.loaded_hrcc1_mxn = row[10] or 0.0
                st.session_state.loaded_tipo_de_cambio = row[11] or 0.0
                st.session_state.loaded_varilla_distribuidor = row[12] or 0.0
                st.session_state.loaded_varilla_credito = row[13] or 0.0
                st.session_state.loaded_precio_mercado = row[14] or 0.0
                st.session_state.loaded_coeficiente = float(row[15]) if row[15] else 0.95
                
                # Update calculated values
                st.session_state.scrap_mxn = st.session_state.loaded_scrap_mxn
                st.session_state.gas_mxn = st.session_state.loaded_gas_mxn
                st.session_state.rebar_mxn = st.session_state.loaded_rebar_mxn
                st.session_state.hrcc1_mxn = st.session_state.loaded_hrcc1_mxn
                st.session_state.varilla_distribuidor = st.session_state.loaded_varilla_distribuidor
                st.session_state.varilla_credito = st.session_state.loaded_varilla_credito
                st.session_state.precio_mercado = st.session_state.loaded_precio_mercado
                st.session_state.coeficiente = float(st.session_state.loaded_coeficiente)

                st.success(f"✅ Datos cargados para {load_date} (ID: {st.session_state.existing_id})")
            else:
                st.session_state.existing_id = None
                # Clear loaded values
                for key in list(st.session_state.keys()):
                    if key.startswith('loaded_'):
                        del st.session_state[key]
                st.info(f"ℹ️ No se encontraron datos para {load_date}. Puedes crear un nuevo registro.")
    except Exception as e:
        st.error(f"Error al cargar datos: {e}")

# Show current mode
if st.session_state.existing_id:
    st.info(f"✏️ Modo Edición: Actualizando registro ID {st.session_state.existing_id}")
else:
    st.info("➕ Modo Creación: Creando nuevo registro")

st.write("Completa los campos y haz clic en **Calcular** para actualizar los valores en MXN, luego **Guardar**.")

with st.form("precios_form"):
    # Use loaded values if available, otherwise use defaults
    default_date = st.session_state.get('loaded_date', datetime.date.today())
    default_year = st.session_state.get('loaded_year', datetime.date.today().year)
    default_scrap = st.session_state.get('loaded_scrap', 0.0)
    default_gas = st.session_state.get('loaded_gas', 0.0)
    default_rebar = st.session_state.get('loaded_rebar', 0.0)
    default_hrcc1 = st.session_state.get('loaded_hrcc1', 0.0)
    default_tipo_de_cambio = st.session_state.get('loaded_tipo_de_cambio', 0.0)
    
    date = st.date_input("date", value=default_date)
    year = st.number_input("year", value=int(default_year), step=1)

    scrap = st.number_input("scrap", value=float(default_scrap))
    gas = st.number_input("gas", value=float(default_gas))
    rebar = st.number_input("rebar", value=float(default_rebar))
    hrcc1 = st.number_input("hrcc1", value=float(default_hrcc1))
    tipo_de_cambio = st.number_input("tipo_de_cambio", value=float(default_tipo_de_cambio))

    # Show calculated MXN values (read-only)
    scrap_mxn = st.number_input("scrap_mxn", value=st.session_state.scrap_mxn)
    gas_mxn = st.number_input("gas_mxn", value=st.session_state.gas_mxn)
    rebar_mxn = st.number_input("rebar_mxn", value=st.session_state.rebar_mxn)
    hrcc1_mxn = st.number_input("hrcc1_mxn", value=st.session_state.hrcc1_mxn)
    
    varilla_distribuidor = st.number_input(
        "varilla_distribuidor", 
        value=st.session_state.varilla_distribuidor
    )
    varilla_credito = st.number_input(
        "varilla_credito", 
        value=st.session_state.varilla_credito
    )
    precio_mercado = st.number_input(
        "precio_mercado", 
        value=st.session_state.precio_mercado
    )
    coeficiente = st.number_input(
        "coeficiente (para cálculo precio_mercado)", 
        value=float(st.session_state.coeficiente),  
        step=0.001,
        format="%.4f"
    )

    col1, col2 = st.columns(2)
    with col1:
        calculate_btn = st.form_submit_button("Calcular MXN")
    with col2:
        submitted = st.form_submit_button("💾 Guardar" if st.session_state.existing_id else "➕ Insertar")

# Handle calculate button
if calculate_btn:
    if tipo_de_cambio and tipo_de_cambio != 0:
        st.session_state.scrap_mxn = scrap * tipo_de_cambio
        st.session_state.gas_mxn = gas * tipo_de_cambio
        st.session_state.rebar_mxn = rebar * tipo_de_cambio
        st.session_state.hrcc1_mxn = hrcc1 * tipo_de_cambio

        st.session_state.varilla_distribuidor = st.session_state.scrap_mxn * 1.344
        st.session_state.varilla_credito = st.session_state.scrap_mxn * 1.372
        st.session_state.precio_mercado = (st.session_state.scrap_mxn * 2) / coeficiente

        st.success("✅ Valores MXN calculados correctamente!")
    else:
        st.warning("⚠️ Por favor ingresa un tipo de cambio válido")

if submitted:
    # Use session state values for MXN
    scrap_mxn_val = st.session_state.scrap_mxn
    gas_mxn_val = st.session_state.gas_mxn
    rebar_mxn_val = st.session_state.rebar_mxn
    hrcc1_mxn_val = st.session_state.hrcc1_mxn

    varilla_distribuidor_val = st.session_state.varilla_distribuidor 
    varilla_credito_val = st.session_state.varilla_credito 
    precio_mercado_val = st.session_state.precio_mercado

    try:
        with db_manager.get_cursor() as cur:
            # Check if record exists for this date
            if st.session_state.existing_id:
                # UPDATE existing record
                update_sql = """
                    UPDATE precios_materiales
                    SET year = %s, scrap = %s, gas = %s, rebar = %s, hrcc1 = %s,
                        scrap_mxn = %s, gas_mxn = %s, rebar_mxn = %s, hrcc1_mxn = %s,
                        tipo_de_cambio = %s, varilla_distribuidor = %s, 
                        varilla_credito = %s, precio_mercado = %s, coeficiente = %s
                    WHERE id = %s
                    RETURNING id;
                """
                params = (
                    int(year) if year is not None else None,
                    float(scrap) if scrap is not None else None,
                    float(gas) if gas is not None else None,
                    float(rebar) if rebar is not None else None,
                    float(hrcc1) if hrcc1 is not None else None,
                    float(scrap_mxn_val) if scrap_mxn_val is not None else None,
                    float(gas_mxn_val) if gas_mxn_val is not None else None,
                    float(rebar_mxn_val) if rebar_mxn_val is not None else None,
                    float(hrcc1_mxn_val) if hrcc1_mxn_val is not None else None,
                    float(tipo_de_cambio) if tipo_de_cambio is not None else None,
                    float(varilla_distribuidor_val) if varilla_distribuidor_val is not None else None,
                    float(varilla_credito_val) if varilla_credito_val is not None else None,
                    float(precio_mercado_val) if precio_mercado_val is not None else None,
                    float(coeficiente) if coeficiente is not None else 0.95,
                    st.session_state.existing_id
                )
                cur.execute(update_sql, params)
                updated_id = cur.fetchone()[0]
                st.success(f"✅ Registro actualizado correctamente (ID: {updated_id})")
            else:
                # Check if date already exists
                cur.execute("SELECT id FROM precios_materiales WHERE date = %s", (date,))
                existing = cur.fetchone()
                
                if existing:
                    st.warning(f"⚠️ Ya existe un registro para {date}. Usa 'Cargar Datos' para editarlo.")
                else:
                    # INSERT new record
                    insert_sql = """
                        INSERT INTO precios_materiales (
                            date, year, scrap, gas, rebar, hrcc1,
                            scrap_mxn, gas_mxn, rebar_mxn, hrcc1_mxn,
                            tipo_de_cambio, varilla_distribuidor, varilla_credito, precio_mercado, coeficiente
                        )
                        VALUES (%s, %s, %s, %s, %s, %s,
                                %s, %s, %s, %s,
                                %s, %s, %s, %s, %s)
                        RETURNING id;
                    """
                    params = (
                        date,
                        int(year) if year is not None else None,
                        float(scrap) if scrap is not None else None,
                        float(gas) if gas is not None else None,
                        float(rebar) if rebar is not None else None,
                        float(hrcc1) if hrcc1 is not None else None,
                        float(scrap_mxn_val) if scrap_mxn_val is not None else None,
                        float(gas_mxn_val) if gas_mxn_val is not None else None,
                        float(rebar_mxn_val) if rebar_mxn_val is not None else None,
                        float(hrcc1_mxn_val) if hrcc1_mxn_val is not None else None,
                        float(tipo_de_cambio) if tipo_de_cambio is not None else None,
                        float(varilla_distribuidor_val) if varilla_distribuidor_val is not None else None,
                        float(varilla_credito_val) if varilla_credito_val is not None else None,
                        float(precio_mercado_val) if precio_mercado_val is not None else None,
                        float(coeficiente) if coeficiente is not None else 0.95,
                    )
                    cur.execute(insert_sql, params)
                    new_id = cur.fetchone()[0]
                    st.success(f"✅ Nuevo registro insertado correctamente (ID: {new_id})")
                    # Clear existing_id after successful insert
                    st.session_state.existing_id = None
                    
    except Exception as e:
        st.error(f"Error al guardar datos: {e}")