from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, status, Depends, UploadFile, File, Query, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
APP_NAME = os.environ.get("APP_NAME", "truejodi-matrimony")
MAX_PHOTOS_PER_USER = 3

# ---------------------------------------------------------------------
# Object Storage (Emergent Integrations)
# ---------------------------------------------------------------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
storage_key: Optional[str] = None

def init_storage(force: bool = False) -> Optional[str]:
    global storage_key
    if storage_key and not force:
        return storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY not set — object storage disabled")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage service unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120
        )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage service unavailable")
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------
def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "fallback_secret_key")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(days=1), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

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

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ---------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------
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
    profileFor: str = "Self"
    gender: str = "Female"
    name: str
    age: int = 25
    religion: str = "Hindu"
    community: str = "Brahmin"
    education: str = "B.Tech"
    occupation: str = "Software Engineer"
    state: str = "Maharashtra"
    district: str = "Mumbai"
    bio: Optional[str] = ""
    photo: Optional[str] = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
    mobile: str = "9876543210"
    email: str = "user@example.com"
    verified: bool = True
    motherTongue: Optional[str] = "Hindi"
    maritalStatus: Optional[str] = "Never Married"
    height: Optional[str] = "5 ft 6 in"
    familyDetails: Optional[str] = ""
    partnerPreferences: Optional[str] = ""
    photosGallery: Optional[List[str]] = []

# ---------------------------------------------------------------------
# Profile completion and recommendation engine (modular)
# ---------------------------------------------------------------------
COMPLETION_FIELDS = [
    "fullName", "gender", "age", "dob", "height", "maritalStatus",
    "religion", "community", "motherTongue",
    "education", "occupation", "annualIncome",
    "state", "district", "mobile", "email",
    "aboutMe", "familyDetails", "partnerExpectations",
    "diet", "smoking", "drinking", "hobbies", "languages",
    "photos"
]

