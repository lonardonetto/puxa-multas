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
        # Serialize to JSON, then escape single quotes for SQL string literal
        j = json.dumps(val)
        j_escaped = j.replace("'", "''")
        return f"'{j_escaped}'::jsonb"
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

def run_master():
    os.environ['PGPASSWORD'] = RECEIVER_PASSWORD
    db_host = f"db.{RECEIVER_REF}.supabase.co"
    TABLES = ["organizations", "users", "user_organizations", "planos", "servicos", "clientes", "veiculos", "multas", "contratos", "historico_atividades"]
    
    print("--- MASTER MIGRATION STARTED ---")
    
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
            
        # 1. Align Columns
        donor_columns = set(data[0].keys())
        res = subprocess.run(f"psql -h {db_host} -U postgres -d postgres -t -c \"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}';\"", shell=True, capture_output=True, text=True)
        receiver_columns = set([line.strip() for line in res.stdout.splitlines() if line.strip()])
        
        missing = donor_columns - receiver_columns
        if missing:
            print(f"Adding {len(missing)} columns... ", end="")
            for col in missing:
                val = next((row[col] for row in data if row[col] is not None), None)
                ptype = "TEXT"
                if isinstance(val, bool): ptype = "BOOLEAN"
                elif isinstance(val, (int, float)): ptype = "NUMERIC"
                elif isinstance(val, (dict, list)): ptype = "JSONB"
                subprocess.run(f"psql -h {db_host} -U postgres -d postgres -c \"ALTER TABLE public.\\\"{table}\\\" ADD COLUMN IF NOT EXISTS \\\"{col}\\\" {ptype};\"", shell=True)
        
        # 2. Append SQL Inserts
        print(f"Rows: {len(data)}")
        for row in data:
            cols = ", ".join([f'"{k}"' for k in row.keys()])
            vals = [sql_escape(v) for v in row.values()]
            all_sql.append(f'INSERT INTO public."{table}" ({cols}) VALUES ({", ".join(vals)}) ON CONFLICT DO NOTHING;')

    # Write all to one big file
    with open("migration_temp/master_data.sql", "w") as f:
        f.write("SET statement_timeout = 0;\n")
        f.write("SET client_encoding = 'UTF8';\n\n")
        f.write("\n".join(all_sql))
        
    print("\n--- Applying Master Data Script ---")
    res = subprocess.run(f"psql -h {db_host} -U postgres -d postgres -f migration_temp/master_data.sql", shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        print("MIGRATION COMPLETE!")
    else:
        print(f"Errors during application: {res.stderr}")

if __name__ == "__main__":
    run_master()
