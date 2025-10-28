import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client.get_database("innovation_character")

def clear_collections():
    """Clears the users and moments collections."""
    print("--- Clearing Database Collections ---")
    try:
        user_result = db.users.delete_many({})
        moment_result = db.moments.delete_many({})
        print(f"Deleted {user_result.deleted_count} users.")
        print(f"Deleted {moment_result.deleted_count} moments.")
        print("--- Collections Cleared ---")
    except Exception as e:
        print(f"ERROR during database clearing: {e}")

if __name__ == "__main__":
    clear_collections()