def _is_filled(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return value.strip() != ""
    if isinstance(value, list):
        return len(value) > 0
    if isinstance(value, dict):
        return len(value) > 0
    return True

def calc_completion(user: dict) -> int:
    filled = 0
    for f in COMPLETION_FIELDS:
        if _is_filled(user.get(f)):
            filled += 1
    return round((filled / len(COMPLETION_FIELDS)) * 100)

# Weighted compatibility scoring — modular and configurable
COMPATIBILITY_WEIGHTS = {
    "age":               15,
    "religion":          15,
    "community":         10,
    "motherTongue":       8,
    "maritalStatus":      8,
    "education":         10,
    "occupation":         8,
    "state":              8,
    "district":           6,
    "height":             6,
    "partnerPreferences": 3,
    "completeness":       3,
}

def _parse_int(v, default=0):
    try:
        return int(v)
    except Exception:
        return default

def _parse_height_inches(h: Optional[str]) -> Optional[int]:
    if not h:
        return None
    s = str(h).lower().replace("’", "'").replace("”", '"')
    ft, inch = 0, 0
    try:
        if "ft" in s:
            parts = s.split("ft")
            ft = _parse_int(parts[0].strip())
            rest = parts[1] if len(parts) > 1 else ""
            rest = rest.replace("in", "").replace('"', "").strip()
            inch = _parse_int(rest)
            return ft * 12 + inch
        if "'" in s:
            parts = s.split("'")
            ft = _parse_int(parts[0].strip())
            rest = parts[1].replace('"', "").strip() if len(parts) > 1 else ""
            inch = _parse_int(rest)
            return ft * 12 + inch
    except Exception:
        return None
    return None

def compute_compatibility(user: dict, candidate: dict) -> int:
    """Returns compatibility score 0..100 between the searching user and candidate profile."""
    prefs = user.get("partnerPreferences") or {}
    if isinstance(prefs, str):
        prefs = {}
    score = 0.0
    total_weight = 0.0

    # Age
    total_weight += COMPATIBILITY_WEIGHTS["age"]
    age_from = _parse_int(prefs.get("ageFrom"), 0)
    age_to = _parse_int(prefs.get("ageTo"), 0)
    cage = _parse_int(candidate.get("age"), 0)
    if age_from and age_to:
        if age_from <= cage <= age_to:
            score += COMPATIBILITY_WEIGHTS["age"]
    else:
        uage = _parse_int(user.get("age"), 0)
        if uage and cage and abs(uage - cage) <= 5:
            score += COMPATIBILITY_WEIGHTS["age"]

    # Religion
    total_weight += COMPATIBILITY_WEIGHTS["religion"]
    pref_rel = prefs.get("religion") or user.get("religion")
    if pref_rel and candidate.get("religion") and pref_rel.lower() == candidate["religion"].lower():
        score += COMPATIBILITY_WEIGHTS["religion"]

    # Community
    total_weight += COMPATIBILITY_WEIGHTS["community"]
    pref_com = prefs.get("community") or user.get("community")
    if pref_com and candidate.get("community") and pref_com.lower() in candidate["community"].lower():
        score += COMPATIBILITY_WEIGHTS["community"]

    # Mother Tongue
    total_weight += COMPATIBILITY_WEIGHTS["motherTongue"]
    pref_mt = prefs.get("motherTongue") or user.get("motherTongue")
    if pref_mt and candidate.get("motherTongue") and pref_mt.lower() == candidate["motherTongue"].lower():
        score += COMPATIBILITY_WEIGHTS["motherTongue"]

    # Marital Status
    total_weight += COMPATIBILITY_WEIGHTS["maritalStatus"]
    pref_ms = prefs.get("maritalStatus") or "Never Married"
    if candidate.get("maritalStatus") and pref_ms.lower() == candidate["maritalStatus"].lower():
        score += COMPATIBILITY_WEIGHTS["maritalStatus"]

    # Education (substring match)
    total_weight += COMPATIBILITY_WEIGHTS["education"]
    pref_edu = (prefs.get("education") or "").strip().lower()
    cand_edu = (candidate.get("education") or "").strip().lower()
    if pref_edu and cand_edu and pref_edu in cand_edu:
        score += COMPATIBILITY_WEIGHTS["education"]
    elif not pref_edu and cand_edu:
        # partial credit if candidate has some education
        score += COMPATIBILITY_WEIGHTS["education"] * 0.5

    # Occupation
    total_weight += COMPATIBILITY_WEIGHTS["occupation"]
    pref_occ = (prefs.get("occupation") or "").strip().lower()
    cand_occ = (candidate.get("occupation") or "").strip().lower()
    if pref_occ and cand_occ and pref_occ in cand_occ:
        score += COMPATIBILITY_WEIGHTS["occupation"]
    elif not pref_occ and cand_occ:
        score += COMPATIBILITY_WEIGHTS["occupation"] * 0.5

    # State
    total_weight += COMPATIBILITY_WEIGHTS["state"]
    pref_st = (prefs.get("state") or user.get("state") or "").strip().lower()
    if pref_st and candidate.get("state") and pref_st == candidate["state"].strip().lower():
        score += COMPATIBILITY_WEIGHTS["state"]

    # District/City
    total_weight += COMPATIBILITY_WEIGHTS["district"]
    pref_dt = (prefs.get("district") or user.get("district") or "").strip().lower()
    if pref_dt and candidate.get("district") and pref_dt == candidate["district"].strip().lower():
        score += COMPATIBILITY_WEIGHTS["district"]

    # Height
    total_weight += COMPATIBILITY_WEIGHTS["height"]
    hf = _parse_height_inches(prefs.get("heightFrom"))
    ht = _parse_height_inches(prefs.get("heightTo"))
    ch = _parse_height_inches(candidate.get("height"))
    if hf and ht and ch and hf <= ch <= ht:
        score += COMPATIBILITY_WEIGHTS["height"]
    elif ch and not (hf and ht):
        score += COMPATIBILITY_WEIGHTS["height"] * 0.5

    # Partner Preferences: candidate's aboutMe/partnerExpectations exists
    total_weight += COMPATIBILITY_WEIGHTS["partnerPreferences"]
    if candidate.get("partnerExpectations") or candidate.get("aboutMe"):
        score += COMPATIBILITY_WEIGHTS["partnerPreferences"]

    # Profile Completeness
    total_weight += COMPATIBILITY_WEIGHTS["completeness"]
    cc = calc_completion(candidate) / 100.0
    score += COMPATIBILITY_WEIGHTS["completeness"] * cc

    if total_weight <= 0:
        return 0
    return int(round((score / total_weight) * 100))

# ---------------------------------------------------------------------
# Serialization
# ---------------------------------------------------------------------
def serialize_user(user: dict, viewer: Optional[dict] = None, unlocked_contact: bool = False) -> dict:
    """Prepare user for API response. Enforces privacy for other viewers.

    unlocked_contact=True bypasses hideMobile/hideEmail/hideWhatsapp — used when
    the viewer has an accepted interest with the target.
    """
    if not user:
        return {}
    u = dict(user)
    u["id"] = str(u.get("_id") or u.get("id"))
    u.pop("_id", None)
    u.pop("password_hash", None)
    # created_at datetime -> iso
    for k in ("created_at", "updated_at"):
        v = u.get(k)
        if isinstance(v, datetime):
            u[k] = v.isoformat()
    # Ensure default nested structures
    u.setdefault("photos", [])
    u.setdefault("partnerPreferences", {})
    u.setdefault("privacySettings", {})
    u.setdefault("blockedUsers", [])

    is_owner = viewer and (viewer.get("id") == u["id"])
    if is_owner:
        return u

    # For other viewers, apply privacy
    priv = u.get("privacySettings") or {}
    if priv.get("hideMobile", True) and not unlocked_contact:
        u["mobile"] = None
    if priv.get("hideEmail", True) and not unlocked_contact:
        u["email"] = None
    if priv.get("hideWhatsapp", True) and not unlocked_contact:
        u["whatsapp"] = None
    if priv.get("hidePhotos"):
        u["photos"] = []
    if priv.get("hideLocation"):
        u["district"] = None
    if priv.get("hideOnlineStatus"):
        u["onlineStatus"] = None
        u["lastSeen"] = None
    u.pop("blockedUsers", None)
    u.pop("reportedUsers", None)
    return u

# ---------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------
@app.on_event("startup")
async def startup_db():
    try:
        await db.users.create_index("email", unique=True)
        # Init storage
        init_storage()
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
        # Seed test user
        test_email = "testuser@truejodi.com"
        if not await db.users.find_one({"email": test_email}):
            await db.users.insert_one({
                "_id": str(uuid.uuid4()),
                "fullName": "Test User",
                "email": test_email,
                "password_hash": hash_password("testpass123"),
                "gender": "Female",
                "age": 26,
                "religion": "Hindu",
                "community": "Brahmin",
                "motherTongue": "Hindi",
                "maritalStatus": "Never Married",
                "height": "5 ft 5 in",
                "education": "B.Tech",
                "occupation": "Software Engineer",
                "state": "Maharashtra",
                "district": "Mumbai",
                "mobile": "9876543210",
                "role": "user",
                "photos": [],
                "partnerPreferences": {"ageFrom": 26, "ageTo": 32, "religion": "Hindu"},
                "privacySettings": {"hideMobile": True, "hideEmail": True, "profileVisibility": "Public"},
                "created_at": datetime.now(timezone.utc)
            })
            logger.info("Test user seeded.")

        # Seed sample matrimonial candidates for search & recommendations
        from mock_seed import SAMPLE_USERS
        for s in SAMPLE_USERS:
            if await db.users.find_one({"email": s["email"]}):
                continue
            uid = str(uuid.uuid4())
            photo_id = str(uuid.uuid4())
            doc = {
                "_id": uid,
                "password_hash": hash_password("Password@123"),
                "role": "user",
                "profileFor": "Self",
                "photos": [{
                    "id": photo_id,
                    "storage_path": s["primary_photo_url"],
                    "content_type": "image/jpeg",
                    "is_primary": True,
                    "is_external": True,
                    "uploaded_at": datetime.now(timezone.utc).isoformat(),
                }],
                "partnerPreferences": {},
                "privacySettings": {
                    "hideMobile": True, "hideEmail": True, "hideWhatsapp": True,
                    "hidePhotos": False, "profileVisibility": "Public",
                    "whoCanView": "Everyone", "showLastSeen": True, "hideOnlineStatus": False,
                    "hideLocation": False,
                },
                "blockedUsers": [],
                "created_at": datetime.now(timezone.utc),
                **{k: v for k, v in s.items() if k != "primary_photo_url"},
            }
            await db.users.insert_one(doc)
        logger.info("Sample matrimonial candidates seeded.")
    except Exception as e:
        logger.error(f"Startup db error: {e}")

# ---------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------
@api_router.post("/auth/register")
async def register(input: UserRegister, response: Response):
    email_norm = input.email.lower().strip()
    existing = await db.users.find_one({"email": email_norm})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
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
        "password_hash": hash_password(input.password),
        "role": "user",
        "photos": [],
        "partnerPreferences": {},
        "privacySettings": {
            "hideMobile": True,
            "hideEmail": True,
            "hideWhatsapp": True,
            "hidePhotos": False,
            "profileVisibility": "Public",
            "whoCanView": "Everyone",
            "showLastSeen": True,
            "hideOnlineStatus": False,
            "hideLocation": False,
        },
        "blockedUsers": [],
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(user_doc)

    access_token = create_access_token(user_id, email_norm)
    refresh_token = create_refresh_token(user_id)

    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

    return {"message": "Registration successful", "user": serialize_user(user_doc, viewer={"id": user_id}), "access_token": access_token, "token_type": "Bearer"}

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
    return {"message": "Login successful", "user": serialize_user(user, viewer={"id": user_id}), "access_token": access_token, "token_type": "Bearer"}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return serialize_user(current_user, viewer=current_user)

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

# ---------------------------------------------------------------------
# User Profile Endpoints
# ---------------------------------------------------------------------
# Whitelisted profile fields user can update
UPDATABLE_FIELDS = {
    "fullName", "profileFor", "gender", "dob", "age", "height",
    "maritalStatus", "religion", "community", "motherTongue",
    "education", "occupation", "annualIncome",
    "state", "district", "mobile", "whatsapp", "email",
    "aboutMe", "familyDetails", "partnerExpectations",
    "diet", "smoking", "drinking", "disability", "manglik", "horoscope",
    "languages", "hobbies",
    "partnerPreferences", "privacySettings",
}

@api_router.put("/users/profile")
async def update_user_profile(payload: dict, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    updates = {k: v for k, v in payload.items() if k in UPDATABLE_FIELDS}
    updates["updated_at"] = datetime.now(timezone.utc)
    await db.users.update_one({"_id": user_id}, {"$set": updates})
    updated = await db.users.find_one({"_id": user_id})
    return {"message": "Profile updated successfully", "user": serialize_user(updated, viewer={"id": user_id})}

# Backward compatibility
@api_router.put("/auth/profile")
async def update_user_profile_legacy(payload: dict, current_user: dict = Depends(get_current_user)):
    return await update_user_profile(payload, current_user)

@api_router.get("/users/completion")
async def get_completion(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": current_user["id"]})
    return {"completion": calc_completion(user or {})}

@api_router.delete("/users/me")
async def delete_account(response: Response, current_user: dict = Depends(get_current_user)):
    """Permanently delete the current user's account."""
    user_id = current_user["id"]
    # Soft-delete photo objects and remove user doc
    user = await db.users.find_one({"_id": user_id})
    if user and user.get("photos"):
        await db.files.update_many(
            {"user_id": user_id},
            {"$set": {"is_deleted": True, "deleted_at": datetime.now(timezone.utc)}}
        )
    await db.users.delete_one({"_id": user_id})
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Account permanently deleted"}

# ---------------------------------------------------------------------
# Photo Endpoints
# ---------------------------------------------------------------------
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB

@api_router.post("/users/photos")
async def upload_photo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    user = await db.users.find_one({"_id": user_id})
    photos = (user or {}).get("photos") or []
    if len(photos) >= MAX_PHOTOS_PER_USER:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_PHOTOS_PER_USER} photos allowed. Delete one to add another.")
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG/PNG/WEBP/GIF images allowed")
    data = await file.read()
    if len(data) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="Image exceeds 5MB limit")
    ext = (file.filename or "img").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
    photo_id = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/{user_id}/{photo_id}.{ext}"
    result = put_object(path, data, content_type)

    photo_record = {
        "id": photo_id,
        "storage_path": result["path"],
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_primary": len(photos) == 0,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.files.insert_one({
        **photo_record,
        "user_id": user_id,
        "original_filename": file.filename,
        "is_deleted": False,
    })
    photos.append(photo_record)
    await db.users.update_one({"_id": user_id}, {"$set": {"photos": photos, "updated_at": datetime.now(timezone.utc)}})
    return {"message": "Photo uploaded", "photo": photo_record, "photos": photos}

