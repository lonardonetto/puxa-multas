import requests
import json
import os

DONOR_REF = "ujgnfwdeifiqvvvbeyjk"
DONOR_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ25md2RlaWZpcXZ2dmJleWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMjQ5MSwiZXhwIjoyMDgzMzc4NDkxfQ.u6kLfUWRi6InGssn02YviamkPyxQCnxG5w-iMhSh6jc"

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

def sql_escape(val, dtype):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (dict, list)):
        return f"'{json.dumps(val)}'::jsonb"
    # String types
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

def generate_migration_sql():
    print("--- Generating Migration SQL ---")
    
    with open("migration_temp/final_data_migration.sql", "w") as f:
        f.write("-- FINAL DATA MIGRATION\n")
        f.write("SET statement_timeout = 0;\n")
        f.write("SET client_encoding = 'UTF8';\n\n")

        for table in TABLES:
            print(f"Processing {table}...")
            url = f"https://{DONOR_REF}.supabase.co/rest/v1/{table}?select=*"
            resp = requests.get(url, headers={"apikey": DONOR_SERVICE_ROLE, "Authorization": f"Bearer {DONOR_SERVICE_ROLE}"})
            
            if resp.status_code != 200:
                print(f"  Error fetching {table}: {resp.status_code}")
                continue
                
            data = resp.json()
            if not data:
                continue

            f.write(f"-- Data for {table}\n")
            for row in data:
                cols = ", ".join([f'"{k}"' for k in row.keys()])
                vals = [sql_escape(v, None) for v in row.values()]
                f.write(f"INSERT INTO public.\"{table}\" ({cols}) VALUES ({', '.join(vals)}) ON CONFLICT DO NOTHING;\n")
            f.write("\n")

    print("--- SQL Generated: migration_temp/final_data_migration.sql ---")

if __name__ == "__main__":
    generate_migration_sql()
