from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List
import uuid
from psycopg2.extras import Json

from db import ensure_schema, get_connection
import auth
import ai

app = FastAPI()


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
def get_patients():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, health_id, full_name, phone FROM patients")
    patients = cur.fetchall()

    conn.close()
    return {"patients": patients}


@app.post("/patients")
def create_patient(data: PatientCreate):
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


# ---------- VISITS ----------

# ---------- AI ANALYSIS ----------

@app.post("/visits/analyze")
def analyze_visit(data: AnalyzeVisitRequest):
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