@api_router.delete("/users/photos/{photo_id}")
async def delete_photo(photo_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    user = await db.users.find_one({"_id": user_id})
    photos = (user or {}).get("photos") or []
    new_photos = [p for p in photos if p.get("id") != photo_id]
    if len(new_photos) == len(photos):
        raise HTTPException(status_code=404, detail="Photo not found")
    # If we deleted primary, promote the first remaining
    if not any(p.get("is_primary") for p in new_photos) and new_photos:
        new_photos[0]["is_primary"] = True
    await db.files.update_one({"id": photo_id, "user_id": user_id}, {"$set": {"is_deleted": True}})
    await db.users.update_one({"_id": user_id}, {"$set": {"photos": new_photos}})
    return {"message": "Photo deleted", "photos": new_photos}

@api_router.post("/users/photos/{photo_id}/primary")
async def set_primary_photo(photo_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    user = await db.users.find_one({"_id": user_id})
    photos = (user or {}).get("photos") or []
    found = False
    for p in photos:
        if p.get("id") == photo_id:
            p["is_primary"] = True
            found = True
        else:
            p["is_primary"] = False
    if not found:
        raise HTTPException(status_code=404, detail="Photo not found")
    await db.users.update_one({"_id": user_id}, {"$set": {"photos": photos}})
    return {"message": "Primary photo updated", "photos": photos}

@api_router.get("/files/{path:path}")
async def download_file(path: str, request: Request):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))

