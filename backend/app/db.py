from pymongo import MongoClient
from .config import settings

client = MongoClient(settings.MONGODB_URI)
db = client.get_database("innovation_character")

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