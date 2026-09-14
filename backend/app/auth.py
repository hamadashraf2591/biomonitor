# auth.py
from datetime import datetime, timedelta
from jose import jwt, JWTError
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# ========= CONFIG =========
SECRET_KEY = "biomonitor_super_secret_key_2026_change_me"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120  # 2 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ========= PASSWORD HELPERS (direct bcrypt) =========
def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def verify_password(plain: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed)


# ========= HARDCODED ADMIN =========
# Username: admin  |  Password: admin123
FAKE_USER = {
    "username": "admin",
    "full_name": "Dr. Admin",
    "hashed_password": hash_password("admin123"),
}


def authenticate_user(username: str, password: str):
    if username != FAKE_USER["username"]:
        return None
    if not verify_password(password, FAKE_USER["hashed_password"]):
        return None
    return FAKE_USER


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return {"username": username}