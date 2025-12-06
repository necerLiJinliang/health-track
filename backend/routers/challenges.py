import os
import sys
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import schema

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud
import models
import schemas
from database import get_db

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.post("/", response_model=schemas.Challenge)
def create_challenge(
    challenge: schemas.ChallengeCreate, creator_id: int, db: Session = Depends(get_db)
):
    print(challenge)
    # Verify creator exists
    db_user = crud.get_user(db, user_id=creator_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Creator user not found")

    return crud.create_challenge(db=db, challenge=challenge, creator_id=creator_id)


@router.get("/{challenge_id}", response_model=schemas.Challenge)
def read_challenge(challenge_id: int, db: Session = Depends(get_db)):
    db_challenge = crud.get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return db_challenge


@router.get("/user/{user_id}", response_model=schemas.Challenge)
def read_user_challenge(user_id: int, db: Session = Depends(get_db)):
    db_challenge = crud.get_challenge_by_user(db, user_id=user_id)
    if db_challenge is None:
        raise HTTPException(status_code=404, detail="Challenge for user not found")
    return db_challenge


@router.get("/", response_model=List[schemas.Challenge])
def read_challenges(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    challenges = crud.get_challenges(db, skip=skip, limit=limit)
    return challenges


@router.post("/{challenge_id}/participants/{user_id}")
def add_participant_to_challenge(
    challenge_id: int, user_id: int, db: Session = Depends(get_db)
):
    # Verify challenge exists
    db_challenge = crud.get_challenge(db, challenge_id=challenge_id)
    if db_challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Verify user exists
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    result = crud.add_participant_to_challenge(
        db, challenge_id=challenge_id, user_id=user_id
    )
    if not result:
        raise HTTPException(
            status_code=400,
            detail="User is already a participant or challenge not found",
        )
    return {"message": "Participant added to challenge successfully"}
