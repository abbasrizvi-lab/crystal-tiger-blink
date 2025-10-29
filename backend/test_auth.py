import requests
import json
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://127.0.0.1:8001/api/v1"
NEW_USER = {
    "email": "newtestuser@example.com",
    "password": "password123"
}

def clear_test_user():
    """Removes the test user from the database."""
    mongodb_uri = os.getenv("MONGODB_URI")
    client = MongoClient(mongodb_uri)
    db = client.get_database()
    db.users.delete_one({"email": NEW_USER["email"]})
    print(f"Cleared user {NEW_USER['email']} from the database.")

def test_signup():
    """Tests the signup functionality."""
    print("\n--- Testing Signup ---")
    
    # Clear any existing test user to ensure a clean slate
    clear_test_user()

    # 1. Test successful signup
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=NEW_USER)
        response.raise_for_status()
        assert "access_token" in response.json()
        print("Successful signup test passed.")
    except Exception as e:
        print(f"ERROR during successful signup test: {e}")

    # 2. Test signup with an existing user
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=NEW_USER)
        assert response.status_code == 400
        print("Signup with existing user test passed.")
    except Exception as e:
        print(f"ERROR during existing user signup test: {e}")

def test_login():
    """Tests the login functionality."""
    print("\n--- Testing Login ---")
    
    # 1. Test successful login
    try:
        login_payload = {'username': NEW_USER['email'], 'password': NEW_USER['password']}
        response = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
        response.raise_for_status()
        assert "access_token" in response.json()
        print("Successful login test passed.")
    except Exception as e:
        print(f"ERROR during successful login test: {e}")

    # 2. Test login with incorrect password
    try:
        login_payload = {'username': NEW_USER['email'], 'password': 'wrongpassword'}
        response = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
        assert response.status_code == 401
        print("Login with incorrect password test passed.")
    except Exception as e:
        print(f"ERROR during incorrect password login test: {e}")

    # 3. Test login with non-existent user
    try:
        login_payload = {'username': 'nouser@example.com', 'password': 'password123'}
        response = requests.post(f"{BASE_URL}/auth/login", data=login_payload)
        assert response.status_code == 401
        print("Login with non-existent user test passed.")
    except Exception as e:
        print(f"ERROR during non-existent user login test: {e}")

if __name__ == "__main__":
    test_signup()
    test_login()
    # Clean up the user after tests are done
    clear_test_user()