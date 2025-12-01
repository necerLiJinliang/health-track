from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/family_groups", tags=["family_groups"])


@router.post("/{user_id}", response_model=schemas.FamilyGroup)
def create_family_group(
    family_group: schemas.FamilyGroupCreate, user_id: int, db: Session = Depends(get_db)
):
    # crate family member
    family_group = crud.create_family_group(
        db=db, family_group=family_group, owner_id=user_id
    )
    family_member = models.FamilyGroupMember(
        family_group_id=family_group.id, user_id=user_id, role="admin"
    )
    db.add(family_member)
    db.commit()
    db.refresh(family_member)
    return family_group


@router.get("/", response_model=List[schemas.FamilyGroup])
def read_family_groups(db: Session = Depends(get_db)):
    return crud.get_family_groups(db)


@router.get("/{family_group_id}", response_model=schemas.FamilyGroup)
def read_family_group(family_group_id: int, db: Session = Depends(get_db)):
    db_family_group = crud.get_family_group_by_id(db, family_group_id=family_group_id)
    if db_family_group is None:
        raise HTTPException(status_code=404, detail="Family group not found")
    return db_family_group


@router.get("/user/{user_id}", response_model=List[schemas.FamilyGroup])
def read_family_groups_by_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user_members = db_user.family_group_memberships
    family_groups = [m.family_group for m in user_members]

    # db_family_groups = crud.get_family_groups_by_user_id(db, user_id=user_id)
    return family_groups


@router.post("/{family_group_id}/members/{user_id}")
def add_member_to_family_group(
    family_group_id: int,
    user_id: int,
    role: str = "member",
    db: Session = Depends(get_db),
):
    # Verify family group exists
    db_family_group = crud.get_family_group_by_id(db, family_group_id=family_group_id)
    if db_family_group is None:
        raise HTTPException(status_code=404, detail="Family group not found")

    # Verify user exists
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    result = crud.add_member_to_family_group(
        db, family_group_id=family_group_id, user_id=user_id, role=role
    )
    if not result:
        raise HTTPException(
            status_code=400, detail="User is already a member or family group not found"
        )
    return {"message": "Member added to family group successfully"}


@router.get("/users/by-email/{email}")
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    # Find user by email
    db_email = (
        db.query(models.Email).filter(models.Email.email_address == email).first()
    )
    if not db_email:
        raise HTTPException(status_code=404, detail="User not found for given email")
    # Get the first user associated with this email
    user = db_email.users[0] if db_email.users else None
    if not user:
        raise HTTPException(status_code=404, detail="User not found for given email")
    return user


@router.get("/users/by-phone/{phone_number}")
def get_user_by_phone(phone_number: str, db: Session = Depends(get_db)):
    # Find user by phone number
    user = crud.get_user_by_phone_number(db, phone_number=phone_number)
    if not user:
        raise HTTPException(
            status_code=404, detail="User not found for given phone number"
        )
    return user
