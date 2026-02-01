import requests
import json

DONOR_REF = "ujgnfwdeifiqvvvbeyjk"
RECEIVER_REF = "acyqrpkdsxddkqfaakty"
DONOR_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ25md2RlaWZpcXZ2dmJleWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMjQ5MSwiZXhwIjoyMDgzMzc4NDkxfQ.u6kLfUWRi6InGssn02YviamkPyxQCnxG5w-iMhSh6jc"
RECEIVER_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeXFycGtkc3hkZGtxZmFha3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMTkyMCwiZXhwIjoyMDg1NDk3OTIwfQ.VwfKAWF1pZMRCDYJJQzPpVNv1RrXBrfJJbpNn1rCYXI"

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
    print("--- Starting Data Migration via REST API ---")
    
    for table in TABLES:
        print(f"Table {table}: ", end="", flush=True)
        
        # 1. Fetch from donor
        get_url = f"https://{DONOR_REF}.supabase.co/rest/v1/{table}?select=*"
        get_resp = requests.get(
            get_url, 
            headers={
                "Authorization": f"Bearer {DONOR_SERVICE_ROLE}",
                "apikey": DONOR_SERVICE_ROLE
            }
        )
        
        if get_resp.status_code != 200:
            print(f"Error fetching: {get_resp.status_code} - {get_resp.text}")
            continue
            
        data = get_resp.json()
        if not data:
            print("Empty.")
            continue
            
        # 2. Push to receiver
        post_url = f"https://{RECEIVER_REF}.supabase.co/rest/v1/{table}"
        post_resp = requests.post(
            post_url,
            headers={
                "Authorization": f"Bearer {RECEIVER_SERVICE_ROLE}",
                "apikey": RECEIVER_SERVICE_ROLE,
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
            },
            json=data
        )
        
        if post_resp.status_code in [200, 201, 204]:
            print(f"Migrated {len(data)} rows.")
        else:
            print(f"Error pushing: {post_resp.status_code} - {post_resp.text}")

if __name__ == "__main__":
    migrate()
    print("--- Migration Finished ---")
