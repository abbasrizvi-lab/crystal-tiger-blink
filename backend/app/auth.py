import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
from . import models
from .db import get_db
from pymongo.mongo_client import MongoClient

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "your_super_secret_key_change_this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__ident="2b")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password, hashed_password):
    print(f"--- AUTH: Verifying password. Plain: '{plain_password}', Hashed: '{hashed_password}' ---")
    try:
        is_verified = pwd_context.verify(plain_password, hashed_password)
        print(f"--- AUTH: Password verification result: {is_verified} ---")
        return is_verified
    except Exception as e:
        print(f"--- AUTH: ERROR during password verification: {e} ---")
        return False

def get_password_hash(password):
    print("--- Hashing password ---")
    try:
        hashed_password = pwd_context.hash(password)
        print("--- Password hashed successfully ---")
        return hashed_password
    except Exception as e:
        print(f"ERROR during password hashing: {e}")
        raise

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(request: Request, db: MongoClient = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = request.cookies.get("access_token")
    if token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    user_model = models.User(id=str(user["_id"]), email=user["email"])
    user_data = user.copy()
    user_data["id"] = str(user_data.pop("_id"))
    user_model = models.User(**user_data)
    return user_model
