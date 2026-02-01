import subprocess
import os

DONOR_DB = "postgresql://postgres:LeoN1982PP%40%40@db.ujgnfwdeifiqvvvbeyjk.supabase.co:5432/postgres"
RECEIVER_DB = "postgresql://postgres:LeoN1982PPPP%40%40%40%40@db.acyqrpkdsxddkqfaakty.supabase.co:5432/postgres"

TABLES = [
    "organizations", "users", "user_organizations", "planos", 
    "servicos", "clientes", "veiculos", "multas", 
    "contratos", "historico_atividades"
]

def migrate_data():
    for table in TABLES:
        print(f"Migrating table: {table}")
        # Use pg_dump for safe data extraction and psql for loading
        try:
            # Extract data only (--data-only), including inserts (--inserts) for better compatibility with target schema
            dump_cmd = f"pg_dump --data-only --table=public.{table} --inserts \"{DONOR_DB}\""
            process = subprocess.Popen(dump_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            stdout, stderr = process.communicate()
            
            if process.returncode != 0:
                print(f"  Error dumping {table}: {stderr}")
                continue
                
            if not stdout.strip():
                print(f"  Table {table} is empty.")
                continue

            # Apply to receiver
            # Filter out SET commands that might fail
            filtered_sql = "\n".join([line for line in stdout.splitlines() if not line.startswith("SET ")])
            
            psql_process = subprocess.Popen(f"psql \"{RECEIVER_DB}\"", shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            p_out, p_err = psql_process.communicate(input=filtered_sql)
            
            if psql_process.returncode == 0:
                print(f"  Successfully migrated {table}.")
            else:
                print(f"  Error loading {table}: {p_err}")
                
        except Exception as e:
            print(f"  Failed {table}: {e}")

if __name__ == "__main__":
    migrate_data()
