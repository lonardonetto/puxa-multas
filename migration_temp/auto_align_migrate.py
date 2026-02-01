import requests
import json
import subprocess
import os

DONOR_REF = "ujgnfwdeifiqvvvbeyjk"
RECEIVER_REF = "acyqrpkdsxddkqfaakty"
DONOR_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ25md2RlaWZpcXZ2dmJleWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMjQ5MSwiZXhwIjoyMDgzMzc4NDkxfQ.u6kLfUWRi6InGssn02YviamkPyxQCnxG5w-iMhSh6jc"
RECEIVER_PASSWORD = "LeoN1982PPPP@@@@"

def get_donor_columns():
    url = f"https://{DONOR_REF}.supabase.co/rest/v1/rpc/execute_sql"
    # Wait, donor might not have execute_sql RPC. Using information_schema via standard select.
    # Actually, I have the execution tool for donor.
    return [] # Placeholder

def run_alignment_and_migrate():
    os.environ['PGPASSWORD'] = RECEIVER_PASSWORD
    db_host = f"db.{RECEIVER_REF}.supabase.co"
    
    # Tables to migrate
    TABLES = ["organizations", "users", "user_organizations", "planos", "servicos", "clientes", "veiculos", "multas", "contratos", "historico_atividades"]
    
    for table in TABLES:
        print(f"\n--- Processing {table} ---")
        
        # 1. Fetch data from donor
        resp = requests.get(f"https://{DONOR_REF}.supabase.co/rest/v1/{table}?select=*", headers={"apikey": DONOR_SERVICE_ROLE, "Authorization": f"Bearer {DONOR_SERVICE_ROLE}"})
        if resp.status_code != 200:
            print(f"  Error fetching {table}: {resp.status_code}")
            continue
        data = resp.json()
        if not data:
            print("  Table empty.")
            continue
            
        # 2. Extract column names from data
        donor_columns = set(data[0].keys())
        
        # 3. Check receiver columns
        res = subprocess.run(f"psql -h {db_host} -U postgres -d postgres -t -c \"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}';\"", shell=True, capture_output=True, text=True)
        receiver_columns = set([line.strip() for line in res.stdout.splitlines() if line.strip()])
        
        # 4. Fix missing columns in receiver
        missing = donor_columns - receiver_columns
        if missing:
            print(f"  Missing columns in receiver for {table}: {missing}")
            for col in missing:
                # Infer type from data
                val = data[0][col]
                ptype = "TEXT"
                if isinstance(val, bool): ptype = "BOOLEAN"
                elif isinstance(val, (int, float)): ptype = "NUMERIC"
                elif isinstance(val, (dict, list)): ptype = "JSONB"
                
                print(f"  Adding column {col} ({ptype})...")
                subprocess.run(f"psql -h {db_host} -U postgres -d postgres -c \"ALTER TABLE public.{table} ADD COLUMN IF NOT EXISTS \\\"{col}\\\" {ptype};\"", shell=True)
        
        # 5. Migrate Data
        for row in data:
            cols = ", ".join([f'"{k}"' for k in row.keys()])
            vals = []
            for v in row.values():
                if v is None: vals.append("NULL")
                elif isinstance(v, (dict, list)): vals.append(f"'{json.dumps(v)}'::jsonb")
                elif isinstance(v, bool): vals.append(str(v).upper())
                else: 
                    escaped = str(v).replace("'", "''")
                    vals.append(f"'{escaped}'")
            
            sql = f"INSERT INTO public.{table} ({cols}) VALUES ({', '.join(vals)}) ON CONFLICT DO NOTHING;"
            res = subprocess.run(f"psql -h {db_host} -U postgres -d postgres -c \"{sql}\"", shell=True, capture_output=True, text=True)
            if res.returncode != 0:
                print(f"  Error inserting row: {res.stderr}")

        print(f"  Finished {table}.")

if __name__ == "__main__":
    run_alignment_and_migrate()
