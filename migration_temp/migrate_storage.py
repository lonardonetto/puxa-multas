import requests
import os

DONOR_REF = "ujgnfwdeifiqvvvbeyjk"
RECEIVER_REF = "acyqrpkdsxddkqfaakty"
DONOR_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ25md2RlaWZpcXZ2dmJleWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzgwMjQ5MSwiZXhwIjoyMDgzMzc4NDkxfQ.u6kLfUWRi6InGssn02YviamkPyxQCnxG5w-iMhSh6jc"
RECEIVER_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeXFycGtkc3hkZGtxZmFha3R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMTkyMCwiZXhwIjoyMDg1NDk3OTIwfQ.VwfKAWF1pZMRCDYJJQzPpVNv1RrXBrfJJbpNn1rCYXI"

BUCKETS = ["documentos", "avatars", "editais"]

def migrate_storage():
    for bucket in BUCKETS:
        print(f"--- Migrating Bucket: {bucket} ---")
        
        # 1. List objects in donor
        list_resp = requests.post(
            f"https://{DONOR_REF}.supabase.co/storage/v1/object/list/{bucket}",
            headers={
                "Authorization": f"Bearer {DONOR_SERVICE_ROLE}"
            },
            json={"limit": 100, "offset": 0, "sortBy": {"column": "name", "order": "asc"}}
        )
        
        if list_resp.status_code != 200:
            print(f"Error listing objects in {bucket}: {list_resp.status_code} - {list_resp.text}")
            continue
            
        objects = list_resp.json()
        print(f"Found {len(objects)} objects.")
        
        for obj in objects:
            file_name = obj['name']
            if obj.get('id') is None and 'metadata' not in obj: # It's a folder-like entry in some versions
                continue
                
            print(f"  Transferring: {file_name}...", end="", flush=True)
            
            # 2. Download from donor
            down_resp = requests.get(
                f"https://{DONOR_REF}.supabase.co/storage/v1/object/authenticated/{bucket}/{file_name}",
                headers={"Authorization": f"Bearer {DONOR_SERVICE_ROLE}"}
            )
            
            if down_resp.status_code != 200:
                print(f" Error downloading: {down_resp.status_code}")
                continue
                
            # 3. Upload to receiver
            up_resp = requests.post(
                f"https://{RECEIVER_REF}.supabase.co/storage/v1/object/{bucket}/{file_name}",
                headers={
                    "Authorization": f"Bearer {RECEIVER_SERVICE_ROLE}",
                    "Content-Type": down_resp.headers.get("Content-Type", "application/octet-stream")
                },
                data=down_resp.content
            )
            
            if up_resp.status_code == 200:
                print(" Done.")
            elif up_resp.status_code == 409:
                print(" Already exists.")
            else:
                print(f" Error uploading: {up_resp.status_code} - {up_resp.text}")

if __name__ == "__main__":
    migrate_storage()
    print("\nStorage Migration Finished.")
