import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client.get_database("innovation_character") # Or your specific DB name

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