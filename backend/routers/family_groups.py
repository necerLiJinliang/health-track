import os
import sys
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud
import models
import schemas
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
    # print(111111, user_members)
    family_groups = [m.family_group for m in user_members]
    # family_groups_expanded = []
    # for fg in family_groups:
    #     group_members = fg.family_group_members
    #     members_info = []
    #     for member in group_members:
    #         user = crud.get_user(db, user_id=member.user_id)
    #         members_info.append(
    #             {
    #                 "id": user.id,
    #                 "name": user.name,
    #                 "role": member.role,
    #                 "joined_at": member.joined_at,
    #             }
    #         )
    #     fg_dict = fg.__dict__
    #     fg_dict["members"] = members_info
    #     family_groups_expanded.append(fg_dict)
    # family_groups = family_groups_expanded
    # db_family_groups = crud.get_family_groups_by_user_id(db, user_id=user_id)
    return family_groups


@router.get("/{family_group_id}/members")
def get_family_group_memebers(family_group_id: int, db: Session = Depends(get_db)):
    members = crud.get_family_members(db, family_group_id)
    return members


@router.post("/{family_group_id}/members")
def add_member_to_family_group(
    family_group_id: int,
    payload: dict,
    db: Session = Depends(get_db),
):
    # Verify family group exists
    db_family_group = crud.get_family_group_by_id(db, family_group_id=family_group_id)
    if db_family_group is None:
        raise HTTPException(status_code=404, detail="Family group not found")

    # Extract fields from JSON body
    role = payload.get("role", "member")
    user_id = payload.get("user_id")
    email = payload.get("email")
    phone_number = payload.get("phone_number")
    # print("user_name", user_name, user_id, email, phone_number)
    # Resolve user by user_id or email or phone
    db_user = None
    # if user_id is not None:
    #     db_user = crud.get_user(db, user_id=user_id)
    #     if db_user is None:
    #         raise HTTPException(status_code=404, detail="User not found")
    if email:
        db_email = (
            db.query(models.Email).filter(models.Email.email_address == email).first()
        )
        if not db_email or not db_email.users:
            raise HTTPException(
                status_code=404, detail="User not found for given email"
            )
        db_user = db_email.users[0]
    elif phone_number:
        db_user = crud.get_user_by_phone_number(db, phone_number=phone_number)
        if not db_user:
            raise HTTPException(
                status_code=404, detail="User not found for given phone number"
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide one of: user_id, email, or phone_number",
        )

    # Add member to family group
    result = crud.add_member_to_family_group(
        db,
        family_group_id=family_group_id,
        user_id=db_user.id,
        role=role,
        user_name=db_user.name,
    )
    if not result:
        raise HTTPException(
            status_code=400, detail="User is already a member or family group not found"
        )

    return {
        "message": "Member added to family group successfully",
        "user_id": db_user.id,
        "role": role,
    }


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


@router.delete("/{family_group_id}/members/{user_id}")
def remove_member_from_family_group(
    family_group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    # Verify family group exists
    db_family_group = crud.get_family_group_by_id(db, family_group_id=family_group_id)
    if db_family_group is None:
        raise HTTPException(status_code=404, detail="Family group not found")

    # Find membership record
    membership = (
        db.query(models.FamilyGroupMember)
        .filter(
            models.FamilyGroupMember.user_id == user_id,
            models.FamilyGroupMember.family_group_id == family_group_id,
        )
        .first()
    )
    if membership is None:
        raise HTTPException(status_code=404, detail="Family group member not found")

    # Delete membership
    db.delete(membership)
    db.commit()
    db.refresh(membership)

    return {
        "message": "Member removed from family group successfully",
        "member_id": member_id,
    }
