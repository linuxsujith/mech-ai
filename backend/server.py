from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import uuid
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import litellm
import jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends

# ──── App & DB Setup ────
app = FastAPI(title="AI Mechanic Backend")
api_router = APIRouter(prefix="/api")

load_dotenv()
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "ai_mechanic")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("server")

from mongomock_motor import AsyncMongoMockClient
client = AsyncMongoMockClient()
db = client[DB_NAME]

# ──── Auth Setup ────
SECRET_KEY = os.environ.get("JWT_SECRET", "mechai_super_secret_dev_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return user

# ──── Auth Endpoints ────

@api_router.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "id": user_id,
        "email": user.email.lower(),
        "name": user.name,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id, "email": user_doc["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"id": user_id, "email": user_doc["email"], "name": user_doc["name"]}
    }

@api_router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username.lower()})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"], "email": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"], "name": user["name"]}
    }

class ImageContent:
    def __init__(self, image_base64):
        self.image_base64 = image_base64

class UserMessage:
    def __init__(self, text, file_contents=None):
        self.text = text
        self.file_contents = file_contents or []

class LlmChat:
    def __init__(self, api_key, session_id, system_message):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.provider = "openai"
        self.model = "gpt-4o"
        
    def with_model(self, provider, model):
        self.provider = provider
        self.model = model
        
    async def send_message(self, user_message: UserMessage):
        messages = [{"role": "system", "content": self.system_message}]
        content = [{"type": "text", "text": user_message.text}]
        
        for f in user_message.file_contents:
            if isinstance(f, ImageContent):
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{f.image_base64}"
                    }
                })
        messages.append({"role": "user", "content": content})
        
        # Use Google Gemini for all requests (universal fallback)
        gemini_key = os.environ.get('GEMINI_API_KEY', '')
        gemini_model = "gemini/gemini-2.5-flash"
        
        logger.info(f"LlmChat: calling Gemini model={gemini_model}, original_provider={self.provider}, original_model={self.model}, key_set={bool(gemini_key)}")
        
        response = await litellm.acompletion(
            model=gemini_model,
            messages=messages,
            api_key=gemini_key,
        )
        return response.choices[0].message.content



def get_dynamic_prompt(problem_category: str) -> str:
    domain_knowledge = ""
    system_areas = ""
    
    if "Vehicle" in problem_category:
        domain_knowledge = "You are MECHAI — the Vehicle Intelligence Authority. You are a precision diagnostic AI that analyzes vehicle images with absolute confidence and mechanical authority."
        system_areas = "ENGINE, BRAKE & SUSPENSION, ELECTRICAL, TYRES, GENERAL MAINTENANCE, HEAVY DIESEL SYSTEMS, EV BATTERY"
    elif "Electronic" in problem_category:
        domain_knowledge = "You are ProScan AI — an expert Electronics and Hardware Technician. You diagnose PCB faults, screen damage, cable issues, and chassis damage with absolute precision."
        system_areas = "CIRCUIT BOARD, SCREEN DISPLAY, BATTERY UNIT, PORTS & CONNECTORS, CHASSIS/CASING, COOLING SYSTEM"
    elif "Home Appliance" in problem_category:
        domain_knowledge = "You are ProScan AI — a Master Appliance Repair Technician. You identify faults in refrigerators, washing machines, AC units, and other home devices."
        system_areas = "MOTOR/COMPRESSOR, WATER/DRAINAGE, CONTROL BOARD, HEATING/COOLING ELEMENT, STRUCTURAL CASING"
    elif "Plant" in problem_category:
        domain_knowledge = "You are ProScan AI — an Expert Botanist and Agronomist. You diagnose plant diseases, pest infestations, nutrient deficiencies, and soil issues from visual symptoms."
        system_areas = "LEAVES/FOLIAGE, STEM/BRANCHES, ROOTS/SOIL, FRUIT/FLOWER, PEST ACTIVITY, FUNGAL INFECTION"
    elif "Health" in problem_category:
        domain_knowledge = "You are ProScan AI — an AI Dermatological and Visual Health Assistant. You provide highly accurate preliminary visual analysis of skin conditions. DISCLAIMER: Always recommend professional medical consultation."
        system_areas = "SKIN SURFACE, RASH/DISCOLORATION, SWELLING/INFLAMMATION, WOUND/ABRASION, INFECTION SIGNS"
    elif "Machinery" in problem_category:
        domain_knowledge = "You are ProScan AI — an Industrial Machinery Diagnostics Expert. You analyze wear and tear, structural fatigue, and mechanical failure in heavy tools and industrial equipment."
        system_areas = "GEARS/BEARINGS, HYDRAULIC SYSTEMS, METAL FATIGUE/RUST, OPERATIONAL BLADES/BITS, MOTOR ATTACHMENTS"
    else:
        domain_knowledge = "You are ProScan AI — a Universal Universal Diagnostic Engine. You detect anomalies and physical problems from any image."
        system_areas = "PRIMARY STRUCTURE, SURFACE INTEGRITY, OPERATIONAL COMPONENTS"

    return f"""{domain_knowledge}

BEHAVIOR RULES:
- Analyze point-to-point with structured precision
- Detect exact problem areas from visual evidence
- Speak in confident, professional, authoritative tone
- NEVER use weak language like "maybe", "possibly", "might", "could be"
- If image is unclear, state: "Image clarity insufficient. Please provide closer angle of the affected area."

You are currently diagnosing within the domain: {problem_category}

Systems you commonly evaluate in this domain:
{system_areas}

You MUST respond in this EXACT JSON structure (no markdown, pure JSON). Keep the JSON keys exactly as written, even if analyzing a plant or a laptop (e.g. use 'vehicle_classification' to store the generic object type like 'Ficus Plant' or 'iPhone 13'):
{{
  "vehicle_classification": {{"type": "Generic Type", "make_model_estimate": "Specific Model/Breed", "confidence_percent": 0}},
  "system_area": "",
  "condition_summary": "",
  "detected_issues": [
    {{
      "issue_name": "",
      "mechanical_evidence": "Visual evidence of the problem",
      "root_cause": "",
      "severity": "Low|Medium|High|Critical",
      "confidence_percent": 0
    }}
  ],
  "action_protocol": ["Step 1", "Step 2", "Step 3"],
  "repair_recommendation": "Main solution or treatment",
  "risk_status": "Operational|Restricted Operation|Immediate Shutdown Required",
  "estimated_cost_range_inr": {{"min": 0, "max": 0}},
  "health_index": {{
    "engine_integrity": 0,
    "brake_reliability": 0,
    "electrical_stability": 0,
    "tyre_condition": 0,
    "overall_stability": 0
  }},
  "maintenance_forecast": "",
  "service_interval_prediction": ""
}}

Respond ONLY with the JSON. No explanation text before or after."""

