import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    print("FATAL ERROR: MONGODB_URI is not set. Application cannot start.")
    # In a real application, you might raise an exception or exit
    client = None
    db = None
else:
    try:
        client = MongoClient(MONGODB_URI)
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        print("--- Database connection successful ---")
        db = client.get_database("innovation_character")
    except Exception as e:
        print(f"FATAL ERROR: Could not connect to MongoDB: {e}")
        client = None
        db = None

def ping_db():
    try:
        client.admin.command('ping')
        return True
    except Exception as e:
        print(e)
        return False

def get_db():
    if ping_db():
        print("--- Database connection successful ---")
        return db
    else:
        print("--- Database connection failed ---")
        return None