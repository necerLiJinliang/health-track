from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/invitations", tags=["invitations"])


@router.post("/", response_model=schemas.Invitation)
def create_invitation(
    invitation: schemas.InvitationCreate, sender_id: int, db: Session = Depends(get_db)
):
    # Verify sender exists
    db_user = crud.get_user(db, user_id=sender_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Sender user not found")

    return crud.create_invitation(db=db, invitation=invitation, sender_id=sender_id)


@router.get("/{invitation_id}", response_model=schemas.Invitation)
def read_invitation(invitation_id: int, db: Session = Depends(get_db)):
    db_invitation = crud.get_invitation(db, invitation_id=invitation_id)
    if db_invitation is None:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return db_invitation


@router.get("/user/{user_id}", response_model=List[schemas.Invitation])
def get_user_invitations(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user_invitations(db, user_id=user_id)


@router.put("/{invitation_id}/accept")
def accept_invitation(invitation_id: int, db: Session = Depends(get_db)):
    result = crud.accept_invitation(db, invitation_id=invitation_id)
    if not result:
        raise HTTPException(
            status_code=400, detail="Invitation not found, already accepted, or expired"
        )
    return {"message": "Invitation accepted successfully"}


@router.put("/{invitation_id}/reject")
def reject_invitation(invitation_id: int, db: Session = Depends(get_db)):
    result = crud.reject_invitation(db, invitation_id=invitation_id)
    if not result:
        raise HTTPException(
            status_code=400, detail="Invitation not found, already accepted, or expired"
        )
    return {"message": "Invitation rejected successfully"}
