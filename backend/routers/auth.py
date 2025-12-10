import os
import sys
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta

from jose import JWTError, jwt

import crud
import schemas
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

# Secret key for JWT token generation (in production, use environment variables)
SECRET_KEY = "healthtrack_secret_key_for_jwt_tokens"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class Token(schemas.BaseModel):
    access_token: str
    token_type: str


class TokenData(schemas.BaseModel):
    phone_number: Optional[str] = None


class LoginRequest(schemas.BaseModel):
    phone_number: str  # Using phone number for login
    password: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise credentials_exception
        token_data = TokenData(phone_number=phone_number)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_phone_number(db, phone_number=token_data.phone_number)
    if user is None:
        raise credentials_exception
    return user


@router.post("/login", response_model=Token)
def login_for_access_token(login_request: LoginRequest, db: Session = Depends(get_db)):
    # Using phone number for login
    user = crud.authenticate_user(
        db, login_request.phone_number, login_request.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.phone_number}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    # In a real application, you might want to invalidate the token
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: Annotated[schemas.User, Depends(get_current_user)]):
    return current_user
