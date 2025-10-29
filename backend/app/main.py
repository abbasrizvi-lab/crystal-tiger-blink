from fastapi import FastAPI, Depends, HTTPException, status, Request, File, UploadFile, Form, WebSocket
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from .db import ping_db, get_db
from . import models, auth
from .background_tasks import generate_weekly_reflections
from pymongo.mongo_client import MongoClient
from typing import List
from .ws_manager import connected_clients
from bson import ObjectId
from datetime import datetime, timedelta
import random
import os

from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Serve frontend static files
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
# Correctly determine the frontend directory relative to the backend's app directory
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str, request: Request):
    file_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"message": "Frontend not found"})

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:5137",
    "https://crystal-tiger-blink.onrender.com",
    "https://crystal-tiger-blink-backend-a1b2c3d4.snapdev.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1")
def read_root():
    return {"message": "Welcome to the Innovation Character API"}

@app.get("/healthz")
def health_check():
    if ping_db():
        return {"status": "ok", "database": "connected"}
    return {"status": "error", "database": "disconnected"}

@app.get("/api/v1/diag")
def run_diagnostics():
    """
    A diagnostic endpoint to test the production database connection from within the environment.
    """
    from pymongo import MongoClient
    import os

    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        return JSONResponse(status_code=500, content={"status": "error", "detail": "MONGODB_URI is not set in the environment."})

    try:
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ismaster')
        return {"status": "success", "detail": "Successfully connected to MongoDB."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})

@app.post("/api/v1/auth/signup")
def signup(user: models.UserCreate, db: MongoClient = Depends(get_db)):
    print(f"--- SIGNUP: Received request for email: {user.email} ---")
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    db_user = db.users.find_one({"email": user.email})
    if db_user:
        print(f"--- SIGNUP: User with email {user.email} already exists ---")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = auth.get_password_hash(user.password)
    user_data = user.model_dump()
    user_data["hashed_password"] = hashed_password
    del user_data["password"]
    user_data["settings"] = {"priorityVirtues": [], "customVirtues": []}
    
    print(f"--- SIGNUP: Inserting new user: {user_data} ---")
    new_user = db.users.insert_one(user_data)
    print(f"--- SIGNUP: New user inserted with ID: {new_user.inserted_id} ---")
    
    access_token = auth.create_access_token(
        data={"sub": user.email}
    )
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return response

@app.post("/api/v1/auth/login", response_model=models.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: MongoClient = Depends(get_db)):
    print(f"--- LOGIN: Attempting to log in user: {form_data.username} ---")
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    user = db.users.find_one({"email": form_data.username})
    if not user:
        print(f"--- LOGIN: User not found: {form_data.username} ---")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"--- LOGIN: User found: {user} ---")
    if not auth.verify_password(form_data.password, user["hashed_password"]):
        print(f"--- LOGIN: Password verification failed for user: {form_data.username} ---")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    print(f"--- LOGIN: Password verification successful for user: {form_data.username} ---")
    access_token = auth.create_access_token(
        data={"sub": user["email"]}
    )
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return response

