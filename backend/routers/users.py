from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud, models, schemas
from database import get_db

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreateWithPassword, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_health_id(db, health_id=user.health_id)
    if db_user:
        raise HTTPException(status_code=400, detail="User with this health ID already exists")
    return crud.create_user_with_password(db=db, user=user)

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id=user_id, user_update=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("/{user_id}/emails/", response_model=schemas.Email)
def add_email_to_user(user_id: int, email: schemas.EmailCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_email = crud.get_email_by_address(db, email_address=email.email_address)
    if not db_email:
        db_email = crud.create_email(db=db, email=email)
    
    if db_email not in db_user.emails:
        db_user.emails.append(db_email)
        db.commit()
    
    return db_email

@router.post("/{user_id}/providers/{provider_id}")
def associate_provider_with_user(user_id: int, provider_id: int, db: Session = Depends(get_db)):
    result = crud.associate_provider_with_user(db, user_id=user_id, provider_id=provider_id)
    if not result:
        raise HTTPException(status_code=404, detail="User or provider not found, or association already exists")
    return {"message": "Provider associated with user successfully"}

@router.delete("/{user_id}/providers/{provider_id}")
def dissociate_provider_from_user(user_id: int, provider_id: int, db: Session = Depends(get_db)):
    result = crud.dissociate_provider_from_user(db, user_id=user_id, provider_id=provider_id)
    if not result:
        raise HTTPException(status_code=404, detail="User or provider not found, or association does not exist")
    return {"message": "Provider dissociated from user successfully"}

@router.put("/{user_id}/primary-provider/{provider_id}")
def set_primary_provider(user_id: int, provider_id: int, db: Session = Depends(get_db)):
    result = crud.set_primary_provider(db, user_id=user_id, provider_id=provider_id)
    if not result:
        raise HTTPException(status_code=404, detail="User or provider not found")
    return {"message": "Primary provider set successfully"}