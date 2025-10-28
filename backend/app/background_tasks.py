from .db import get_db
from datetime import datetime, timedelta
from gtts import gTTS
import os
from collections import Counter
import re
import asyncio
from .ws_manager import connected_clients

# A list of common English stopwords to exclude from theme analysis
STOPWORDS = set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
])

def get_moment_text(moment):
    return moment.get("text", "")

async def broadcast_reflection_update(data):
    for client in connected_clients:
        await client.send_json(data)

def generate_weekly_reflections():
    db = get_db()
    users = db.users.find()
    
    audio_dir = "static/audio"
    if not os.path.exists(audio_dir):
        os.makedirs(audio_dir)

    for user in users:
        seven_days_ago = datetime.now() - timedelta(days=7)
        moments_cursor = db.moments.find({
            "userId": user["_id"],
            "createdAt": {"$gte": seven_days_ago}
        }).sort("createdAt", 1)
        
        moments = list(moments_cursor)
        moments_count = len(moments)
        summary_text = "No moments logged this week. Try to capture a few thoughts next week!"

        if moments_count == 1:
            moment_text = get_moment_text(moments)
            summary_text = f"This week you captured one moment: '{moment_text}'. What will you focus on next?"
        elif moments_count > 1:
            all_text = " ".join([get_moment_text(m) for m in moments])
            words = [word for word in re.findall(r'\b\w+\b', all_text.lower()) if word not in STOPWORDS]
            
            most_common_word_tuple = Counter(words).most_common(1)
            most_common_word = most_common_word_tuple if most_common_word_tuple else "reflection"

            first_moment_text = get_moment_text(moments)
            last_moment_text = get_moment_text(moments[-1])
            
            summary_text = (
                f"This week you logged {moments_count} moments. "
                f"You started by reflecting on '{first_moment_text}' and ended on '{last_moment_text}'. "
                f"A recurring theme in your moments was '{most_common_word}'. Keep reflecting!"
            )

        reflection_data = {
            "userId": user["_id"],
            "reflectionData": summary_text,
            "summaryText": summary_text,
            "generatedAt": datetime.now(),
            "audioUrl": None
        }
        
        result = db.weekly_reflections.insert_one(reflection_data)
        reflection_id = result.inserted_id
        
        try:
            tts = gTTS(text=summary_text, lang='en')
            audio_filename = f"{reflection_id}.mp3"
            audio_path = os.path.join(audio_dir, audio_filename)
            tts.save(audio_path)
            
            audio_url = f"/static/audio/{audio_filename}"
            db.weekly_reflections.update_one(
                {"_id": reflection_id},
                {"$set": {"audioUrl": audio_url}}
            )
        except Exception as e:
            print(f"Error generating TTS for reflection {reflection_id}: {e}")
        
        asyncio.run(broadcast_reflection_update(reflection_data))