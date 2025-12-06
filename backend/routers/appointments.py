from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/", response_model=schemas.Appointment)
def create_appointment(
    appointment: schemas.AppointmentCreate, user_id: int, db: Session = Depends(get_db)
):
    print("appointment", appointment, user_id)
    # Verify user exists
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify provider exists
    db_provider = crud.get_provider(db, provider_id=appointment.provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")

    try:
        return crud.create_appointment(db=db, appointment=appointment, user_id=user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{appointment_id}", response_model=schemas.Appointment)
def read_appointment(appointment_id: int, db: Session = Depends(get_db)):
    db_appointment = crud.get_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment


@router.get("/", response_model=List[schemas.Appointment])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    appointments = crud.get_appointments(db, skip=skip, limit=limit)
    return appointments


@router.get("/user/{user_id}", response_model=List[schemas.Appointment])
def read_user_appointments(user_id: int, db: Session = Depends(get_db)):
    # Verify user exists
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    appointments = crud.get_user_appointments(db, user_id=user_id)
    return appointments


@router.put("/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int, reason: dict, db: Session = Depends(get_db)
):
    result = crud.cancel_appointment(
        db, appointment_id=appointment_id, reason=reason["reason"]
    )
    if not result:
        raise HTTPException(
            status_code=404, detail="Appointment not found or already cancelled"
        )
    return {"message": "Appointment cancelled successfully"}


# @router.post("/{appointment_id}/", response_model=schemas.Appointment)
# def reschedule_appointment(
#     appointment_id: int,
#     appointment: schemas.AppointmentReschedule,
#     db: Session = Depends(get_db),
# ):
#     result = crud.reschedule_appointment(
#         db, appointment_id=appointment_id, appointment=appointment
#     )
#     if not result:
#         raise HTTPException(
#             status_code=404, detail="Appointment not found or cannot be rescheduled"
#         )
#     return {"message": "Appointment rescheduled successfully"}
