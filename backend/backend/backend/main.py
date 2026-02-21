from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import uuid
from psycopg2.extras import Json
from jose import jwt, JWTError

from db import ensure_schema, get_connection
import auth
import ai

app = FastAPI()

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- JWT DEPENDENCY ----------
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, full_name, email, role, organization FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)


# ---------- SCHEMAS ----------

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    organization: str


class LoginRequest(BaseModel):
    email: str
    password: str


class PatientCreate(BaseModel):
    full_name: str
    phone: str
    age: int
    gender: str


class ClinicalRequest(BaseModel):
    symptoms: List[str]
    duration: str
    severity: str
    vitals: Dict[str, Any]
    notes: str


class AnalyzeVisitRequest(ClinicalRequest):
    patient_id: str
    doctor_id: str


@app.on_event("startup")
def initialize_database():
    ensure_schema()


# ---------- AUTH ----------

@app.post("/auth/register")
def register(data: RegisterRequest):
    conn = get_connection()
    cur = conn.cursor()

    hashed = auth.hash_password(data.password)

    try:
        cur.execute(
            """
            INSERT INTO users (id, full_name, email, password_hash, role, organization)
            VALUES (%s, %s, %s, %s, 'doctor', %s)
            """,
            (str(uuid.uuid4()), data.full_name, data.email, hashed, data.organization)
        )
        conn.commit()
    except Exception:
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        conn.close()

    return {"message": "Registration successful"}


@app.post("/auth/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE email = %s",
        (data.email,)
    )
    user = cur.fetchone()
    conn.close()

    if not user or not auth.verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_token(user["id"])
    return {
        "access_token": token,
        "user": {
            "id": user["id"],
            "full_name": user["full_name"]
        }
    }


# ---------- PATIENTS ----------

@app.get("/patients")
def get_patients(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, health_id, full_name, phone FROM patients")
    patients = cur.fetchall()

    conn.close()
    return {"patients": patients}


@app.post("/patients")
def create_patient(data: PatientCreate, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    patient_id = str(uuid.uuid4())
    health_id = f"CAX-{uuid.uuid4().hex[:6]}"

    cur.execute(
        """
        INSERT INTO patients (id, health_id, full_name, phone, age, gender)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (patient_id, health_id, data.full_name, data.phone, data.age, data.gender)
    )
    conn.commit()
    conn.close()

    return {
        "patient_id": patient_id,
        "health_id": health_id
    }


# ---------- CURRENT USER ----------

@app.get("/users/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


# ---------- DASHBOARD ----------

@app.get("/dashboard/stats")
def dashboard_stats(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) AS count FROM patients")
        patients = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM visits")
        consults = cur.fetchone()["count"]

        # "pending" = visits without an ai_analysis row
        cur.execute(
            """
            SELECT COUNT(*) AS count
            FROM visits v
            LEFT JOIN ai_analysis a ON a.visit_id = v.id
            WHERE a.id IS NULL
            """
        )
        pending = cur.fetchone()["count"]

        # "flags" = visits whose ai_analysis risk_level is 'High' or 'Critical'
        cur.execute(
            """
            SELECT COUNT(*) AS count
            FROM ai_analysis
            WHERE LOWER(risk_level) IN ('high', 'critical')
            """
        )
        flags = cur.fetchone()["count"]

        return {
            "patients": patients,
            "consults": consults,
            "pending": pending,
            "flags": flags,
        }
    finally:
        conn.close()


# ---------- VISITS ----------

@app.get("/visits/recent")
def recent_visits(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT
                v.id        AS visit_id,
                p.full_name AS patient_name,
                p.health_id AS health_id,
                v.created_at::text AS date,
                COALESCE(a.risk_level, 'Pending') AS risk_level,
                COALESCE(a.summary, '')            AS summary
            FROM visits v
            JOIN patients p ON p.id = v.patient_id
            LEFT JOIN ai_analysis a ON a.visit_id = v.id
            ORDER BY v.created_at DESC
            LIMIT 10
            """
        )
        rows = cur.fetchall()
        return {"visits": [dict(r) for r in rows]}
    finally:
        conn.close()


# ---------- AI ANALYSIS ----------

@app.post("/visits/analyze")
def analyze_visit(data: AnalyzeVisitRequest, current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id FROM patients WHERE id = %s", (data.patient_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Patient not found")

        cur.execute("SELECT id FROM users WHERE id = %s", (data.doctor_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Doctor not found")

        visit_id = str(uuid.uuid4())
        cur.execute(
            """
            INSERT INTO visits (id, patient_id, doctor_id)
            VALUES (%s, %s, %s)
            """,
            (visit_id, data.patient_id, data.doctor_id)
        )

        # Save clinical inputs
        cur.execute(
            """
            INSERT INTO clinical_inputs
            (id, visit_id, symptoms, duration, severity, vitals, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                str(uuid.uuid4()),
                visit_id,
                Json(data.symptoms),
                data.duration,
                data.severity,
                Json(data.vitals),
                data.notes
            )
        )

        # Fetch patient history
        cur.execute(
            """
            SELECT a.*
            FROM ai_analysis a
            JOIN visits v ON a.visit_id = v.id
            WHERE v.patient_id = %s
            ORDER BY a.created_at DESC
            LIMIT 5
            """,
            (data.patient_id,)
        )
        history = cur.fetchall()

        # AI call
        clinical_payload = data.model_dump(exclude={"patient_id", "doctor_id"})
        ai_result = ai.analyze_case(clinical_payload, history)

        # Save AI result
        cur.execute(
            """
            INSERT INTO ai_analysis
            (id, visit_id, probable_causes, risk_level,
             specialist_recommendation, summary, confidence_score)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                str(uuid.uuid4()),
                visit_id,
                Json(ai_result["probable_causes"]),
                ai_result["risk_level"],
                ai_result["specialist_recommendation"],
                ai_result["summary"],
                ai_result["confidence_score"]
            )
        )

        conn.commit()
        return {"visit_id": visit_id, **ai_result}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as exc:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to analyze visit: {exc}") from exc
    finally:
        conn.close()
