import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        sslmode="require",
        cursor_factory=RealDictCursor
    )


def ensure_schema():
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT CHECK (role IN ('doctor')),
                organization TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS patients (
                id UUID PRIMARY KEY,
                health_id TEXT UNIQUE NOT NULL,
                full_name TEXT,
                phone TEXT,
                age INTEGER,
                gender TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS visits (
                id UUID PRIMARY KEY,
                patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
                doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS clinical_inputs (
                id UUID PRIMARY KEY,
                visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
                symptoms JSONB,
                duration TEXT,
                severity TEXT,
                vitals JSONB,
                notes TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS ai_analysis (
                id UUID PRIMARY KEY,
                visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
                probable_causes JSONB,
                risk_level TEXT,
                specialist_recommendation TEXT,
                summary TEXT,
                confidence_score NUMERIC(3,2),
                created_at TIMESTAMP DEFAULT NOW()
            );
            """
        )

        conn.commit()
    finally:
        conn.close()
