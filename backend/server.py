from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, status, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "fallback_secret_key")

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(days=1), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Models
class UserRegister(BaseModel):
    profileFor: str = "Self"
    gender: str = "Female"
    fullName: str
    dob: Optional[str] = None
    age: int = 25
    religion: str = "Hindu"
    community: str
    education: str
    occupation: str
    state: str
    district: str
    mobile: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ProfileModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    profileFor: str
    gender: str
    name: str
    age: int
    religion: str
    community: str
    education: str
    occupation: str
    state: str
    district: str
    bio: Optional[str] = ""
    photo: Optional[str] = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
    mobile: str
    email: str
    verified: bool = True

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"_id": payload["sub"]})
        if not user:
            # fallback check by email or string id
            user = await db.users.find_one({"email": payload.get("email")})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        user["id"] = str(user.get("_id"))
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Startup event for indexing and seeding
@app.on_event("startup")
async def startup_db():
    try:
        await db.users.create_index("email", unique=True)
        # Seed admin user
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@truejodi.com")
        admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
        existing = await db.users.find_one({"email": admin_email})
        if not existing:
            await db.users.insert_one({
                "_id": str(uuid.uuid4()),
                "fullName": "Truejodi Admin",
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "gender": "Other",
                "community": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc)
            })
            logger.info("Admin user seeded successfully.")
    except Exception as e:
        logger.error(f"Startup db error: {e}")

# Auth Endpoints
@api_router.post("/auth/register")
async def register(input: UserRegister, response: Response):
    email_norm = input.email.lower().strip()
    existing = await db.users.find_one({"email": email_norm})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(input.password)
    user_doc = {
        "_id": user_id,
        "profileFor": input.profileFor,
        "gender": input.gender,
        "fullName": input.fullName,
        "dob": input.dob,
        "age": input.age,
        "religion": input.religion,
        "community": input.community,
        "education": input.education,
        "occupation": input.occupation,
        "state": input.state,
        "district": input.district,
        "mobile": input.mobile,
        "email": email_norm,
        "password_hash": hashed_pwd,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(user_doc)

    access_token = create_access_token(user_id, email_norm)
    refresh_token = create_refresh_token(user_id)

    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

    user_doc.pop("password_hash", None)
    user_doc["id"] = user_id
    return {"message": "Registration successful", "user": user_doc}

@api_router.post("/auth/login")
async def login(input: UserLogin, response: Response):
    email_norm = input.email.lower().strip()
    user = await db.users.find_one({"email": email_norm})
    if not user or not verify_password(input.password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    user_id = user["_id"]
    access_token = create_access_token(user_id, email_norm)
    refresh_token = create_refresh_token(user_id)

    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

    user.pop("password_hash", None)
    user["id"] = user_id
    return {"message": "Login successful", "user": user}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

# Profiles CRUD & Search Endpoints
@api_router.get("/profiles", response_model=List[ProfileModel])
async def get_profiles():
    # Fetch profiles from mongodb or return default mock profiles if empty
    profiles = await db.profiles.find({}, {"_id": 0}).to_list(100)
    if not profiles:
        # Seed initial profiles
        from mock_seed import INITIAL_PROFILES
        await db.profiles.insert_many(INITIAL_PROFILES)
        profiles = INITIAL_PROFILES
    return profiles

@api_router.post("/profiles", response_model=ProfileModel)
async def create_profile(profile: ProfileModel):
    doc = profile.model_dump()
    await db.profiles.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
    return profile

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
