# ETL

## Ejecutar la interfaz de inserción de precios

Desde la raíz de la carpeta `etl`, ejecuta:

```bash
streamlit run load/insert_precios_ui.py
```


Si falla la base de datos 

no pg_hba.conf entry for host "189.203.106.25", user "postgres", database "tesis", no encryption

sudo nano /var/lib/pgsql/data/pg_hba.conf

Agrega una línea como esta:

host    tesis    postgres    189.203.106.25/32    md5

sudo systemctl restart postgresql