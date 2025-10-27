import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)

def ping_db():
    try:
        client.admin.command('ping')
        return True
    except Exception as e:
        print(e)
        return False