import requests
import json

BASE_URL = "http://127.0.0.1:8001/api/v1"
TEST_USER = {
    "email": "testuser@example.com",
    "password": "password123"
}

def run_tests():
    """Runs a sequence of tests to validate the API functionality."""
    print("--- Starting API Tests ---")
    
    # 1. Signup
    print("\n Testing Signup...")
    try:
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json=TEST_USER)
        if signup_response.status_code == 400 and "already registered" in signup_response.json().get("detail", ""):
            print("Signup failed (user may already exist), proceeding to login...")
        elif signup_response.status_code != 200:
            raise Exception(f"Signup failed with status {signup_response.status_code}: {signup_response.text}")
        print("Signup successful or user already exists.")
    except Exception as e:
        print(f"ERROR during signup: {e}")
        return

    # 2. Login
    print("\n Testing Login...")
    try:
        login_payload = {'username': TEST_USER['email'], 'password': TEST_USER['password']}
        login_response = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
        if login_response.status_code != 200:
            raise Exception(f"Login failed with status {login_response.status_code}: {login_response.text}")
        
        token = login_response.json().get("access_token")
        if not token:
            raise Exception("Login failed: No access token received.")
        print("Login successful. Token received.")
        headers = {"Authorization": f"Bearer {token}"}
    except Exception as e:
        print(f"ERROR during login: {e}")
        return

    # 3. Get User Profile
    print("\n Testing Get User Profile...")
    try:
        me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if me_response.status_code != 200:
            raise Exception(f"Get User Profile failed with status {me_response.status_code}: {me_response.text}")
        print(f"Get User Profile successful: {me_response.json()}")
    except Exception as e:
        print(f"ERROR during Get User Profile: {e}")
        return

    # 4. Get Settings
    print("\n Testing Get Settings...")
    try:
        settings_response = requests.get(f"{BASE_URL}/users/me/settings", headers=headers)
        if settings_response.status_code != 200:
            raise Exception(f"Get Settings failed with status {settings_response.status_code}: {settings_response.text}")
        print(f"Get Settings successful: {settings_response.json()}")
    except Exception as e:
        print(f"ERROR during Get Settings: {e}")
        return

    # 5. Update Settings
    print("\n Testing Update Settings...")
    try:
        update_payload = {"priorityVirtues": ["resilience", "grit", "empathy"], "customVirtues": ["patience"]}
        update_response = requests.put(f"{BASE_URL}/users/me/settings", headers=headers, json=update_payload)
        if update_response.status_code != 200:
            raise Exception(f"Update Settings failed with status {update_response.status_code}: {update_response.text}")
        print(f"Update Settings successful: {update_response.json()}")
    except Exception as e:
        print(f"ERROR during Update Settings: {e}")
        return

    # 6. Log a Moment
    print("\n Testing Log a Moment...")
    try:
        moment_payload = {"text": "This is a test moment."}
        moment_response = requests.post(f"{BASE_URL}/moments", headers=headers, json=moment_payload)
        if moment_response.status_code != 200:
            raise Exception(f"Log a Moment failed with status {moment_response.status_code}: {moment_response.text}")
        print(f"Log a Moment successful: {moment_response.json()}")
    except Exception as e:
        print(f"ERROR during Log a Moment: {e}")
        return

    # 7. View Dashboard
    print("\n Testing View Dashboard...")
    try:
        dashboard_response = requests.get(f"{BASE_URL}/dashboard", headers=headers)
        if dashboard_response.status_code != 200:
            raise Exception(f"View Dashboard failed with status {dashboard_response.status_code}: {dashboard_response.text}")
        print("View Dashboard successful.")
    except Exception as e:
        print(f"ERROR during View Dashboard: {e}")
        return

    # 8. View Weekly Reflection
    print("\n Testing View Weekly Reflection...")
    try:
        reflection_response = requests.get(f"{BASE_URL}/reflections/weekly", headers=headers)
        if reflection_response.status_code != 200:
            raise Exception(f"View Weekly Reflection failed with status {reflection_response.status_code}: {reflection_response.text}")
        print("View Weekly Reflection successful.")
    except Exception as e:
        print(f"ERROR during View Weekly Reflection: {e}")
        return

    print("\n--- All tests completed ---")

if __name__ == "__main__":
    run_tests()