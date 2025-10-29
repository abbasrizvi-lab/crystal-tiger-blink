import requests
import json

BASE_URL = "http://127.0.0.1:8001/api/v1"
USER_1 = {
    "email": "testuser1@example.com",
    "password": "password123"
}
USER_2 = {
    "email": "testuser2@example.com",
    "password": "password123"
}

def get_auth_token(user):
    """Helper function to get auth token for a specific user."""
    try:
        requests.post(f"{BASE_URL}/auth/signup", json=user)
    except Exception:
        pass

    login_payload = {'username': user['email'], 'password': user['password']}
    login_response = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
    login_response.raise_for_status()
    token = login_response.json().get("access_token")
    if not token:
        raise Exception(f"Login failed for user {user['email']}: No access token received.")
    return token

def test_data_isolation():
    """Tests that data is isolated between users."""
    print("\n--- Testing Data Isolation ---")
    try:
        # Get tokens for both users
        token1 = get_auth_token(USER_1)
        headers1 = {"Authorization": f"Bearer {token1}"}
        token2 = get_auth_token(USER_2)
        headers2 = {"Authorization": f"Bearer {token2}"}

        # User 1 creates a reflection
        reflection_payload = {
            "text": "This is user 1's reflection.",
            "type": "reflection"
        }
        response = requests.post(f"{BASE_URL}/reflections", headers=headers1, json=reflection_payload)
        response.raise_for_status()
        reflection_id = response.json()["id"]
        print("User 1 created a reflection.")

        # User 2 should not see User 1's reflection
        response = requests.get(f"{BASE_URL}/reflections", headers=headers2)
        response.raise_for_status()
        reflections = response.json()
        for reflection in reflections:
            if reflection["id"] == reflection_id:
                raise Exception("Data isolation test failed: User 2 can see User 1's reflection.")
        print("User 2 cannot see User 1's reflection.")

        # User 2 creates a reflection
        reflection_payload_2 = {
            "text": "This is user 2's reflection.",
            "type": "reflection"
        }
        response = requests.post(f"{BASE_URL}/reflections", headers=headers2, json=reflection_payload_2)
        response.raise_for_status()
        reflection_id_2 = response.json()["id"]
        print("User 2 created a reflection.")

        # User 1 should not see User 2's reflection
        response = requests.get(f"{BASE_URL}/reflections", headers=headers1)
        response.raise_for_status()
        reflections = response.json()
        for reflection in reflections:
            if reflection["id"] == reflection_id_2:
                raise Exception("Data isolation test failed: User 1 can see User 2's reflection.")
        print("User 1 cannot see User 2's reflection.")

        print("Data isolation test successful.")

    except Exception as e:
        print(f"ERROR during data isolation test: {e}")

if __name__ == "__main__":
    test_data_isolation()