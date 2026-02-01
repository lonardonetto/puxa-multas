import requests
import json
import subprocess
import os

DONOR_REF = "ujgnfwdeifiqvvvbeyjk"
RECEIVER_REF = "acyqrpkdsxddkqfaakty"
DONOR_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ25md2RlaWZpcXZ2dmJleWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMjQ5MSwiZXhwIjoyMDgzMzc4NDkxfQ.u6kLfUWRi6InGssn02YviamkPyxQCnxG5w-iMhSh6jc"
RECEIVER_PASSWORD = "LeoN1982PPPP@@@@"

# Tables in dependency order
TABLES = [
    "organizations", 
    "users", 
    "user_organizations", 
    "planos", 
    "servicos", 
    "clientes", 
    "veiculos", 
    "multas", 
    "contratos", 
    "historico_atividades"
]

def migrate():
    print("--- Starting Hybrid Migration (REST -> PSQL) ---")
    os.environ['PGPASSWORD'] = RECEIVER_PASSWORD
    db_host = f"db.{RECEIVER_REF}.supabase.co"
    
    for table in TABLES:
        print(f"Table {table}: ", end="", flush=True)
        
        # 1. Fetch from donor via REST
        get_url = f"https://{DONOR_REF}.supabase.co/rest/v1/{table}?select=*"
        get_resp = requests.get(
            get_url, 
            headers={
                "Authorization": f"Bearer {DONOR_SERVICE_ROLE}",
                "apikey": DONOR_SERVICE_ROLE
            }
        )
        
        if get_resp.status_code != 200:
            print(f"Error fetching: {get_resp.status_code}")
            continue
            
        data = get_resp.json()
        if not data:
            print("Empty.")
            continue
            
        print(f"Fetched {len(data)} rows. Pushing...", end="", flush=True)

        # 2. Push to receiver via PSQL (COPY is better for bulk)
        # Create a temp CSV-like or JSON file for insertion
        temp_file = f"migration_temp/{table}_data.json"
        with open(temp_file, 'w') as f:
            json.dump(data, f)
            
        # We'll use a python helper to generate INSERT statements to handle column mismatches gracefully
        # or just try to insert the whole JSON if we use a helper function in PG.
        # But for now, let's try direct INSERTs generated in Python.
        
        for row in data:
            columns = ", ".join([f'"{k}"' for k in row.keys()])
            # Format values for SQL. Handle NULLs and strings.
            values = []
            for v in row.values():
                if v is None:
                    values.append("NULL")
                elif isinstance(v, (dict, list)):
                    values.append(f"'{json.dumps(v)}'::jsonb")
                elif isinstance(v, bool):
                     values.append(str(v).upper())
                else:
                    escaped = str(v).replace("'", "''")
                    values.append(f"'{escaped}'")
            
            value_str = ", ".join(values)
            sql = f'INSERT INTO public."{table}" ({columns}) VALUES ({value_str}) ON CONFLICT DO NOTHING;'
             
            # Execute one by one for maximum control over errors
            psql_cmd = f"psql -h {db_host} -U postgres -d postgres -c \"{sql}\""
            subprocess.run(psql_cmd, shell=True, capture_output=True)
            
        print(" Done.")

if __name__ == "__main__":
    migrate()
    print("--- Hybrid Migration Finished ---")
