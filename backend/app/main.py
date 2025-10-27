from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import ping_db

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",
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