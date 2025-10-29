import os
from pymongo import MongoClient
from dotenv import load_dotenv

def check_database_connection():
    """
    A simple script to diagnose the MongoDB connection.
    It loads the MONGODB_URI from the .env file and attempts to connect.
    """
    load_dotenv()
    
    MONGODB_URI = os.getenv("MONGODB_URI")
    
    if not MONGODB_URI:
        print("\n❌ ERROR: MONGODB_URI is not set in your .env file.")
        print("Please make sure the .env file is in the same directory and contains the MONGODB_URI variable.")
        return

    print(f"\nAttempting to connect to MongoDB with the following URI:")
    # Hide the credentials for security
    safe_uri = 'mongodb+srv://' + MONGODB_URI.split('@').split('//').split(':') + ':****@' + MONGODB_URI.split('@')
    print(safe_uri)

    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        print("\n✅ SUCCESS: MongoDB connection successful!")
        print("The MONGODB_URI is correct. The issue may lie elsewhere (e.g., firewall, IP allowlisting).")

    except Exception as e:
        print("\n❌ FAILURE: Could not connect to MongoDB.")
        print("This is the root cause of your production issues.")
        print("\n--- Error Details ---")
        print(e)
        print("\n--- Troubleshooting Steps ---")
        print("1. Double-check the username and password in your MONGODB_URI.")
        print("2. Ensure the database name is correct.")
        print("3. Check your MongoDB Atlas IP Allowlist to ensure it allows connections from anywhere (0.0.0.0/0) or from your Render service's IP.")
        print("4. Make sure there are no special characters in your password that need to be URL-encoded.")

if __name__ == "__main__":
    check_database_connection()