@api_router.post("/diagnose")
async def diagnose_vehicle(
    image: UploadFile = File(...),
    model_provider: str = Form("openai"),
    model_name: str = Form("gpt-5.2"),
    problem_category: str = Form("Vehicles and Engines"),
    current_user: dict = Depends(get_current_user),
):
    image_bytes = await image.read()
    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
    
    session_id = str(uuid.uuid4())
    system_prompt = get_dynamic_prompt(problem_category)
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_prompt
    )
    
    if model_provider == "openai":
        chat.with_model("openai", model_name or "gpt-5.2")
    elif model_provider == "gemini":
        chat.with_model("gemini", model_name or "gemini-3-flash-preview")
    elif model_provider == "anthropic":
        chat.with_model("anthropic", model_name or "claude-sonnet-4-5-20250929")
    
    image_content = ImageContent(image_base64=image_b64)
    user_message = UserMessage(
        text="Analyze this vehicle image. Provide a comprehensive diagnostic report following the exact JSON structure specified. Be thorough, precise, and authoritative.",
        file_contents=[image_content]
    )
    
    try:
        response = await chat.send_message(user_message)
        response_text = response.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        diagnostic_data = json.loads(response_text)
    except json.JSONDecodeError:
        diagnostic_data = {
            "vehicle_classification": {"type": "Unknown", "make_model_estimate": "Unable to parse", "confidence_percent": 0},
            "system_area": "General",
            "condition_summary": response if isinstance(response, str) else str(response),
            "detected_issues": [],
            "action_protocol": ["Resubmit image with better angle"],
            "repair_recommendation": "Please submit a clearer image for precise diagnosis.",
            "risk_status": "Restricted Operation",
            "estimated_cost_range_inr": {"min": 0, "max": 0},
            "health_index": {"engine_integrity": 0, "brake_reliability": 0, "electrical_stability": 0, "tyre_condition": 0, "overall_stability": 0},
            "maintenance_forecast": "Insufficient data",
            "service_interval_prediction": "N/A"
        }
    except Exception as e:
        logger.error(f"AI Diagnostic error: {e}")
        raise HTTPException(status_code=500, detail=f"Diagnostic analysis failed: {str(e)}")

    scan_id = str(uuid.uuid4())
    scan_doc = {
        "id": scan_id,
        "user_id": current_user["id"],
        "model_provider": model_provider,
        "model_name": model_name,
        "diagnostic": diagnostic_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.scan_history.insert_one(scan_doc)
    return {"scan_id": scan_id, "diagnostic": diagnostic_data}

# ──── Public Stats & Scans ────

@api_router.get("/public/stats")
async def get_public_stats():
    total_scans = await db.scan_history.count_documents({})
    total_parts = await db.spare_parts.count_documents({})
    return {"total_scans": total_scans, "total_parts": total_parts}

@api_router.get("/user/scans")
async def get_user_scans(current_user: dict = Depends(get_current_user)):
    scans = await db.scan_history.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return scans

@api_router.get("/scans/{scan_id}")
async def get_scan(scan_id: str, current_user: dict = Depends(get_current_user)):
    scan = await db.scan_history.find_one({"id": scan_id, "user_id": current_user["id"]}, {"_id": 0})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

# Include router & middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
