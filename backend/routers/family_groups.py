from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud, models, schemas
from database import get_db

router = APIRouter(
    prefix="/family-groups",
    tags=["family_groups"]
)

@router.post("/", response_model=schemas.FamilyGroup)
def create_family_group(family_group: schemas.FamilyGroupCreate, db: Session = Depends(get_db)):
    return crud.create_family_group(db=db, family_group=family_group)

@router.get("/{family_group_id}", response_model=schemas.FamilyGroup)
def read_family_group(family_group_id: int, db: Session = Depends(get_db)):
    db_family_group = crud.get_family_group(db, family_group_id=family_group_id)
    if db_family_group is None:
        raise HTTPException(status_code=404, detail="Family group not found")
    return db_family_group

@router.post("/{family_group_id}/members/{user_id}")
def add_member_to_family_group(family_group_id: int, user_id: int, db: Session = Depends(get_db)):
    # Verify family group exists
    db_family_group = crud.get_family_group(db, family_group_id=family_group_id)
    if db_family_group is None:
        raise HTTPException(status_code=404, detail="Family group not found")
    
    # Verify user exists
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = crud.add_member_to_family_group(db, family_group_id=family_group_id, user_id=user_id)
    if not result:
        raise HTTPException(status_code=400, detail="User is already a member or family group not found")
    return {"message": "Member added to family group successfully"}