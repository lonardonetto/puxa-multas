import requests
import json
import time

DONOR_REF = "ujgnfwdeifiqvvvbeyjk"
RECEIVER_REF = "acyqrpkdsxddkqfaakty"
DONOR_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ25md2RlaWZpcXZ2dmJleWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMjQ5MSwiZXhwIjoyMDgzMzc4NDkxfQ.u6kLfUWRi6InGssn02YviamkPyxQCnxG5w-iMhSh6jc"
RECEIVER_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeXFycGtkc3hkZGtxZmFha3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMTkyMCwiZXhwIjoyMDg1NDk3OTIwfQ.VwfKAWF1pZMRCDYJJQzPpVNv1RrXBrfJJbpNn1rCYXI"
RECEIVER_TOKEN = "sbp_bda3bb3f39e41f0a5d0a29ee2474bfccb00c5c11"

def run_migration():
    # 1. APPLY SCHEMA
    print(f"--- 1. Applying Schema to {RECEIVER_REF} ---")
    try:
        with open('migration_temp/donor_schema.sql', 'r') as f:
            schema_sql = f.read()
    except Exception as e:
        print(f"Error reading schema file: {e}")
        return

    # Try both endpoints just in case
    endpoints = [
        f"https://api.supabase.com/v1/projects/{RECEIVER_REF}/db/query",
        f"https://api.supabase.com/v1/projects/{RECEIVER_REF}/query"
    ]
    
    schema_applied = False
    for url in endpoints:
        print(f"Trying endpoint: {url}")
        resp = requests.post(
            url,
            headers={"Authorization": f"Bearer {RECEIVER_TOKEN}", "Content-Type": "application/json"},
            json={"query": schema_sql}
        )
        if resp.status_code in [200, 201]:
            print("Successfully applied schema.")
            schema_applied = True
            break
        else:
            print(f"Failed with {resp.status_code}: {resp.text}")

    if not schema_applied:
        print("CRITICAL: Schema could not be applied. Data migration might fail if tables are missing.")

    # 2. MIGRATE DATA
    tables = [
        "organizations", "users", "user_organizations", "planos", 
        "servicos", "clientes", "veiculos", "multas", 
        "contratos", "historico_atividades", "documentos"
    ]
    
    print("\n--- 2. Migrating Database Data ---")
    for table in tables:
        print(f"Table {table}: ", end="", flush=True)
        get_url = f"https://{DONOR_REF}.supabase.co/rest/v1/{table}?select=*"
        get_resp = requests.get(get_url, headers={"Authorization": f"Bearer {DONOR_SERVICE_ROLE}", "apikey": DONOR_SERVICE_ROLE})
        
        if get_resp.status_code != 200:
            print(f"Error fetching: {get_resp.status_code}")
            continue
            
        data = get_resp.json()
        if not data:
            print("Empty.")
            continue
            
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

    # 3. MIGRATE STORAGE
    buckets = ["documentos", "avatars", "editais"]
    print("\n--- 3. Migrating Storage ---")
    for bucket in buckets:
        print(f"Bucket {bucket}: ", end="", flush=True)
        list_url = f"https://{DONOR_REF}.supabase.co/storage/v1/object/list/{bucket}"
        list_resp = requests.post(
            list_url,
            headers={"Authorization": f"Bearer {DONOR_SERVICE_ROLE}"},
            json={"prefix": "", "limit": 100, "offset": 0}
        )
        
        if list_resp.status_code != 200:
            print(f"Error listing: {list_resp.status_code} - {list_resp.text}")
            continue
            
        objects = list_resp.json()
        print(f"Found {len(objects)} files. Transferring: ", end="")
        
        for obj in objects:
            name = obj['name']
            if obj.get('id') is None: continue # Skip folder placeholders
            print(".", end="", flush=True)
            
            # Download
            down_url = f"https://{DONOR_REF}.supabase.co/storage/v1/object/authenticated/{bucket}/{name}"
            down_resp = requests.get(down_url, headers={"Authorization": f"Bearer {DONOR_SERVICE_ROLE}"})
            
            # Upload
            up_url = f"https://{RECEIVER_REF}.supabase.co/storage/v1/object/{bucket}/{name}"
            up_resp = requests.post(
                up_url,
                headers={
                    "Authorization": f"Bearer {RECEIVER_SERVICE_ROLE}",
                    "Content-Type": down_resp.headers.get("Content-Type", "application/octet-stream")
                },
                data=down_resp.content
            )
        print(" Done.")

if __name__ == "__main__":
    run_migration()
    print("\nMaster Migration Finished.")
