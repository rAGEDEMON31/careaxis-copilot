import requests
import uuid
import sys

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    print("--- Starting Phase 1 Auth Integration Test ---")
    
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"
    full_name = "Phase1 Test User"
    organization = "Integration Test Lab"

    # 1. Test Registration
    print(f"\n1. Registering user: {email}...")
    reg_data = {
        "full_name": full_name,
        "email": email,
        "password": password,
        "organization": organization
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    if res.status_code != 200:
        print(f"FAILED: Registration returned {res.status_code}")
        print(res.text)
        sys.exit(1)
    print("SUCCESS: Registered successfully.")

    # 2. Test Login
    print("\n2. Logging in...")
    login_data = {"email": email, "password": password}
    res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if res.status_code != 200:
        print(f"FAILED: Login returned {res.status_code}")
        sys.exit(1)
    
    data = res.json()
    token = data.get("access_token")
    if not token:
        print("FAILED: Token not found in login response")
        sys.exit(1)
    print("SUCCESS: Logged in and received JWT.")

    # 3. Test Protected Route (Unauthenticated)
    print("\n3. Testing protected route (GET /patients) without token...")
    res = requests.get(f"{BASE_URL}/patients")
    if res.status_code == 401:
        print("SUCCESS: Correctly blocked unauthorized access (401).")
    else:
        print(f"FAILED: Protected route returned {res.status_code} instead of 401")
        sys.exit(1)

    # 4. Test Protected Route (Authenticated)
    print("\n4. Testing protected route (GET /patients) WITH token...")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/patients", headers=headers)
    if res.status_code == 200:
        print("SUCCESS: Accessed protected route with JWT.")
        patients = res.json().get("patients", [])
        print(f"Found {len(patients)} patients.")
    else:
        print(f"FAILED: Protected route returned {res.status_code}")
        print(res.text)
        sys.exit(1)

    print("\n--- Phase 1 Auth Integration Test COMPLETED SUCCESSFULLY ---")

if __name__ == "__main__":
    try:
        test_auth_flow()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
