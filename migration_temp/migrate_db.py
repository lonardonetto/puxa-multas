import requests
import json

DONOR_REF = "ujgnfwdeifiqvvvbeyjk"
RECEIVER_REF = "acyqrpkdsxddkqfaakty"
DONOR_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ25md2RlaWZpcXZ2dmJleWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMjQ5MSwiZXhwIjoyMDgzMzc4NDkxfQ.u6kLfUWRi6InGssn02YviamkPyxQCnxG5w-iMhSh6jc"
RECEIVER_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeXFycGtkc3hkZGtxZmFha3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMTkyMCwiZXhwIjoyMDg1NDk3OTIwfQ.VwfKAWF1pZMRCDYJJQzPpVNv1RrXBrfJJbpNn1rCYXI"
RECEIVER_TOKEN = "sbp_bda3bb3f39e41f0a5d0a29ee2474bfccb00c5c11"

# 1. Apply Schema to Receiver
print(f"--- Applying Schema to {RECEIVER_REF} ---")
with open('migration_temp/donor_schema.sql', 'r') as f:
    schema_sql = f.read()

resp = requests.post(
    f"https://api.supabase.com/v1/projects/{RECEIVER_REF}/query",
    headers={
        "Authorization": f"Bearer {RECEIVER_TOKEN}",
        "Content-Type": "application/json"
    },
    json={"query": schema_sql}
)

if resp.status_code == 201 or resp.status_code == 200:
    print("Schema applied successfully.")
else:
    print(f"Error applying schema: {resp.status_code} - {resp.text}")

# 2. Migrate Core Data (Table by Table)
tables = [
    "organizations", "users", "user_organizations", "planos", 
    "servicos", "clientes", "veiculos", "multas", 
    "contratos", "historico_atividades"
]

print("\n--- Migrating Data ---")
for table in tables:
    print(f"Migrating table: {table}...", end="", flush=True)
    # Fetch from donor
    get_resp = requests.get(
        f"https://{DONOR_REF}.supabase.co/rest/v1/{table}?select=*",
        headers={
            "Authorization": f"Bearer {DONOR_SERVICE_ROLE}",
            "apikey": DONOR_SERVICE_ROLE
        }
    )
    
    if get_resp.status_code != 200:
        print(f" Error fetching data: {get_resp.status_code}")
        continue
    
    data = get_resp.json()
    if not data:
        print(" Empty.")
        continue
        
    # Push to receiver
    post_resp = requests.post(
        f"https://{RECEIVER_REF}.supabase.co/rest/v1/{table}",
        headers={
            "Authorization": f"Bearer {RECEIVER_SERVICE_ROLE}",
            "apikey": RECEIVER_SERVICE_ROLE,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        },
        json=data
    )
    
    if post_resp.status_code in [201, 200, 204]:
        print(f" Done ({len(data)} rows).")
    else:
        print(f" Error pushing data: {post_resp.status_code} - {post_resp.text}")

print("\nMigration Script Finished.")
