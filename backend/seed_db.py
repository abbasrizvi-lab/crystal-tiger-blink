from app.db import db

def seed_database():
    # Clear existing data
    db.quotes.delete_many({})
    db.articles.delete_many({})
    db.reflection_suggestions.delete_many({})
    db.calendar_insights.delete_many({})
    db.integrations.delete_many({})
    print("Cleared existing data.")

    # Sample data for quotes
    quotes_data = [
        {
            "quote": "The only way to do great work is to love what you do.",
            "author": "Steve Jobs",
            "reflectionPrompt": "What work do you love, and how can you do more of it?"
        },
        {
            "quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "author": "Winston Churchill",
            "reflectionPrompt": "Reflect on a time you showed courage in the face of failure."
        },
        {
            "quote": "Believe you can and you're halfway there.",
            "author": "Theodore Roosevelt",
            "reflectionPrompt": "What is something you believe you can achieve?"
        }
    ]

    # Sample data for articles
    articles_data = [
        {
            "id": "1",
            "title": "The Importance of Mindfulness in the Workplace",
            "summary": "Learn how mindfulness can reduce stress and improve focus.",
            "link": "https://example.com/mindfulness-workplace"
        },
        {
            "id": "2",
            "title": "10 Tips for Effective Time Management",
            "summary": "Boost your productivity with these time management techniques.",
            "link": "https://example.com/time-management-tips"
        },
        {
            "id": "3",
            "title": "The Power of Positive Thinking",
            "summary": "Discover how a positive mindset can transform your life.",
            "link": "https://example.com/positive-thinking"
        },
        {
            "id": "4",
            "title": "How to Build Stronger Professional Relationships",
            "summary": "Tips for networking and building lasting connections.",
            "link": "https://example.com/professional-relationships"
        },
        {
            "id": "5",
            "title": "The Benefits of a Growth Mindset",
            "summary": "Embrace challenges and grow with a growth mindset.",
            "link": "https://example.com/growth-mindset"
        }
    ]

    # Sample data for reflection suggestions
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

    # Sample data for calendar insights
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

    # Sample data for integrations
    integrations_data = [
        {
            "userId": "user_id_placeholder",
            "email": {"connected": False, "settings": {}},
            "slack": {"connected": False, "settings": {}},
            "jira": {"connected": False, "settings": {}}
        }
    ]

    # Insert new data
    db.quotes.insert_many(quotes_data)
    print("Seeded quotes collection.")
    db.articles.insert_many(articles_data)
    print("Seeded articles collection.")
    db.reflection_suggestions.insert_many(reflection_suggestions_data)
    print("Seeded reflection_suggestions collection.")
    db.calendar_insights.insert_many(calendar_insights_data)
    print("Seeded calendar_insights collection.")
    db.integrations.insert_many(integrations_data)
    print("Seeded integrations collection.")

if __name__ == "__main__":
    seed_database()