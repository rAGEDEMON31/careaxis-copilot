from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from jose import jwt
from datetime import datetime, timedelta
import os

# bcrypt truncates passwords after 72 bytes; pbkdf2_sha256 does not.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str):
    try:
        return pwd_context.verify(password, hashed)
    except (ValueError, UnknownHashError):
        return False


def create_token(user_id: str):
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(hours=6)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
