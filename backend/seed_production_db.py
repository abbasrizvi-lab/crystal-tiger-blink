import os
from pymongo import MongoClient
from dotenv import load_dotenv

def seed_production_database():
    """
    Seeds the production database with essential data if it's missing.
    This script is designed to be run manually and only once.
    It will not delete any existing user data.
    """
    load_dotenv()
    
    # IMPORTANT: Set your PRODUCTION MONGODB_URI in your .env file or environment
    MONGODB_URI = os.getenv("MONGODB_URI")
    if not MONGODB_URI:
        print("ERROR: MONGODB_URI is not set. Please set it in your .env file or environment.")
        return

    client = MongoClient(MONGODB_URI)
    db = client.get_database("innovation_character") # Or your specific DB name
    print("--- Connected to the production database ---")

    # --- Seed Quotes Collection ---
    if db.quotes.count_documents({}) == 0:
        print("Seeding quotes collection...")
        quotes_data = [
            {
                "text": "The only way to do great work is to love what you do.",
                "author": "Steve Jobs",
                "reflectionPrompt": "What work do you love, and how can you do more of it?"
            },
            {
                "text": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                "author": "Winston Churchill",
                "reflectionPrompt": "Reflect on a time you showed courage in the face of failure."
            },
            {
                "text": "Believe you can and you're halfway there.",
                "author": "Theodore Roosevelt",
                "reflectionPrompt": "What is something you believe you can achieve?"
            }
        ]
        db.quotes.insert_many(quotes_data)
        print("--- Quotes collection seeded successfully ---")
    else:
        print("Quotes collection already contains data. Skipping.")

    # --- Seed Articles Collection ---
    if db.articles.count_documents({}) == 0:
        print("Seeding articles collection...")
        articles_data = [
            {
                "title": "The Importance of Mindfulness in the Workplace",
                "summary": "Learn how mindfulness can reduce stress and improve focus.",
                "url": "https://example.com/mindfulness-workplace"
            },
            {
                "title": "10 Tips for Effective Time Management",
                "summary": "Boost your productivity with these time management techniques.",
                "url": "https://example.com/time-management-tips"
            },
            {
                "title": "The Power of Positive Thinking",
                "summary": "Discover how a positive mindset can transform your life.",
                "url": "https://example.com/positive-thinking"
            }
        ]
        db.articles.insert_many(articles_data)
        print("--- Articles collection seeded successfully ---")
    else:
        print("Articles collection already contains data. Skipping.")

    # --- Seed Reflection Suggestions Collection ---
    if db.reflection_suggestions.count_documents({}) == 0:
        print("Seeding reflection_suggestions collection...")
        reflection_suggestions_data = [
            {
                "virtue": "Gratitude",
                "practice": "Write down three things you are grateful for today."
            },
            {
                "virtue": "Curiosity",
                "practice": "Learn something new today, no matter how small."
            },
            {
                "virtue": "Kindness",
                "practice": "Perform a random act of kindness for someone."
            }
        ]
        db.reflection_suggestions.insert_many(reflection_suggestions_data)
        print("--- Reflection suggestions collection seeded successfully ---")
    else:
        print("Reflection suggestions collection already contains data. Skipping.")

    # --- Seed Calendar Insights Collection ---
    if db.calendar_insights.count_documents({}) == 0:
        print("Seeding calendar_insights collection...")
        calendar_insights_data = [
            {
                "insight": "Identified a pattern: You tend to schedule deep work sessions early in the morning."
            },
            {
                "insight": "Opportunity for growth: Mid-afternoon meetings sometimes disrupt your flow."
            },
            {
                "insight": "You have a recurring meeting that could be shortened to improve focus."
            }
        ]
        db.calendar_insights.insert_many(calendar_insights_data)
        print("--- Calendar insights collection seeded successfully ---")
    else:
        print("Calendar insights collection already contains data. Skipping.")

    print("\n--- Production database seeding complete ---")

if __name__ == "__main__":
    seed_production_database()