# ---------------------------------------------------------------------
# Blocking & Reporting
# ---------------------------------------------------------------------
@api_router.post("/users/block/{target_id}")
async def block_user(target_id: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one({"_id": current_user["id"]}, {"$addToSet": {"blockedUsers": target_id}})
    return {"message": "User blocked"}

@api_router.post("/users/unblock/{target_id}")
async def unblock_user(target_id: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one({"_id": current_user["id"]}, {"$pull": {"blockedUsers": target_id}})
    return {"message": "User unblocked"}

@api_router.post("/users/report/{target_id}")
async def report_user(target_id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    await db.reports.insert_one({
        "id": str(uuid.uuid4()),
        "reporter_id": current_user["id"],
        "target_id": target_id,
        "reason": payload.get("reason", ""),
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": "Report submitted. Our team will review."}

# ---------------------------------------------------------------------
# Interests (Send Interest → Accept/Decline flow that unlocks contact)
# ---------------------------------------------------------------------
async def is_contact_unlocked(viewer_id: str, target_id: str) -> bool:
    """Contact is unlocked between two users when an accepted interest
    exists in either direction between them."""
    if not viewer_id or not target_id or viewer_id == target_id:
        return viewer_id == target_id
    doc = await db.interests.find_one({
        "status": "accepted",
        "$or": [
            {"from_user_id": viewer_id, "to_user_id": target_id},
            {"from_user_id": target_id, "to_user_id": viewer_id},
        ]
    })
    return doc is not None

async def get_interest_status_map(viewer_id: str, target_ids: List[str]) -> Dict[str, dict]:
    """Return per-target interest status keyed by target user_id:
    { target_id: {status, direction, interest_id} }.
    status: none | pending | accepted | declined
    direction: sent | received (only meaningful for pending)."""
    if not target_ids:
        return {}
    cursor = db.interests.find({
        "$or": [
            {"from_user_id": viewer_id, "to_user_id": {"$in": target_ids}},
            {"to_user_id": viewer_id, "from_user_id": {"$in": target_ids}},
        ]
    })
    out: Dict[str, dict] = {}
    async for doc in cursor:
        other = doc["to_user_id"] if doc["from_user_id"] == viewer_id else doc["from_user_id"]
        direction = "sent" if doc["from_user_id"] == viewer_id else "received"
        existing = out.get(other)
        # Prefer accepted > pending > declined ordering
        rank = {"accepted": 3, "pending": 2, "declined": 1}
        if not existing or rank.get(doc["status"], 0) > rank.get(existing["status"], 0):
            out[other] = {"status": doc["status"], "direction": direction, "interest_id": doc["id"]}
    return out

@api_router.post("/interests/send/{target_id}")
async def send_interest(target_id: str, current_user: dict = Depends(get_current_user)):
    viewer_id = current_user["id"]
    if target_id == viewer_id:
        raise HTTPException(status_code=400, detail="You cannot send interest to yourself")
    target = await db.users.find_one({"_id": target_id})
    if not target:
        raise HTTPException(status_code=404, detail="Profile not found")
    # Prevent duplicates: if a pending or accepted interest already exists in either direction, reject.
    existing = await db.interests.find_one({
        "status": {"$in": ["pending", "accepted"]},
        "$or": [
            {"from_user_id": viewer_id, "to_user_id": target_id},
            {"from_user_id": target_id, "to_user_id": viewer_id},
        ]
    })
    if existing:
        return {"message": "Interest already exists", "interest": {
            "id": existing["id"], "status": existing["status"],
            "from_user_id": existing["from_user_id"], "to_user_id": existing["to_user_id"],
        }}
    doc = {
        "id": str(uuid.uuid4()),
        "from_user_id": viewer_id,
        "to_user_id": target_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
        "responded_at": None,
    }
    await db.interests.insert_one(doc)
    return {"message": "Interest sent", "interest": {
        "id": doc["id"], "status": "pending",
        "from_user_id": viewer_id, "to_user_id": target_id,
    }}

@api_router.get("/interests/received")
async def list_received_interests(current_user: dict = Depends(get_current_user),
                                   status_filter: Optional[str] = Query(None, alias="status")):
    q: Dict[str, Any] = {"to_user_id": current_user["id"]}
    if status_filter:
        q["status"] = status_filter
    interests = await db.interests.find(q).sort("created_at", -1).to_list(200)
    # Attach sender snapshot
    results = []
    for i in interests:
        sender = await db.users.find_one({"_id": i["from_user_id"]})
        if not sender:
            continue
        unlocked = i["status"] == "accepted"
        results.append({
            "id": i["id"],
            "status": i["status"],
            "created_at": i["created_at"].isoformat() if isinstance(i.get("created_at"), datetime) else i.get("created_at"),
            "responded_at": i["responded_at"].isoformat() if isinstance(i.get("responded_at"), datetime) else i.get("responded_at"),
            "from_user": serialize_user(sender, viewer=current_user, unlocked_contact=unlocked),
        })
    return {"interests": results}

@api_router.get("/interests/sent")
async def list_sent_interests(current_user: dict = Depends(get_current_user),
                              status_filter: Optional[str] = Query(None, alias="status")):
    q: Dict[str, Any] = {"from_user_id": current_user["id"]}
    if status_filter:
        q["status"] = status_filter
    interests = await db.interests.find(q).sort("created_at", -1).to_list(200)
    results = []
    for i in interests:
        target = await db.users.find_one({"_id": i["to_user_id"]})
        if not target:
            continue
        unlocked = i["status"] == "accepted"
        results.append({
            "id": i["id"],
            "status": i["status"],
            "created_at": i["created_at"].isoformat() if isinstance(i.get("created_at"), datetime) else i.get("created_at"),
            "responded_at": i["responded_at"].isoformat() if isinstance(i.get("responded_at"), datetime) else i.get("responded_at"),
            "to_user": serialize_user(target, viewer=current_user, unlocked_contact=unlocked),
        })
    return {"interests": results}

@api_router.post("/interests/{interest_id}/respond")
async def respond_interest(interest_id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    action = (payload or {}).get("action", "").lower()
    if action not in ("accept", "decline"):
        raise HTTPException(status_code=400, detail="action must be 'accept' or 'decline'")
    interest = await db.interests.find_one({"id": interest_id})
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")
    if interest["to_user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only respond to interests sent to you")
    if interest["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Interest is already {interest['status']}")
    new_status = "accepted" if action == "accept" else "declined"
    await db.interests.update_one(
        {"id": interest_id},
        {"$set": {"status": new_status, "responded_at": datetime.now(timezone.utc)}}
    )
    return {"message": f"Interest {new_status}", "status": new_status}

@api_router.get("/interests/status/{target_id}")
async def get_interest_status(target_id: str, current_user: dict = Depends(get_current_user)):
    m = await get_interest_status_map(current_user["id"], [target_id])
    return m.get(target_id, {"status": "none", "direction": None, "interest_id": None})

# ---------------------------------------------------------------------
# Recommendations & Search
# ---------------------------------------------------------------------
def _opposite_gender(g: Optional[str]) -> Optional[str]:
    if not g:
        return None
    g = g.lower()
    if g == "male":
        return "Female"
    if g == "female":
        return "Male"
    return None

@api_router.get("/recommendations")
async def get_recommendations(limit: int = 12, current_user: dict = Depends(get_current_user)):
    """Weighted compatibility-based recommendations for the current user."""
    target_gender = _opposite_gender(current_user.get("gender"))
    query: Dict[str, Any] = {"_id": {"$ne": current_user["id"]}, "role": {"$ne": "admin"}}
    if target_gender:
        query["gender"] = target_gender
    # Exclude blocked users
    blocked = current_user.get("blockedUsers") or []
    if blocked:
        query["_id"] = {"$nin": [current_user["id"]] + blocked}

    candidates = await db.users.find(query).to_list(500)
    scored = []
    for c in candidates:
        # respect visibility
        priv = c.get("privacySettings") or {}
        if priv.get("profileVisibility") in ("Private", "Hidden"):
            continue
        score = compute_compatibility(current_user, c)
        scored.append((score, c))
    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:limit]
    target_ids = [c.get("_id") for _, c in top if c.get("_id")]
    status_map = await get_interest_status_map(current_user["id"], target_ids)
    results = []
    for score, c in top:
        istate = status_map.get(c.get("_id"), {"status": "none"})
        unlocked = istate["status"] == "accepted"
        u = serialize_user(c, viewer=current_user, unlocked_contact=unlocked)
        u["compatibility"] = score
        u["interest"] = istate
        results.append(u)
    return {"recommendations": results}

@api_router.get("/profiles/search")
async def search_profiles(
    gender: Optional[str] = None,
    ageFrom: Optional[int] = None,
    ageTo: Optional[int] = None,
    religion: Optional[str] = None,
    community: Optional[str] = None,
    motherTongue: Optional[str] = None,
    education: Optional[str] = None,
    occupation: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    maritalStatus: Optional[str] = None,
    heightFrom: Optional[str] = None,
    heightTo: Optional[str] = None,
    limit: int = 60,
    current_user: dict = Depends(get_current_user),
):
    query: Dict[str, Any] = {"_id": {"$ne": current_user["id"]}, "role": {"$ne": "admin"}}
    if gender and gender != "All":
        query["gender"] = gender
    if religion and religion != "All":
        query["religion"] = religion
    if community:
        query["community"] = {"$regex": community, "$options": "i"}
    if motherTongue:
        query["motherTongue"] = {"$regex": motherTongue, "$options": "i"}
    if education:
        query["education"] = {"$regex": education, "$options": "i"}
    if occupation:
        query["occupation"] = {"$regex": occupation, "$options": "i"}
    if state:
        query["state"] = {"$regex": state, "$options": "i"}
    if district:
        query["district"] = {"$regex": district, "$options": "i"}
    if maritalStatus and maritalStatus != "All":
        query["maritalStatus"] = maritalStatus
    if ageFrom is not None or ageTo is not None:
        rng = {}
        if ageFrom is not None:
            rng["$gte"] = ageFrom
        if ageTo is not None:
            rng["$lte"] = ageTo
        if rng:
            query["age"] = rng
    # blocked
    blocked = current_user.get("blockedUsers") or []
    if blocked:
        query["_id"] = {"$nin": [current_user["id"]] + blocked}

    docs = await db.users.find(query).to_list(limit * 2)
    hf = _parse_height_inches(heightFrom)
    ht = _parse_height_inches(heightTo)

    filtered = []
    for d in docs:
        priv = d.get("privacySettings") or {}
        if priv.get("profileVisibility") in ("Private", "Hidden"):
            continue
        if hf or ht:
            ch = _parse_height_inches(d.get("height"))
            if ch is None:
                continue
            if hf and ch < hf:
                continue
            if ht and ch > ht:
                continue
        filtered.append(d)

    target_ids = [d.get("_id") for d in filtered if d.get("_id")]
    status_map = await get_interest_status_map(current_user["id"], target_ids)

    results = []
    for d in filtered:
        istate = status_map.get(d.get("_id"), {"status": "none"})
        unlocked = istate["status"] == "accepted"
        s = serialize_user(d, viewer=current_user, unlocked_contact=unlocked)
        s["compatibility"] = compute_compatibility(current_user, d)
        s["interest"] = istate
        results.append(s)
    results.sort(key=lambda x: x.get("compatibility", 0), reverse=True)
    return {"results": results[:limit], "count": len(results[:limit])}

# ---------------------------------------------------------------------
# Public profile detail
# ---------------------------------------------------------------------
@api_router.get("/profiles/{user_id}")
async def get_profile_detail(user_id: str, current_user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"_id": user_id})
    if not u:
        raise HTTPException(status_code=404, detail="Profile not found")
    unlocked = await is_contact_unlocked(current_user["id"], user_id)
    resp = serialize_user(u, viewer=current_user, unlocked_contact=unlocked)
    m = await get_interest_status_map(current_user["id"], [user_id])
    resp["interest"] = m.get(user_id, {"status": "none", "direction": None, "interest_id": None})
    return resp

# ---------------------------------------------------------------------
# Legacy /profiles endpoint (kept for backwards compat with Home page)
# ---------------------------------------------------------------------
@api_router.get("/profiles", response_model=List[ProfileModel])
async def get_profiles():
    profiles = await db.profiles.find({}, {"_id": 0}).to_list(100)
    if not profiles:
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
    allow_origin_regex=r"^https?://(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|.*\.preview\.emergentagent\.com|.*\.emergentagent\.com)$",
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
