from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models import User
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from db import SessionLocal, engine
from models import User


SECRET_KEY = "bd9a0e81d7cadf2140e163e2f895fcb004ef7a2991ecd40a2cf64f4860137edb"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24*60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserCreate(BaseModel):
    email:str
    password:str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(db:Session, email:str):
    return db.query(User).filter(User.email==email).first()

def create_user(db:Session, user:UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    return "User created"

def get_db():
    database = SessionLocal()
    try:
        yield database
    finally:
        database.close

def authenticate_user(email:str, password:str, db:Session):
    user = db.query(User).filter(User.email==email).first()
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(data:dict, expires_delta:timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp":expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token:str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email:str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token is invalid or has expired")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token is invalid or has expired")

def decode_token(token):
    decoded = jwt.decode(token, SECRET_KEY)
    email = decoded['sub']
    return email

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    print({"token":token})
    email = decode_token(token)
    print({"email":email})
    return email
