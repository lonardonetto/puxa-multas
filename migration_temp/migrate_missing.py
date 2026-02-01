import requests
import json
import subprocess
import os

DONOR_REF = "ujgnfwdeifiqvvvbeyjk"
RECEIVER_REF = "acyqrpkdsxddkqfaakty"
DONOR_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ25md2RlaWZpcXZ2dmJleWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMjQ5MSwiZXhwIjoyMDgzMzc4NDkxfQ.u6kLfUWRi6InGssn02YviamkPyxQCnxG5w-iMhSh6jc"
RECEIVER_PASSWORD = "LeoN1982PPPP@@@@"

def sql_escape(val):
    if val is None: return "NULL"
    if isinstance(val, bool): return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)): return str(val)
    if isinstance(val, (dict, list)): 
        j = json.dumps(val)
        j_escaped = j.replace("'", "''")
        return f"'{j_escaped}'::jsonb"
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

def run_missing_migration():
    os.environ['PGPASSWORD'] = RECEIVER_PASSWORD
    db_host = f"db.{RECEIVER_REF}.supabase.co"
    # Order matters for foreign keys
    TABLES = ["editais", "editais_backup", "edital_compras", "fases_custom", "faturamento", "rastreamento_cobrancas", "recursos"]
    
    print("--- MIGRATING MISSING TABLES ---")
    
    all_sql = []
    
    for table in TABLES:
        print(f"Table {table}: ", end="", flush=True)
        resp = requests.get(f"https://{DONOR_REF}.supabase.co/rest/v1/{table}?select=*", headers={"apikey": DONOR_SERVICE_ROLE, "Authorization": f"Bearer {DONOR_SERVICE_ROLE}"})
        if resp.status_code != 200:
            print(f"Error {resp.status_code}")
            continue
        data = resp.json()
        if not data:
            print("Empty.")
            continue
            
        print(f"Rows: {len(data)}")
        for row in data:
            cols = ", ".join([f'"{k}"' for k in row.keys()])
            vals = [sql_escape(v) for v in row.values()]
            all_sql.append(f'INSERT INTO public."{table}" ({cols}) VALUES ({", ".join(vals)}) ON CONFLICT DO NOTHING;')

    with open("migration_temp/missing_data.sql", "w") as f:
        f.write("SET statement_timeout = 0;\n")
        f.write("SET client_encoding = 'UTF8';\n\n")
        f.write("\n".join(all_sql))
        
    print("\n--- Applying Missing Data Script ---")
    res = subprocess.run(f"psql -h {db_host} -U postgres -d postgres -f migration_temp/missing_data.sql", shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        print("MISSING DATA MIGRATION COMPLETE!")
    else:
        print(f"Errors: {res.stderr}")

if __name__ == "__main__":
    run_missing_migration()
