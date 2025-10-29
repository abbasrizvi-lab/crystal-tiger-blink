import requests
import json

BASE_URL = "http://127.0.0.1:8001/api/v1"
TEST_USER = {
    "email": "testuser@example.com",
    "password": "password123"
}

def get_auth_token():
    """Helper function to get auth token."""
    try:
        requests.post(f"{BASE_URL}/auth/signup", json=TEST_USER)
    except Exception:
        pass

    login_payload = {'username': TEST_USER['email'], 'password': TEST_USER['password']}
    login_response = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
    login_response.raise_for_status()
    token = login_response.json().get("access_token")
    if not token:
        raise Exception("Login failed: No access token received.")
    return token

def test_get_articles(headers):
    """Tests fetching articles."""
    print("\n--- Testing Get Articles ---")
    try:
        response = requests.get(f"{BASE_URL}/articles", headers=headers)
        response.raise_for_status()
        print(f"Get Articles successful: {response.json()}")
    except Exception as e:
        print(f"ERROR during Get Articles: {e}")

def test_get_reflections(headers):
    """Tests fetching all reflections."""
    print("\n--- Testing Get Reflections ---")
    try:
        response = requests.get(f"{BASE_URL}/reflections", headers=headers)
        response.raise_for_status()
        print(f"Get Reflections successful: {response.json()}")
    except Exception as e:
        print(f"ERROR during Get Reflections: {e}")

def test_submit_reflection(headers):
    """Tests submitting a new reflection."""
    print("\n--- Testing Submit Reflection ---")
    try:
        reflection_payload = {
            "text": "This is the content of the test reflection.",
            "type": "reflection"
        }
        response = requests.post(f"{BASE_URL}/reflections", headers=headers, json=reflection_payload)
        response.raise_for_status()
        print(f"Submit Reflection successful: {response.json()}")
    except Exception as e:
        print(f"ERROR during Submit Reflection: {e}")

def test_peer_feedback(headers):
    """Tests peer feedback endpoints."""
    print("\n--- Testing Peer Feedback ---")
    try:
        response = requests.get(f"{BASE_URL}/peer-feedback", headers=headers)
        response.raise_for_status()
        print(f"Get Peer Feedback successful: {response.json()}")

        try:
            requests.post(f"{BASE_URL}/auth/signup", json={"email": "anotheruser@example.com", "password": "password123"})
        except Exception:
            pass

        feedback_payload = {
            "recipient_email": "anotheruser@example.com",
            "text": "This is some test feedback."
        }
        response = requests.post(f"{BASE_URL}/peer-feedback", headers=headers, json=feedback_payload)
        response.raise_for_status()
        print(f"Submit Peer Feedback successful: {response.json()}")
    except Exception as e:
        print(f"ERROR during Peer Feedback tests: {e}")


def run_all_tests():
    """Runs all tests."""
    print("--- Starting All Endpoint Tests ---")
    try:
        token = get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        test_get_articles(headers)
        test_get_reflections(headers)
        test_submit_reflection(headers)
        test_peer_feedback(headers)
    except Exception as e:
        print(f"An error occurred during test execution: {e}")
    print("\n--- All endpoint tests completed ---")

if __name__ == "__main__":
    run_all_tests()