@app.get("/api/v1/auth/me", response_model=models.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.post("/api/v1/auth/logout")
def logout():
    response = JSONResponse(content={"message": "Successfully logged out"})
    response.delete_cookie(key="access_token")
    return response

@app.get("/api/v1/users/me/settings", response_model=models.UserSettings)
def get_user_settings(current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    user = db.users.find_one({"email": current_user.email})
    if user and "settings" in user:
        return user["settings"]
    return {"priorityVirtues": [], "customVirtues": []}

@app.put("/api/v1/users/me/settings", response_model=models.UserSettings)
def update_user_settings(settings: models.UserSettings, current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    db.users.update_one(
        {"email": current_user.email},
        {"$set": {"settings": settings.model_dump()}}
    )
    return settings

@app.post("/api/v1/moments", response_model=models.Moment)
def create_moment(text: str = Form(...), type: str = Form(...), file: UploadFile = File(None), current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    print(f"--- CREATE_MOMENT: User '{current_user.email}' creating moment of type '{type}' with text: '{text}' ---")
    audio_url = None
    if file:
        print(f"--- CREATE_MOMENT: Audio file received: {file.filename} ---")
        audio_dir = "static/audio/moments"
        if not os.path.exists(audio_dir):
            os.makedirs(audio_dir)
        
        file_path = os.path.join(audio_dir, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        audio_url = f"/static/audio/moments/{file.filename}"
        print(f"--- CREATE_MOMENT: Audio file saved at '{audio_url}' ---")

    new_moment = {
        "userId": ObjectId(current_user.id),
        "text": text,
        "type": type,
        "createdAt": datetime.utcnow(),
        "audioUrl": audio_url
    }
    print(f"--- CREATE_MOMENT: Inserting into DB: {new_moment} ---")
    result = db.moments.insert_one(new_moment)
    print(f"--- CREATE_MOMENT: DB insertion result: {result.inserted_id} ---")
    created_moment = db.moments.find_one({"_id": result.inserted_id})
    print(f"--- CREATE_MOMENT: Fetched created moment from DB: {created_moment} ---")
    
    response_moment = models.Moment(
        id=str(created_moment["_id"]),
        userId=str(created_moment["userId"]),
        text=created_moment["text"],
        type=created_moment["type"],
        createdAt=created_moment["createdAt"],
        audioUrl=created_moment.get("audioUrl")
    )
    print(f"--- CREATE_MOMENT: Returning response: {response_moment.model_dump_json()} ---")
    return response_moment

@app.get("/api/v1/moments", response_model=List[models.Moment])
def get_moments(current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    print(f"--- GET_MOMENTS: Fetching moments for user '{current_user.email}' ---")
    moments_cursor = db.moments.find({"userId": ObjectId(current_user.id), "type": "moment"}).sort("createdAt", -1)
    moments = []
    for moment in moments_cursor:
        print(f"--- GET_MOMENTS: Processing moment from DB: {moment} ---")
        moments.append(models.Moment(
            id=str(moment["_id"]),
            userId=str(moment["userId"]),
            text=moment["text"],
            createdAt=moment["createdAt"],
            type="moment",
            audioUrl=moment.get("audioUrl")
        ))
    print(f"--- GET_MOMENTS: Found {len(moments)} moments. Returning response. ---")
    return moments

@app.get("/api/v1/reflections", response_model=List[models.Moment])
def get_reflections(current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    print(f"--- GET_REFLECTIONS: Fetching reflections for user '{current_user.email}' ---")
    reflections_cursor = db.moments.find({"userId": ObjectId(current_user.id), "type": "reflection"}).sort("createdAt", -1)
    reflections = []
    for reflection in reflections_cursor:
        print(f"--- GET_REFLECTIONS: Processing reflection from DB: {reflection} ---")
        reflections.append(models.Moment(
            id=str(reflection["_id"]),
            userId=str(reflection["userId"]),
            text=reflection["text"],
            createdAt=reflection["createdAt"],
            type="reflection",
            audioUrl=reflection.get("audioUrl")
        ))
    print(f"--- GET_REFLECTIONS: Found {len(reflections)} reflections. Returning response. ---")
    return reflections

@app.post("/api/v1/reflections", response_model=models.Moment)
def create_reflection(moment: models.MomentCreate, current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    print(f"--- CREATE_REFLECTION: User '{current_user.email}' creating reflection with text: '{moment.text}' ---")
    new_moment = {
        "userId": ObjectId(current_user.id),
        "text": moment.text,
        "type": "reflection",
        "createdAt": datetime.utcnow()
    }
    print(f"--- CREATE_REFLECTION: Inserting into DB: {new_moment} ---")
    result = db.moments.insert_one(new_moment)
    print(f"--- CREATE_REFLECTION: DB insertion result: {result.inserted_id} ---")
    created_moment = db.moments.find_one({"_id": result.inserted_id})
    print(f"--- CREATE_REFLECTION: Fetched created reflection from DB: {created_moment} ---")
    
    response_moment = models.Moment(
        id=str(created_moment["_id"]),
        userId=str(created_moment["userId"]),
        text=created_moment["text"],
        type=created_moment["type"],
        createdAt=created_moment["createdAt"]
    )
    print(f"--- CREATE_REFLECTION: Returning response: {response_moment.model_dump_json()} ---")
    return response_moment

@app.get("/api/v1/peer-feedback", response_model=List[models.PeerFeedback])
def get_peer_feedback(current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    feedback_cursor = db.peer_feedback.find({"recipientId": ObjectId(current_user.id)})
    feedback_list = []
    for feedback in feedback_cursor:
        feedback_list.append(models.PeerFeedback(
            id=str(feedback["_id"]),
            recipientId=str(feedback["recipientId"]),
            giverId=str(feedback["giverId"]),
            text=feedback["text"],
            createdAt=feedback["createdAt"]
        ))
    return feedback_list

@app.post("/api/v1/peer-feedback", response_model=models.PeerFeedback)
def create_peer_feedback(feedback: models.PeerFeedbackCreate, current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    recipient = db.users.find_one({"email": feedback.recipient_email})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    new_feedback = {
        "recipientId": recipient["_id"],
        "giverId": ObjectId(current_user.id),
        "text": feedback.text,
        "createdAt": datetime.utcnow()
    }
    result = db.peer_feedback.insert_one(new_feedback)
    created_feedback = db.peer_feedback.find_one({"_id": result.inserted_id})

    return models.PeerFeedback(
        id=str(created_feedback["_id"]),
        recipientId=str(created_feedback["recipientId"]),
        giverId=str(created_feedback["giverId"]),
        text=created_feedback["text"],
        createdAt=created_feedback["createdAt"],
        recipient_email=feedback.recipient_email
    )

from fastapi.responses import JSONResponse

@app.get("/api/v1/dashboard", response_model=models.DashboardData)
def get_dashboard_data(current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    print(f"--- DASHBOARD: Endpoint called for user '{current_user.email}' ---")
    # --- Growth Trends Calculation ---
    now = datetime.utcnow()
    start_of_this_week = now - timedelta(days=now.weekday())
    start_of_last_week = start_of_this_week - timedelta(days=7)

    moments_this_week = db.moments.count_documents({
        "userId": ObjectId(current_user.id),
        "createdAt": {"$gte": start_of_this_week}
    })

    moments_last_week = db.moments.count_documents({
        "userId": ObjectId(current_user.id),
        "createdAt": {"$gte": start_of_last_week, "$lt": start_of_this_week}
    })

    if moments_this_week > moments_last_week:
        week_summary = f"Great job! You've logged {moments_this_week} moments this week, which is more than last week."
    else:
        week_summary = f"You've logged {moments_this_week} moments this week. Keep reflecting to build momentum."

    growth_trends = {
        "weekSummary": week_summary,
        "nextGoal": "Try to reflect on one of your priority virtues tomorrow.",
    }
    # --- End Growth Trends Calculation ---

    # Fetch a random quote using an aggregation pipeline
    pipeline = [{ "$sample": { "size": 1 } }]
    quote_cursor = db.quotes.aggregate(pipeline)
    
    try:
        random_quote = next(quote_cursor)
        daily_quote_data = {
            "quote": random_quote["quote"],
            "author": random_quote["author"],
            "reflectionPrompt": "How can you apply this wisdom to your work today?"
        }
    except StopIteration:
        # Fallback if the quotes collection is empty
        print("--- DASHBOARD: No quotes found in DB, using fallback. ---")
        daily_quote_data = {
            "quote": "Welcome! The journey of a thousand miles begins with a single step.",
            "author": "Lao Tzu",
            "reflectionPrompt": "What is the first step you can take on your journey today?"
        }

    # --- Fetch News Articles ---
    print("--- DASHBOARD: Fetching news articles ---")
    articles_pipeline = [{ "$sample": { "size": 2 } }]
    articles_cursor = db.articles.aggregate(articles_pipeline)
    articles = list(articles_cursor)
    print(f"--- DASHBOARD: Found {len(articles)} articles in DB ---")

    news_articles_data = [
        {
            "id": str(article["_id"]),
            "title": article["title"],
            "summary": article.get("summary", "No summary available."),
            "link": article["link"]
        } for article in articles
    ]

    if not news_articles_data:
        # Fallback if the articles collection is empty
        print("--- DASHBOARD: No articles found in DB, using fallback. ---")
        news_articles_data = [
            {
                "id": "default1",
                "title": "No articles available yet",
                "summary": "Content is being updated. Please check back later.",
                "link": "#"
            }
        ]
    print(f"--- DASHBOARD: Processed news articles data: {news_articles_data} ---")
    
    response_data = models.DashboardData(
        dailyQuote=daily_quote_data,
        newsArticles=news_articles_data,
        growthTrends=growth_trends,
    )
    print(f"--- DASHBOARD: Sending response data: {response_data.model_dump_json()} ---")
    
    # Return a JSONResponse with cache-control headers to prevent caching
    return JSONResponse(
        content=response_data.model_dump(),
        headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
    )

@app.get("/api/v1/articles", response_model=List[models.NewsArticle])
def get_all_articles(db: MongoClient = Depends(get_db)):
    articles_cursor = db.articles.find()
    articles = list(articles_cursor)
    for article in articles:
        article['id'] = str(article['_id'])
    return articles

@app.get("/api/v1/reflections/weekly", response_model=models.WeeklyReflectionData)
def get_weekly_reflection(current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    reflection = db.weekly_reflections.find_one(
        {"userId": ObjectId(current_user.id)},
        sort=[("generatedAt", -1)]
    )

    if reflection:
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        moments_cursor = db.moments.find({
            "userId": ObjectId(current_user.id),
            "createdAt": {"$gte": seven_days_ago}
        })
        moment_count = db.moments.count_documents({
            "userId": ObjectId(current_user.id),
            "createdAt": {"$gte": seven_days_ago}
        })
        
        audio_summary_text = f"You've logged {moment_count} moments in the past week. Keep it up!"
        number_of_moments = moment_count
    else:
        audio_summary_text = "No reflection data found. Generate reflections first."
        number_of_moments = 0

    audio_summary = {
        "title": "Weekly Reflection Summary",
        "duration": "5 min",
        "summary": audio_summary_text,
        "audioUrl": f"http://localhost:8001{reflection['audioUrl']}" if reflection and 'audioUrl' in reflection else None,
    }

    # Fetch calendar insights from the database
    insights_cursor = db.calendar_insights.find()
    insights = [item['insight'] for item in insights_cursor]
    calendar_insights = random.sample(insights, 2) if len(insights) >= 2 else insights
    if not calendar_insights:
        calendar_insights = ["No calendar insights available yet."]

    # Fetch a random virtue suggestion from the database
    # Fetch a random virtue suggestion using an aggregation pipeline
    pipeline = [{ "$sample": { "size": 1 } }]
    suggestion_cursor = db.reflection_suggestions.aggregate(pipeline)
    
    try:
        virtue_suggestion = next(suggestion_cursor)
        virtue_suggestion['_id'] = str(virtue_suggestion['_id'])
    except StopIteration:
        # Handle the case where the collection is empty
        virtue_suggestion = {
            "virtue": "Kindness",
            "practice": "Perform a random act of kindness for someone today.",
        }

    # --- Dynamic Growth Data Calculation ---
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    moments_cursor = db.moments.find({
        "userId": ObjectId(current_user.id),
        "createdAt": {"$gte": seven_days_ago}
    })
    
    resilience_count = 0
    empathy_count = 0
    grit_count = 0
    
    for moment in moments_cursor:
        text = moment.get("text", "").lower()
        if "resilience" in text or "strong" in text or "overcame" in text:
            resilience_count += 1
        if "empathy" in text or "understanding" in text or "compassion" in text:
            empathy_count += 1
        if "grit" in text or "perseverance" in text or "persistent" in text:
            grit_count += 1
            
    growth_data = [
        {
            "name": "This Week",
            "Moments": number_of_moments,
            "Resilience": resilience_count,
            "Empathy": empathy_count,
            "Grit": grit_count,
        }
    ]

    return {
        "audioSummary": audio_summary,
        "calendarInsights": calendar_insights,
        "virtueSuggestion": virtue_suggestion,
        "growthData": growth_data,
    }

@app.get("/api/v1/integrations", response_model=models.Integrations)
def get_integrations(current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    integrations = db.integrations.find_one({"userId": ObjectId(current_user.id)})
    if integrations:
        return models.Integrations(
            email=integrations.get("email", {"connected": False, "settings": {}}),
            slack=integrations.get("slack", {"connected": False, "settings": {}}),
            jira=integrations.get("jira", {"connected": False, "settings": {}}),
        )
    return models.Integrations(
        email={"connected": False, "settings": {}},
        slack={"connected": False, "settings": {}},
        jira={"connected": False, "settings": {}},
    )

@app.put("/api/v1/integrations", response_model=models.Integrations)
def update_integrations(integrations: models.Integrations, current_user: models.User = Depends(auth.get_current_user), db: MongoClient = Depends(get_db)):
    db.integrations.update_one(
        {"userId": ObjectId(current_user.id)},
        {"$set": integrations.model_dump()},
        upsert=True
    )
    return integrations

@app.post("/api/v1/tasks/generate-reflections")
def trigger_generate_reflections():
    generate_weekly_reflections()
    return {"message": "Weekly reflections generation started."}


@app.websocket("/ws/reflections")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except Exception:
        connected_clients.remove(websocket)
